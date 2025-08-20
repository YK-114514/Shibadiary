const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// 图片优化脚本 - 改善LCP性能
console.log('🖼️ 开始优化图片...');

const imageDir = path.join(__dirname, 'front-end/images');
const uploadsDir = path.join(__dirname, 'uploads');

// 检查是否安装了imagemagick
function checkImageMagick() {
    return new Promise((resolve) => {
        exec('magick --version', (error) => {
            if (error) {
                console.log('⚠️ 未检测到ImageMagick，请安装后重试');
                console.log('安装命令: brew install imagemagick (macOS) 或 apt-get install imagemagick (Ubuntu)');
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

// 优化单个图片
function optimizeImage(inputPath, outputPath, quality = 85) {
    return new Promise((resolve, reject) => {
        const ext = path.extname(inputPath).toLowerCase();
        
        if (ext === '.jpg' || ext === '.jpeg') {
            // 优化JPEG
            exec(`magick "${inputPath}" -quality ${quality} -strip "${outputPath}"`, (error) => {
                if (error) {
                    console.error(`❌ 优化失败: ${inputPath}`, error.message);
                    reject(error);
                } else {
                    console.log(`✅ 优化完成: ${path.basename(inputPath)}`);
                    resolve();
                }
            });
        } else if (ext === '.png') {
            // 转换为WebP
            const webpPath = outputPath.replace('.png', '.webp');
            exec(`magick "${inputPath}" -quality ${quality} "${webpPath}"`, (error) => {
                if (error) {
                    console.error(`❌ 转换失败: ${inputPath}`, error.message);
                    reject(error);
                } else {
                    console.log(`✅ 转换为WebP: ${path.basename(inputPath)}`);
                    resolve();
                }
            });
        } else {
            console.log(`⏭️ 跳过: ${path.basename(inputPath)} (不支持的文件格式)`);
            resolve();
        }
    });
}

// 批量优化图片
async function optimizeImages(directory) {
    if (!fs.existsSync(directory)) {
        console.log(`📁 目录不存在: ${directory}`);
        return;
    }

    const files = fs.readdirSync(directory);
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png'].includes(ext);
    });

    console.log(`📸 发现 ${imageFiles.length} 个图片文件`);

    for (const file of imageFiles) {
        const inputPath = path.join(directory, file);
        const outputPath = inputPath; // 覆盖原文件
        
        try {
            await optimizeImage(inputPath, outputPath);
        } catch (error) {
            console.error(`❌ 处理失败: ${file}`);
        }
    }
}

// 主函数
async function main() {
    const hasImageMagick = await checkImageMagick();
    
    if (!hasImageMagick) {
        console.log('💡 提示: 安装ImageMagick后可以自动优化图片');
        console.log('💡 手动优化建议:');
        console.log('   1. 将大图片转换为WebP格式');
        console.log('   2. 压缩JPEG质量到85%');
        console.log('   3. 移除图片元数据');
        return;
    }

    console.log('🚀 开始优化图片...');
    
    // 优化front-end/images目录
    console.log('\n📁 优化 front-end/images 目录...');
    await optimizeImages(imageDir);
    
    // 优化uploads目录
    console.log('\n📁 优化 uploads 目录...');
    await optimizeImages(uploadsDir);
    
    console.log('\n🎉 图片优化完成！');
    console.log('💡 建议:');
    console.log('   1. 定期运行此脚本优化新上传的图片');
    console.log('   2. 考虑使用CDN加速图片加载');
    console.log('   3. 实现图片懒加载');
}

main().catch(console.error); 