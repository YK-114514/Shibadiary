const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const passport = require('passport')
const cors = require('cors')
const path = require('path')
const compression = require('compression')
const http = require('http')

// 创建HTTP服务器
const server = http.createServer(app)

// 创建Socket.IO服务器
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

// 导出Socket.IO实例供其他模块使用
app.set('io', io)

// 存储在线用户
const onlineUsers = new Map()

// Socket.IO 连接处理
io.on('connection', (socket) => {
    console.log('用户连接:', socket.id)
    
    // 用户登录时加入房间
    socket.on('userLogin', (userId) => {
        onlineUsers.set(socket.id, userId)
        socket.userId = userId
        socket.join(`user_${userId}`)
        console.log(`用户 ${userId} 已连接`)
        
        // 广播用户上线状态
        socket.broadcast.emit('userOnline', { userId: userId })
    })
    
    // 处理新消息通知
    socket.on('newMessage', (data) => {
        const { targetUserId, message, senderId, senderName, type } = data
        
        // 发送给目标用户
        io.to(`user_${targetUserId}`).emit('messageReceived', {
            senderId,
            senderName,
            message,
            type,
            timestamp: new Date()
        })
        
        console.log(`消息发送: ${senderName} -> 用户${targetUserId}`)
    })
    
    // 处理新评论通知
    socket.on('newComment', (data) => {
        const { postId, commentId, commenterId, commenterName, postOwnerId } = data
        
        // 发送给帖子作者
        io.to(`user_${postOwnerId}`).emit('commentReceived', {
            postId,
            commentId,
            commenterId,
            commenterName,
            timestamp: new Date()
        })
        
        console.log(`评论通知: ${commenterName} 评论了帖子 ${postId}`)
    })
    
    // 处理点赞通知
    socket.on('newLike', (data) => {
        const { postId, likerId, likerName, postOwnerId, action } = data
        
        // 发送给帖子作者
        io.to(`user_${postOwnerId}`).emit('likeReceived', {
            postId,
            likerId,
            likerName,
            action, // 'like' 或 'unlike'
            timestamp: new Date()
        })
        
        console.log(`点赞通知: ${likerName} ${action}了帖子 ${postId}`)
    })
    
    // 处理关注通知
    socket.on('newFollow', (data) => {
        const { followerId, followerName, followingId, action } = data
        
        // 发送给被关注用户
        io.to(`user_${followingId}`).emit('followReceived', {
            followerId,
            followerName,
            action, // 'follow' 或 'unfollow'
            timestamp: new Date()
        })
        
        console.log(`关注通知: ${followerName} ${action}了用户 ${followingId}`)
    })
    
    // 处理用户离线
    socket.on('disconnect', () => {
        if (socket.userId) {
            onlineUsers.delete(socket.id)
            console.log(`用户 ${socket.userId} 已断开连接`)
            // 广播用户离线状态
            socket.broadcast.emit('userOffline', { userId: socket.userId })
        }
    })
})

// 引入路由
const user = require('./routes/api/user')
const posts = require('./routes/api/posts')
const personal = require('./routes/api/personal')
const viewRouter = require('./routes/viewRouters')
const accounts = require('./routes/api/accounts')
const message = require('./routes/api/message')

// 设置Socket.IO实例到posts路由
posts.setSocketIO(io)

// 启用gzip压缩
app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        // 不压缩图片文件
        if (req.path.match(/\.(jpg|jpeg|png|gif|webp|bmp|tiff|ico|svg)$/i)) {
            return false;
        }
        
        // 不压缩uploads目录下的文件
        if (req.path.startsWith('/uploads/')) {
            return false;
        }
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}))

// 引入自定义静态文件中间件
const { createStaticFileMiddleware } = require('./static-file-middleware');

// 引入简化的图片中间件
const { 
    createSimpleImageMiddleware, 
    createImageStatusMiddleware, 
    createImageErrorMiddleware 
} = require('./simple-image-middleware');

