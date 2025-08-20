#!/bin/bash

echo "🔧 快速数据库修复脚本"
echo "======================"

# 1. 检查MySQL服务状态
echo "📊 检查MySQL服务状态..."
if systemctl is-active --quiet mysql; then
    echo "✅ MySQL服务正在运行"
else
    echo "❌ MySQL服务未运行，正在启动..."
    sudo systemctl start mysql
    sleep 3
fi

# 2. 检查数据库连接
echo "🔌 检查数据库连接..."
mysql -u root -padmin123 -e "SELECT 1;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ 数据库连接正常"
else
    echo "❌ 数据库连接失败，请检查密码"
    exit 1
fi

# 3. 创建数据库（如果不存在）
echo "🗄️ 创建数据库..."
mysql -u root -padmin123 -e "CREATE DATABASE IF NOT EXISTS user_db;" 2>/dev/null
echo "✅ 数据库 user_db 已准备"

# 4. 导入数据库结构
echo "📋 导入数据库结构..."
if [ -f "user_db.sql" ]; then
    echo "使用现有的 user_db.sql 文件"
    mysql -u root -padmin123 user_db < user_db.sql
    echo "✅ 数据库结构导入完成"
else
    echo "使用 init_database.sql 文件"
    mysql -u root -padmin123 user_db < init_database.sql
    echo "✅ 数据库结构导入完成"
fi

# 5. 运行Node.js修复脚本
echo "🔧 运行Node.js修复脚本..."
node fix_database.js

# 6. 测试数据库查询
echo "🧪 测试数据库查询..."
mysql -u root -padmin123 user_db -e "SELECT COUNT(*) as total FROM post_infom;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ 数据库查询测试成功"
else
    echo "❌ 数据库查询测试失败"
fi

# 7. 重启应用
echo "🔄 重启应用..."
pm2 restart all

# 8. 检查服务状态
echo "📊 检查服务状态..."
sleep 3
pm2 status

echo ""
echo "🎉 数据库修复完成！"
echo "=================="
echo "📊 修复内容:"
echo "• MySQL服务状态检查"
echo "• 数据库连接测试"
echo "• 数据库结构导入"
echo "• 表结构修复"
echo "• 应用重启"
echo ""
echo "🚀 下一步操作:"
echo "1. 访问网站测试功能"
echo "2. 检查日志: pm2 logs"
echo "3. 如果还有问题，运行: node fix_database.js"
echo "" 