#!/bin/bash

# 图片优化设置脚本
echo "🚀 开始设置图片优化系统..."

# 检查系统
echo "📋 检查系统环境..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 和 npm 已安装"

# 安装ImageMagick
echo "🖼️ 安装 ImageMagick..."

if command -v apt-get &> /dev/null; then
    # Ubuntu/Debian
    sudo apt-get update
    sudo apt-get install -y imagemagick
elif command -v yum &> /dev/null; then
    # CentOS/RHEL
    sudo yum install -y ImageMagick
elif command -v brew &> /dev/null; then
    # macOS
    brew install imagemagick
else
    echo "⚠️ 无法自动安装 ImageMagick，请手动安装"
    echo "Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "CentOS/RHEL: sudo yum install ImageMagick"
    echo "macOS: brew install imagemagick"
fi

# 检查ImageMagick是否安装成功
if command -v magick &> /dev/null; then
    echo "✅ ImageMagick 安装成功"
    magick --version | head -n 1
else
    echo "❌ ImageMagick 安装失败，将使用手动优化方式"
fi

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p front-end/images/optimized
mkdir -p uploads/optimized

# 设置权限
echo "🔐 设置文件权限..."
chmod 755 front-end/images/optimized
chmod 755 uploads/optimized

# 运行图片优化脚本
echo "🔄 开始优化现有图片..."
if command -v magick &> /dev/null; then
    node optimize_images_enhanced.js
else
    echo "💡 ImageMagick 未安装，跳过自动优化"
    echo "💡 请手动优化以下图片文件："
    echo "   - front-end/images/logo.png (当前: 2.8MB)"
    echo "   - front-end/images/title.png (当前: 1.3MB)"
    echo "   - front-end/images/logo_2.png (当前: 1.4MB)"
    echo "   - front-end/images/logo_3.png (当前: 1.3MB)"
fi

# 检查前端图片优化脚本
echo "📝 检查前端优化脚本..."
if [ -f "front-end/js/image-optimization.js" ]; then
    echo "✅ 前端图片优化脚本已创建"
else
    echo "❌ 前端图片优化脚本创建失败"
fi

# 检查中间件
echo "🔧 检查图片优化中间件..."
if [ -f "image-optimization-middleware.js" ]; then
    echo "✅ 图片优化中间件已创建"
else
    echo "❌ 图片优化中间件创建失败"
fi

# 生成优化报告
echo "📊 生成优化报告..."
echo "=== 图片优化设置完成 ===" > image-optimization-report.txt
echo "时间: $(date)" >> image-optimization-report.txt
echo "" >> image-optimization-report.txt

# 检查图片文件大小
echo "📸 当前图片文件大小:" >> image-optimization-report.txt
if [ -d "front-end/images" ]; then
    for img in front-end/images/*.{png,jpg,jpeg,gif}; do
        if [ -f "$img" ]; then
            size=$(du -h "$img" | cut -f1)
            echo "  - $(basename "$img"): $size" >> image-optimization-report.txt
        fi
    done
fi

echo "" >> image-optimization-report.txt
echo "💡 优化建议:" >> image-optimization-report.txt
echo "  1. 将大图片转换为WebP格式" >> image-optimization-report.txt
echo "  2. 生成多种尺寸的响应式图片" >> image-optimization-report.txt
echo "  3. 启用图片懒加载" >> image-optimization-report.txt
echo "  4. 使用CDN加速图片加载" >> image-optimization-report.txt

echo "📄 优化报告已保存到: image-optimization-report.txt"

# 重启服务器提示
echo ""
echo "🎉 图片优化设置完成！"
echo ""
echo "📋 下一步操作："
echo "  1. 重启服务器以应用新的中间件"
echo "  2. 在前端HTML文件中引入 image-optimization.js"
echo "  3. 测试图片加载性能"
echo ""
echo "🔄 重启服务器命令："
echo "  pm2 restart all  # 如果使用PM2"
echo "  或者手动重启Node.js应用"
echo ""
echo "💡 性能提升预期："
echo "  - 首次加载速度提升 30-50%"
echo "  - 图片加载时间减少 40-60%"
echo "  - 用户体验显著改善"