// 引入图片优化中间件
const ImageOptimizationMiddleware = require('./image-optimization-middleware');
const imageOptimizer = new ImageOptimizationMiddleware();

// 引入优化的缓存中间件
const { createAPICache, createStaticCache, createUserCache } = require('./cache-middleware-optimized');

// 简化的静态文件服务配置 - 确保图片正常显示
// 1. 图片服务中间件（优先处理所有图片请求）
app.use(createSimpleImageMiddleware());

// 2. 上传文件服务
app.use('/uploads', createStaticCache(24 * 60 * 60 * 1000), createStaticFileMiddleware('uploads'));

// 3. 前端静态文件服务（包括图片、CSS、JS等）
app.use('/front-end', express.static(path.join(__dirname, 'front-end')));

// 4. 根目录静态文件服务（兜底）
app.use('/', express.static(path.join(__dirname)));

// 5. 图片路径别名（支持两种路径格式）
app.use('/images', express.static(path.join(__dirname, 'front-end/images')));

// 暂时禁用所有可能阻塞的中间件
// app.use(imageOptimizer.createPreloadMiddleware());
// app.use(imageOptimizer.createLazyLoadMiddleware());

// 使用cors做跨域申请
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true
}))

// 使用bodyparser中间件
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

// passport初始化
app.use(passport.initialize());
require('./config/passport')(passport)

// API路由 - 添加缓存优化
app.use('/api/user', createAPICache(2 * 60 * 1000), user)        // 2分钟缓存
app.use('/api/posts', createAPICache(1 * 60 * 1000), posts)      // 1分钟缓存
app.use('/api/personal', createAPICache(2 * 60 * 1000), personal) // 2分钟缓存
app.use('/api/accounts', createAPICache(5 * 60 * 1000), accounts) // 5分钟缓存
app.use('/api/message', createAPICache(30 * 1000), message)      // 30秒缓存

// 临时数据库修复路由
app.get('/fix-database', (req, res) => {
    const db = require('./database/index');
    
    console.log('开始修复数据库结构...');
    
    // 删除avatar列
    db.query('ALTER TABLE post_infom DROP COLUMN IF EXISTS avatar', (err, result) => {
        if (err) {
            console.error('删除avatar列失败:', err.message);
        } else {
            console.log('✅ avatar列删除成功');
        }
        
        // 删除name列
        db.query('ALTER TABLE post_infom DROP COLUMN IF EXISTS name', (err2, result2) => {
            if (err2) {
                console.error('删除name列失败:', err2.message);
            } else {
                console.log('✅ name列删除成功');
            }
            
            // 查看修改后的表结构
            db.query('DESCRIBE post_infom', (err3, result3) => {
                if (err3) {
                    console.error('查看表结构失败:', err3.message);
                    res.json({ success: false, error: err3.message });
                } else {
                    console.log('\n修改后的post_infom表结构:');
                    console.log(result3);
                    console.log('\n🎉 数据库结构修复完成！');
                    res.json({ 
                        success: true, 
                        message: '数据库结构修复完成',
                        tableStructure: result3 
                    });
                }
            });
        });
    });
});

// 静态文件中间件（放在API路由之后）
app.use(express.static(path.join(__dirname, 'front-end')));
app.use(express.static(path.join(__dirname))); // 添加根目录静态文件服务

// 注册页面路由（放在API路由之后）
app.use('/', viewRouter);

// 添加图片错误处理中间件（放在所有路由之后）
app.use(createImageErrorMiddleware());

// 设置端口
const port = process.env.PORT || 3000

// 使用HTTP服务器启动（支持WebSocket）
server.listen(port, '0.0.0.0', () => {
    console.log(`服务器运行在端口 ${port}`)
    console.log(`WebSocket 服务器已启动`)
    console.log(`监听地址: 0.0.0.0:${port}`)
})
