#!/bin/bash

echo "🔧 服务器修复脚本"
echo "=================="

# 1. 检查系统状态
echo "📊 检查系统状态..."
uptime
free -h
df -h

# 2. 检查服务状态
echo "🔍 检查服务状态..."
systemctl status nginx --no-pager
systemctl status mysql --no-pager
pm2 status

# 3. 检查端口监听
echo "🔌 检查端口监听..."
netstat -tlnp | grep -E ':(80|443|3000|22)'

# 4. 检查防火墙
echo "🔥 检查防火墙..."
ufw status
iptables -L -n

# 5. 重启关键服务
echo "🔄 重启服务..."
systemctl restart nginx
systemctl restart mysql
pm2 restart all

# 6. 检查服务是否正常启动
echo "✅ 验证服务状态..."
sleep 5
systemctl is-active nginx
systemctl is-active mysql
pm2 status

# 7. 检查端口是否开放
echo "🔍 检查端口开放状态..."
for port in 80 443 3000 22; do
    if netstat -tlnp | grep ":$port "; then
        echo "✅ 端口 $port 已开放"
    else
        echo "❌ 端口 $port 未开放"
    fi
done

# 8. 测试本地连接
echo "🌐 测试本地连接..."
curl -I http://localhost:80 2>/dev/null || echo "❌ 本地80端口连接失败"
curl -I http://localhost:3000 2>/dev/null || echo "❌ 本地3000端口连接失败"

# 9. 检查日志
echo "📋 检查错误日志..."
tail -n 20 /var/log/nginx/error.log
pm2 logs --lines 10

echo "🎯 修复完成！"
echo "如果仍有问题，请检查："
echo "1. 云服务器安全组设置"
echo "2. 网络配置"
echo "3. 域名解析" 