const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 紧急图片优化 - 解决加载慢问题...');

// 检查是否安装了必要的工具
function checkDependencies() {
    try {
        execSync('which convert', { stdio: 'ignore' });
        console.log('✅ ImageMagick 已安装');
    } catch (error) {
        console.log('❌ 未安装 ImageMagick，尝试安装...');
        try {
            execSync('apt-get update && apt-get install -y imagemagick', { stdio: 'ignore' });
            console.log('✅ ImageMagick 安装成功');
        } catch (installError) {
            console.log('❌ ImageMagick 安装失败，使用 Node.js 方案');
            return false;
        }
    }
    return true;
}

// 使用 Node.js 优化图片（如果 ImageMagick 不可用）
async function optimizeImageNode(imagePath) {
    try {
        const sharp = require('sharp');
        const stats = fs.statSync(imagePath);
        const originalSize = (stats.size / 1024).toFixed(2);
        
        console.log(`处理: ${imagePath} (${originalSize}KB)`);
        
        const outputPath = imagePath.replace(/\.(\w+)$/, '.webp');
        
        // 根据图片类型选择优化策略
        const ext = path.extname(imagePath).toLowerCase();
        let sharpInstance = sharp(imagePath);
        
        if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            // 转换为 WebP，大幅压缩
            await sharpInstance
                .webp({ 
                    quality: 80,
                    effort: 6,
                    nearLossless: true
                })
                .toFile(outputPath);
        } else if (ext === '.gif') {
            // GIF 转换为 WebP 动画
            await sharpInstance
                .webp({ 
                    quality: 75,
                    effort: 6
                })
                .toFile(outputPath);
        }
        
        // 检查优化后的文件大小
        if (fs.existsSync(outputPath)) {
            const newStats = fs.statSync(outputPath);
            const newSize = (newStats.size / 1024).toFixed(2);
            const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
            
            console.log(`✅ 优化完成: ${originalSize}KB → ${newSize}KB (减少 ${reduction}%)`);
            
            // 如果优化效果很好，替换原文件
            if (newSize < originalSize * 0.7) {
                fs.unlinkSync(imagePath);
                fs.renameSync(outputPath, imagePath.replace(/\.(\w+)$/, '.webp'));
                console.log(`🔄 已替换原文件为 WebP 格式`);
            }
        }
        
    } catch (error) {
        console.error(`❌ 优化失败: ${imagePath}`, error.message);
    }
}

// 使用 ImageMagick 优化图片
function optimizeImageMagick(imagePath) {
    try {
        const stats = fs.statSync(imagePath);
        const originalSize = (stats.size / 1024).toFixed(2);
        
        console.log(`处理: ${imagePath} (${originalSize}KB)`);
        
        // 创建 WebP 版本
        const webpPath = imagePath.replace(/\.(\w+)$/, '.webp');
        
        // 根据图片类型选择优化参数
        const ext = path.extname(imagePath).toLowerCase();
        let convertParams = '';
        
        if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            convertParams = `-quality 80 -strip -define webp:lossless=false -define webp:method=6`;
        } else if (ext === '.gif') {
            convertParams = `-quality 75 -strip`;
        }
        
        execSync(`convert "${imagePath}" ${convertParams} "${webpPath}"`, { stdio: 'ignore' });
        
        // 检查优化后的文件大小
        if (fs.existsSync(webpPath)) {
            const newStats = fs.statSync(webpPath);
            const newSize = (newStats.size / 1024).toFixed(2);
            const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
            
            console.log(`✅ 优化完成: ${originalSize}KB → ${newSize}KB (减少 ${reduction}%)`);
            
            // 如果优化效果很好，替换原文件
            if (newSize < originalSize * 0.7) {
                fs.unlinkSync(imagePath);
                fs.renameSync(webpPath, imagePath.replace(/\.(\w+)$/, '.webp'));
                console.log(`🔄 已替换原文件为 WebP 格式`);
            }
        }
        
    } catch (error) {
        console.error(`❌ 优化失败: ${imagePath}`, error.message);
    }
}

