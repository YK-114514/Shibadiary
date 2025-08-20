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
    
    // 处理实时点赞数更新
    socket.on('likeCountUpdate', (data) => {
        const { postId, likeCount, isLiked } = data
        
        // 广播给所有在线用户
        io.emit('likeCountChanged', {
            postId,
            likeCount,
            isLiked,
            timestamp: new Date()
        })
    })
    
    // 处理新帖子通知
    socket.on('newPost', (data) => {
        const { post, authorId, authorName } = data
        
        // 广播给所有在线用户
        io.emit('postReceived', {
            post,
            authorId,
            authorName,
            timestamp: new Date()
        })
        
        console.log(`新帖子通知: ${authorName} 发布了新帖子`)
    })
    
    // 处理用户断开连接
    socket.on('disconnect', () => {
        const userId = onlineUsers.get(socket.id)
        if (userId) {
            onlineUsers.delete(socket.id)
            console.log(`用户 ${userId} 断开连接`)
            
            // 广播用户离线状态
            socket.broadcast.emit('userOffline', { userId: userId })
        }
    })
})

//引入路由
const user = require('./routes/api/user')
const posts = require('./routes/api/posts')
const personal = require('./routes/api/personal')
const viewRouter = require('./routes/viewRouters');
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
}));
// 导入SWR缓存中间件
const { swrCache, cacheUpdate, cacheCleanup, cacheStats } = require('./cache-middleware');

// 启动缓存清理
cacheCleanup();
// 缓存中间件
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        res.set('Cache-Control', `public, max-age=${duration}`);
        next();
    };
};
// 引入自定义静态文件中间件
const { createStaticFileMiddleware } = require('./static-file-middleware');

// 静态文件缓存策略
app.use('/uploads', cacheMiddleware(86400), createStaticFileMiddleware('uploads')); // 1天缓存，使用自定义中间件
app.use('/front-end/images', cacheMiddleware(604800), express.static(path.join(__dirname, 'front-end/images'))); // 7天缓存
app.use('/images', cacheMiddleware(604800), express.static(path.join(__dirname, 'front-end/images'))); // 7天缓存 - 添加/images路径映射
app.use('/front-end/css', cacheMiddleware(604800), express.static(path.join(__dirname, 'front-end/css'))); // 7天缓存
app.use('/css', cacheMiddleware(604800), express.static(path.join(__dirname, 'front-end/css'))); // 7天缓存 - 添加/css路径映射
app.use('/front-end/js', cacheMiddleware(604800), express.static(path.join(__dirname, 'front-end/js'))); // 7天缓存
app.use('/js', cacheMiddleware(604800), express.static(path.join(__dirname, 'front-end/js'))); // 7天缓存 - 添加/js路径映射
app.use('/http.js', cacheMiddleware(604800), express.static(path.join(__dirname, 'front-end/http.js'))); // 7天缓存 - 添加/http.js路径映射

//使用cors做跨域申请
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true
}))

//使用bodyparser中间件
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

//passport初始化
app.use(passport.initialize());
require('./config/passport')(passport)

// API路由（移除缓存以确保实时性）
// 应用SWR缓存中间件到只读API
app.use('/api', swrCache());
app.use('/api', cacheUpdate());
app.use('/api/user', user)
app.use('/api/posts', posts)
app.use('/api/personal', personal)
app.use('/api/accounts', accounts)
app.use('/api/message', message)
app.use('/api', cacheStats())

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

// 注册页面路由（放在API路由之后）
app.use('/', viewRouter);

//set port
const port = process.env.PORT || 3000

// 使用HTTP服务器启动（支持WebSocket）
server.listen(port, () => {
    console.log(`服务器运行在端口 ${port}`)
    console.log(`WebSocket 服务器已启动`)
})

