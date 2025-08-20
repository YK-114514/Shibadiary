#!/bin/bash

echo "🚀 快速修复页面加载问题..."
echo "============================"

# 1. 检查服务状态
echo "📊 检查服务状态..."
pm2 status

# 2. 检查数据库连接
echo "🗄️ 检查数据库连接..."
mysql -u root -padmin123 -e "SELECT COUNT(*) as total FROM post_infom;" user_db 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ 数据库连接正常"
else
    echo "❌ 数据库连接失败，正在修复..."
    node fix_database.js
fi

# 3. 检查关键文件
echo "📁 检查关键文件..."
critical_files=(
    "front-end/views/index.html"
    "front-end/views/login.html"
    "front-end/views/register.html"
    "front-end/views/personal.html"
    "front-end/views/message.html"
    "front-end/css/index.min.css"
    "front-end/http.js"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - 文件不存在"
    fi
done

# 4. 优化路由配置
echo "🔧 优化路由配置..."
cat > routes/viewRouters_fixed.js << 'EOF'
const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// 错误处理函数
const handleFileError = (err, res, filePath) => {
    console.error('文件发送错误:', err);
    console.log('尝试访问的文件路径:', filePath);
    res.status(500).send('页面加载失败，请稍后重试');
};

// 文件存在性检查
const checkFileExists = (filePath, res) => {
    if (!fs.existsSync(filePath)) {
        console.error('文件不存在:', filePath);
        res.status(404).send('页面文件不存在');
        return false;
    }
    return true;
};

// 主页路由
router.get(['/', '/index', '/index/post', '/index/ask', '/index/friend', '/index/collect'], (req, res) => {
    const filePath = path.join(__dirname, '../front-end/views/index.html');
    if (checkFileExists(filePath, res)) {
        res.sendFile(filePath, (err) => {
            if (err) handleFileError(err, res, filePath);
        });
    }
});

// 登录页面
router.get('/login', (req, res) => {
    const filePath = path.join(__dirname, '../front-end/views/login.html');
    if (checkFileExists(filePath, res)) {
        res.sendFile(filePath, (err) => {
            if (err) handleFileError(err, res, filePath);
        });
    }
});

// 注册页面
router.get('/register', (req, res) => {
    const filePath = path.join(__dirname, '../front-end/views/register.html');
    if (checkFileExists(filePath, res)) {
        res.sendFile(filePath, (err) => {
            if (err) handleFileError(err, res, filePath);
        });
    }
});

// 个人页面
router.get('/personal', (req, res) => {
    const filePath = path.join(__dirname, '../front-end/views/personal.html');
    if (checkFileExists(filePath, res)) {
        res.sendFile(filePath, (err) => {
            if (err) handleFileError(err, res, filePath);
        });
    }
});

// 消息页面
router.get('/message', (req, res) => {
    const filePath = path.join(__dirname, '../front-end/views/message.html');
    if (checkFileExists(filePath, res)) {
        res.sendFile(filePath, (err) => {
            if (err) handleFileError(err, res, filePath);
        });
    }
});

// 账户页面
router.get('/accounts', (req, res) => {
    const filePath = path.join(__dirname, '../front-end/views/accounts.html');
    if (checkFileExists(filePath, res)) {
        res.sendFile(filePath, (err) => {
            if (err) handleFileError(err, res, filePath);
        });
    }
});

// 设置页面
router.get('/setting', (req, res) => {
    const filePath = path.join(__dirname, '../front-end/views/setting.html');
    if (checkFileExists(filePath, res)) {
        res.sendFile(filePath, (err) => {
            if (err) handleFileError(err, res, filePath);
        });
    }
});

// 帖子详情页
router.get('/post-detail/:id', (req, res) => {
    const filePath = path.join(__dirname, '../front-end/views/specific.html');
    if (checkFileExists(filePath, res)) {
        res.sendFile(filePath, (err) => {
            if (err) handleFileError(err, res, filePath);
        });
    }
});

// 404处理
router.get('*', (req, res) => {
    res.status(404).send('页面不存在');
});

module.exports = router;
EOF

echo "✅ 路由配置已优化"

# 5. 创建优化的应用配置
echo "⚙️ 创建优化的应用配置..."
cat > app_fixed.js << 'EOF'
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const http = require('http');

// 创建HTTP服务器
const server = http.createServer(app);

// 创建Socket.IO服务器
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 导出Socket.IO实例供其他模块使用
app.set('io', io);

// 存储在线用户
const onlineUsers = new Map();

// Socket.IO 连接处理
io.on('connection', (socket) => {
    console.log('用户连接:', socket.id);
    
    // 用户登录时加入房间
    socket.on('userLogin', (userId) => {
        onlineUsers.set(socket.id, userId);
        socket.userId = userId;
        socket.join(`user_${userId}`);
        console.log(`用户 ${userId} 已连接`);
        
        // 广播用户上线状态
        socket.broadcast.emit('userOnline', { userId: userId });
    });
    
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
        });
        
        console.log(`消息发送: ${senderName} -> 用户${targetUserId}`);
    });
    
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
        });
        
        console.log(`评论通知: ${commenterName} 评论了帖子 ${postId}`);
    });
    
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
        });
        
        console.log(`点赞通知: ${likerName} ${action}了帖子 ${postId}`);
    });
    
    // 处理关注通知
    socket.on('newFollow', (data) => {
        const { followerId, followerName, followingId, action } = data
        
        // 发送给被关注用户
        io.to(`user_${followingId}`).emit('followReceived', {
            followerId,
            followerName,
            action, // 'follow' 或 'unfollow'
            timestamp: new Date()
        });
        
        console.log(`关注通知: ${followerName} ${action}了用户 ${followingId}`);
    });
    
    // 用户断开连接
    socket.on('disconnect', () => {
        if (socket.userId) {
            onlineUsers.delete(socket.id);
            console.log(`用户 ${socket.userId} 已断开连接`);
            
            // 广播用户下线状态
            socket.broadcast.emit('userOffline', { userId: socket.userId });
        }
    });
});

