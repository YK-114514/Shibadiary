#!/bin/bash

echo "🚀 启动小柴日记项目服务器..."

# 检查是否有其他进程占用3000端口
echo "🔍 检查端口占用..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口3000已被占用，正在停止..."
    pkill -f "node.*app.js" || true
    sleep 2
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动服务器
echo "🌟 启动服务器..."
node app.js

echo "✅ 服务器已启动，访问 http://localhost:3000"
