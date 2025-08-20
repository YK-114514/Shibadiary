
// 优化的应用配置
const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();

// 请求日志
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

// 启用压缩
app.use(compression());

// 静态文件
app.use('/front-end', express.static(path.join(__dirname, 'front-end'), {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

module.exports = app;
