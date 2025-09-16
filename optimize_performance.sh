#!/bin/bash

echo "🚀 开始执行小柴日记项目性能优化..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查MySQL是否运行
echo -e "${BLUE}📊 检查MySQL服务状态...${NC}"
if systemctl is-active --quiet mysql; then
    echo -e "${GREEN}✅ MySQL服务正在运行${NC}"
else
    echo -e "${RED}❌ MySQL服务未运行，请先启动MySQL${NC}"
    exit 1
fi

# 执行数据库优化
echo -e "${BLUE}🗄️ 执行数据库优化...${NC}"
mysql -u root -padmin123 user_db < optimize_database.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 数据库优化完成${NC}"
else
    echo -e "${YELLOW}⚠️ 数据库优化过程中出现警告，但继续执行${NC}"
fi

# 检查Node.js进程
echo -e "${BLUE}🔍 检查Node.js进程...${NC}"
NODE_PIDS=$(pgrep -f "node.*app.js")

if [ -n "$NODE_PIDS" ]; then
    echo -e "${YELLOW}⚠️ 发现运行中的Node.js进程，正在重启...${NC}"
    echo "进程ID: $NODE_PIDS"
    
    # 优雅关闭进程
    for pid in $NODE_PIDS; do
        echo "正在关闭进程 $pid..."
        kill -TERM $pid
        sleep 2
        
        # 如果进程仍在运行，强制关闭
        if kill -0 $pid 2>/dev/null; then
            echo "强制关闭进程 $pid..."
            kill -KILL $pid
        fi
    done
    
    echo -e "${GREEN}✅ 所有Node.js进程已关闭${NC}"
else
    echo -e "${GREEN}✅ 没有发现运行中的Node.js进程${NC}"
fi

# 清理缓存和临时文件
echo -e "${BLUE}🧹 清理缓存和临时文件...${NC}"
rm -rf node_modules/.cache 2>/dev/null
rm -rf .next 2>/dev/null
rm -rf dist 2>/dev/null
echo -e "${GREEN}✅ 缓存清理完成${NC}"

# 检查并安装依赖
echo -e "${BLUE}📦 检查项目依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️ 未发现node_modules目录，正在安装依赖...${NC}"
    npm install
else
    echo -e "${GREEN}✅ 依赖已安装${NC}"
fi

# 启动应用
echo -e "${BLUE}🚀 启动优化后的应用...${NC}"
echo -e "${YELLOW}提示: 应用将在后台运行，使用 'pm2 logs' 查看日志${NC}"

# 使用PM2启动（如果可用）
if command -v pm2 &> /dev/null; then
    echo "使用PM2启动应用..."
    pm2 start app.js --name "xiaochai-diary" --max-memory-restart 512M
    pm2 save
    echo -e "${GREEN}✅ 应用已通过PM2启动${NC}"
    echo "查看状态: pm2 status"
    echo "查看日志: pm2 logs xiaochai-diary"
else
    echo "PM2未安装，使用nohup启动..."
    nohup node app.js > server.log 2>&1 &
    echo -e "${GREEN}✅ 应用已在后台启动${NC}"
    echo "查看日志: tail -f server.log"
fi

# 等待应用启动
echo -e "${BLUE}⏳ 等待应用启动...${NC}"
sleep 5

# 检查应用状态
echo -e "${BLUE}🔍 检查应用状态...${NC}"
if pgrep -f "node.*app.js" > /dev/null; then
    echo -e "${GREEN}✅ 应用启动成功${NC}"
    
    # 测试应用响应
    echo -e "${BLUE}🧪 测试应用响应...${NC}"
    if command -v curl &> /dev/null; then
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
        if [ "$RESPONSE" = "200" ]; then
            echo -e "${GREEN}✅ 应用响应正常 (HTTP $RESPONSE)${NC}"
        else
            echo -e "${YELLOW}⚠️ 应用响应异常 (HTTP $RESPONSE)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ curl未安装，无法测试应用响应${NC}"
    fi
else
    echo -e "${RED}❌ 应用启动失败${NC}"
    echo "请检查日志文件获取详细信息"
    exit 1
fi

# 性能优化建议
echo -e "${BLUE}💡 性能优化建议:${NC}"
echo "1. 定期清理数据库日志和临时文件"
echo "2. 监控应用内存使用情况"
echo "3. 使用 'pm2 monit' 监控进程状态"
echo "4. 定期执行数据库优化脚本"
echo "5. 监控缓存命中率"

# 显示系统资源使用情况
echo -e "${BLUE}📊 当前系统资源使用情况:${NC}"
echo "内存使用:"
free -h | grep -E "Mem|Swap"
echo ""
echo "磁盘使用:"
df -h | grep -E "Filesystem|/$"
echo ""
echo "进程状态:"
ps aux | grep -E "node|mysql" | grep -v grep

echo -e "${GREEN}🎉 性能优化完成！${NC}"
echo -e "${BLUE}应用地址: http://localhost:3000${NC}"
echo -e "${BLUE}如需查看详细日志，请运行: pm2 logs 或 tail -f server.log${NC}"