// 生成响应式图片
function generateResponsiveImages(imagePath) {
    try {
        const sharp = require('sharp');
        const ext = path.extname(imagePath).toLowerCase();
        const baseName = imagePath.replace(ext, '');
        
        // 生成不同尺寸的图片
        const sizes = [
            { width: 300, suffix: 'small' },
            { width: 600, suffix: 'medium' },
            { width: 1200, suffix: 'large' }
        ];
        
        sizes.forEach(size => {
            const outputPath = `${baseName}_${size.suffix}.webp`;
            
            sharp(imagePath)
                .resize(size.width, null, { 
                    withoutEnlargement: true,
                    fit: 'inside'
                })
                .webp({ quality: 80 })
                .toFile(outputPath)
                .then(() => {
                    console.log(`✅ 生成响应式图片: ${outputPath}`);
                })
                .catch(err => {
                    console.error(`❌ 生成响应式图片失败: ${outputPath}`, err.message);
                });
        });
        
    } catch (error) {
        console.error(`❌ 生成响应式图片失败: ${imagePath}`, error.message);
    }
}

// 优化前端图片
function optimizeFrontendImages() {
    console.log('\n🖼️ 优化前端图片...');
    
    const frontendImageDir = path.join(__dirname, 'front-end/images');
    if (!fs.existsSync(frontendImageDir)) {
        console.log('❌ 前端图片目录不存在');
        return;
    }
    
    const imageFiles = fs.readdirSync(frontendImageDir)
        .filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file))
        .map(file => path.join(frontendImageDir, file));
    
    console.log(`找到 ${imageFiles.length} 个图片文件需要优化`);
    
    imageFiles.forEach(imagePath => {
        if (fs.existsSync(imagePath)) {
            if (checkDependencies()) {
                optimizeImageMagick(imagePath);
            } else {
                optimizeImageNode(imagePath);
            }
            
            // 生成响应式图片
            generateResponsiveImages(imagePath);
        }
    });
}

// 优化上传的图片
function optimizeUploadImages() {
    console.log('\n📤 优化上传的图片...');
    
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
        console.log('❌ 上传目录不存在');
        return;
    }
    
    const imageFiles = fs.readdirSync(uploadDir)
        .filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file))
        .map(file => path.join(uploadDir, file));
    
    console.log(`找到 ${imageFiles.length} 个上传图片需要优化`);
    
    imageFiles.forEach(imagePath => {
        if (fs.existsSync(imagePath)) {
            if (checkDependencies()) {
                optimizeImageMagick(imagePath);
            } else {
                optimizeImageNode(imagePath);
            }
        }
    });
}

// 创建图片懒加载HTML模板
function createLazyLoadTemplate() {
    console.log('\n📝 创建图片懒加载模板...');
    
    const template = `
<!-- 图片懒加载模板 -->
<img 
    src="/front-end/images/placeholder.webp" 
    data-src="实际图片路径" 
    alt="图片描述" 
    class="lazy-image"
    loading="lazy"
    decoding="async"
    onerror="this.src='/front-end/images/placeholder.webp'"
/>

<!-- 响应式图片模板 -->
<picture>
    <source media="(max-width: 768px)" srcset="图片路径_small.webp">
    <source media="(max-width: 1200px)" srcset="图片路径_medium.webp">
    <img src="图片路径_large.webp" alt="图片描述" loading="lazy">
</picture>
`;
    
    fs.writeFileSync('lazy-load-template.html', template);
    console.log('✅ 懒加载模板已创建: lazy-load-template.html');
}

// 创建图片优化配置
function createImageConfig() {
    console.log('\n⚙️ 创建图片优化配置...');
    
    const config = {
        optimization: {
            webp: {
                quality: 80,
                effort: 6,
                nearLossless: true
            },
            responsive: {
                sizes: [300, 600, 1200],
                format: 'webp'
            },
            lazyLoading: {
                threshold: 0.01,
                rootMargin: '50px 0px'
            }
        },
        formats: {
            modern: ['webp', 'avif'],
            fallback: ['jpg', 'png', 'gif']
        }
    };
    
    fs.writeFileSync('image-optimization-config.json', JSON.stringify(config, null, 2));
    console.log('✅ 图片优化配置已创建: image-optimization-config.json');
}

// 主函数
async function main() {
    console.log('🚀 开始紧急图片优化...\n');
    
    try {
        // 优化前端图片
        optimizeFrontendImages();
        
        // 优化上传图片
        optimizeUploadImages();
        
        // 创建懒加载模板
        createLazyLoadTemplate();
        
        // 创建配置
        createImageConfig();
        
        console.log('\n🎉 图片优化完成！');
        console.log('\n📋 下一步操作:');
        console.log('1. 重启服务器: pm2 restart all');
        console.log('2. 清除浏览器缓存');
        console.log('3. 测试图片加载速度');
        
    } catch (error) {
        console.error('❌ 优化过程中出现错误:', error.message);
    }
}

// 运行优化
main();

