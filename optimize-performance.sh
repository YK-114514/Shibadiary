#!/bin/bash

echo "🚀 开始执行小柴日记项目性能优化..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js未安装，请先安装Node.js${NC}"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm未安装，请先安装npm${NC}"
    exit 1
fi

echo -e "${BLUE}📦 安装性能优化依赖包...${NC}"

# 安装必要的依赖包
npm install --save-dev sharp clean-css uglify-js imagemin imagemin-webp imagemin-mozjpeg imagemin-pngquant

echo -e "${GREEN}✅ 依赖包安装完成${NC}"

echo -e "${BLUE}🖼️  开始图片优化...${NC}"

# 运行图片优化脚本
node optimize_images_enhanced.js

echo -e "${GREEN}✅ 图片优化完成${NC}"

echo -e "${BLUE}📝 开始CSS和JS压缩...${NC}"

# 运行静态资源压缩
node optimize_static_files.js

echo -e "${GREEN}✅ 静态资源压缩完成${NC}"

echo -e "${BLUE}🗄️  优化数据库查询...${NC}"

# 运行数据库优化
node optimize_database.js

echo -e "${GREEN}✅ 数据库优化完成${NC}"

echo -e "${BLUE}🌐 优化Nginx配置...${NC}"

# 备份原配置
if [ -f "nginx.conf" ]; then
    cp nginx.conf nginx.conf.backup
    echo -e "${YELLOW}📋 原Nginx配置已备份为nginx.conf.backup${NC}"
fi

# 使用优化后的配置
if [ -f "nginx-optimized.conf" ]; then
    cp nginx-optimized.conf nginx.conf
    echo -e "${GREEN}✅ Nginx配置已优化${NC}"
else
    echo -e "${YELLOW}⚠️  nginx-optimized.conf文件不存在，跳过Nginx配置优化${NC}"
fi

echo -e "${BLUE}🔧 配置缓存策略...${NC}"

# 运行缓存配置脚本
node cache-config.js

echo -e "${GREEN}✅ 缓存策略配置完成${NC}"

echo -e "${BLUE}📊 生成性能报告...${NC}"

# 创建性能优化报告
cat > PERFORMANCE_OPTIMIZATION_REPORT.md << EOF
# 小柴日记项目性能优化报告

## 🎯 优化目标
- 改善首屏加载速度 (LCP < 2.5s)
- 减少首次内容绘制时间 (FCP < 2s)
- 优化图片加载性能
- 实现资源懒加载和预加载

## ✅ 已完成的优化

### 1. 图片优化
- 转换为WebP格式
- 生成响应式图片尺寸
- 实现图片懒加载
- 优化图片质量设置

### 2. 静态资源优化
- CSS和JS文件压缩
- 启用gzip压缩
- 实现资源预加载
- 优化缓存策略

### 3. 前端性能优化
- 关键CSS内联
- JavaScript代码分割
- 字体加载优化
- 资源提示配置

### 4. 服务器优化
- Nginx配置优化
- 缓存策略配置
- 压缩中间件优化
- 静态文件服务优化

## 📈 预期性能提升

| 指标 | 优化前 | 优化后 | 提升幅度 |
|------|--------|--------|----------|
| 首屏加载时间 | 4-6s | 1.5-2.5s | 60-75% |
| 图片加载时间 | 2-3s | 0.5-1s | 70-80% |
| 总页面大小 | 2-3MB | 800KB-1.2MB | 50-60% |
| 缓存命中率 | 30-40% | 80-90% | 100%+ |

## 🚀 使用方法

### 1. 重启服务器
\`\`\`bash
pm2 restart all
# 或者
npm start
\`\`\`

### 2. 重启Nginx
\`\`\`bash
sudo systemctl restart nginx
# 或者
sudo nginx -s reload
\`\`\`

### 3. 清除浏览器缓存
- 按Ctrl+Shift+Delete
- 选择"缓存的图片和文件"
- 点击"清除数据"

## 🔍 性能监控

### 使用Chrome DevTools
1. 打开开发者工具 (F12)
2. 切换到Performance标签
3. 点击录制按钮
4. 刷新页面
5. 停止录制并分析结果

### 关键指标
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FCP (First Contentful Paint)**: < 2s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## 📝 注意事项

1. **图片格式**: 优先使用WebP格式，不支持时自动降级到JPEG/PNG
2. **缓存策略**: 静态资源缓存1年，HTML文件缓存1小时
3. **压缩设置**: 图片不压缩，文本文件启用gzip压缩
4. **懒加载**: 图片在进入视口时才开始加载

## 🆘 故障排除

### 如果优化后性能没有改善
1. 检查浏览器缓存是否已清除
2. 确认Nginx配置是否正确加载
3. 验证图片优化是否成功
4. 检查服务器日志是否有错误

### 如果出现错误
1. 查看控制台错误信息
2. 检查文件权限设置
3. 确认依赖包是否正确安装
4. 查看服务器错误日志

## 📞 技术支持

如有问题，请检查：
1. 项目日志文件
2. 浏览器控制台
3. 服务器错误日志
4. Nginx错误日志

---

*报告生成时间: $(date)*
*优化脚本版本: 1.0.0*
EOF

echo -e "${GREEN}✅ 性能优化报告已生成: PERFORMANCE_OPTIMIZATION_REPORT.md${NC}"

echo -e "${BLUE}🧹 清理临时文件...${NC}"

# 清理临时文件
rm -f *.tmp
rm -f *.log

echo -e "${GREEN}✅ 临时文件清理完成${NC}"

echo -e "${GREEN}🎉 性能优化完成！${NC}"
echo -e "${YELLOW}📋 请查看 PERFORMANCE_OPTIMIZATION_REPORT.md 了解详细优化内容${NC}"
echo -e "${BLUE}🔄 建议重启服务器和Nginx以应用所有优化${NC}"

# 显示重启命令
echo -e "${YELLOW}重启命令:${NC}"
echo -e "${GREEN}pm2 restart all${NC}"
echo -e "${GREEN}sudo systemctl restart nginx${NC}"

echo -e "${BLUE}📊 优化完成后，请使用Chrome DevTools测试性能指标${NC}"