// 请求日志中间件
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    
    next();
});

// 超时处理
app.use((req, res, next) => {
    req.setTimeout(10000, () => {
        console.error('请求超时:', req.path);
        res.status(408).json({ success: false, message: '请求超时' });
    });
    next();
});

// 启用gzip压缩
app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// 缓存中间件
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        res.set('Cache-Control', `public, max-age=${duration}`);
        next();
    };
};

// 静态文件缓存策略
app.use('/uploads', cacheMiddleware(86400), express.static('uploads')); // 1天缓存
app.use('/front-end/images', cacheMiddleware(604800), express.static(path.join(__dirname, 'front-end/images'))); // 7天缓存
app.use('/front-end/css', cacheMiddleware(604800), express.static(path.join(__dirname, 'front-end/css'))); // 7天缓存
app.use('/front-end/js', cacheMiddleware(604800), express.static(path.join(__dirname, 'front-end/js'))); // 7天缓存

// 跨域配置
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true
}));

// 中间件配置
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// passport初始化
app.use(passport.initialize());
require('./config/passport')(passport);

// 健康检查API
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// 导入路由模块
const user = require('./routes/api/user');
const posts = require('./routes/api/posts');
const personal = require('./routes/api/personal');
const viewRouter = require('./routes/viewRouters_fixed');
const accounts = require('./routes/api/accounts');
const message = require('./routes/api/message');

// 设置Socket.IO实例到posts路由
posts.setSocketIO(io);

// API路由
app.use('/api/user', user);
app.use('/api/posts', posts);
app.use('/api/personal', personal);
app.use('/api/accounts', accounts);
app.use('/api/message', message);

// 静态文件中间件
app.use(express.static(path.join(__dirname, 'front-end')));

// 页面路由
app.use('/', viewRouter);

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ 
        success: false, 
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 设置端口
const port = process.env.PORT || 3000;

// 启动服务器
server.listen(port, () => {
    console.log(`服务器运行在端口 ${port}`);
    console.log(`WebSocket 服务器已启动`);
});
EOF

echo "✅ 应用配置已优化"

# 6. 备份原文件
echo "📦 备份原文件..."
cp routes/viewRouters.js routes/viewRouters.js.backup
cp app.js app.js.backup

# 7. 使用修复版本
echo "🔄 使用修复版本..."
cp routes/viewRouters_fixed.js routes/viewRouters.js
cp app_fixed.js app.js

# 8. 重启服务
echo "🔄 重启服务..."
pm2 restart all

# 9. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 10. 检查服务状态
echo "📊 检查服务状态..."
pm2 status

# 11. 测试连接
echo "🧪 测试连接..."
curl -I http://localhost:3000/ 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ 服务启动成功"
else
    echo "❌ 服务启动失败"
fi

# 12. 测试健康检查
echo "🏥 测试健康检查..."
curl -s http://localhost:3000/health 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ 健康检查正常"
else
    echo "❌ 健康检查失败"
fi

echo ""
echo "🎉 修复完成！"
echo "=============="
echo "📊 修复内容:"
echo "• 优化了路由处理器"
echo "• 添加了文件存在性检查"
echo "• 改进了错误处理"
echo "• 添加了请求日志"
echo "• 添加了超时处理"
echo "• 优化了静态文件服务"
echo "• 添加了健康检查API"
echo ""
echo "🚀 下一步操作:"
echo "1. 访问网站测试功能"
echo "2. 检查日志: pm2 logs"
echo "3. 如果还有问题，运行: node diagnose_and_fix.js"
echo "" 