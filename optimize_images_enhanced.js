const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// 增强版图片优化脚本
console.log('🚀 开始全面优化图片性能...');

const imageDir = path.join(__dirname, 'front-end/images');
const uploadsDir = path.join(__dirname, 'uploads');
const optimizedDir = path.join(__dirname, 'front-end/images/optimized');

// 创建优化后的图片目录
if (!fs.existsSync(optimizedDir)) {
    fs.mkdirSync(optimizedDir, { recursive: true });
}

// 检查是否安装了imagemagick
function checkImageMagick() {
    return new Promise((resolve) => {
        exec('magick --version', (error) => {
            if (error) {
                console.log('⚠️ 未检测到ImageMagick，请安装后重试');
                console.log('Ubuntu/Debian: sudo apt-get install imagemagick');
                console.log('CentOS/RHEL: sudo yum install imagemagick');
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

// 优化单个图片 - 多种格式和尺寸
function optimizeImage(inputPath, outputDir, filename) {
    return new Promise((resolve, reject) => {
        const ext = path.extname(inputPath).toLowerCase();
        const nameWithoutExt = path.basename(filename, ext);
        
        try {
            if (ext === '.jpg' || ext === '.jpeg') {
                // 生成多种尺寸的JPEG
                const sizes = [
                    { suffix: '_small', size: '200x200', quality: 80 },
                    { suffix: '_medium', size: '400x400', quality: 85 },
                    { suffix: '_large', size: '800x800', quality: 90 }
                ];
                
                sizes.forEach(({ suffix, size, quality }) => {
                    const outputPath = path.join(outputDir, `${nameWithoutExt}${suffix}.jpg`);
                    exec(`magick "${inputPath}" -resize ${size} -quality ${quality} -strip "${outputPath}"`, (error) => {
                        if (!error) {
                            console.log(`✅ 生成 ${suffix} 尺寸: ${path.basename(outputPath)}`);
                        }
                    });
                });
                
                // 生成WebP版本
                const webpPath = path.join(outputDir, `${nameWithoutExt}.webp`);
                exec(`magick "${inputPath}" -quality 85 -strip "${webpPath}"`, (error) => {
                    if (!error) {
                        console.log(`✅ 生成WebP版本: ${path.basename(webpPath)}`);
                    }
                });
                
            } else if (ext === '.png') {
                // 生成多种尺寸的PNG
                const sizes = [
                    { suffix: '_small', size: '200x200' },
                    { suffix: '_medium', size: '400x400' },
                    { suffix: '_large', size: '800x800' }
                ];
                
                sizes.forEach(({ suffix, size }) => {
                    const outputPath = path.join(outputDir, `${nameWithoutExt}${suffix}.png`);
                    exec(`magick "${inputPath}" -resize ${size} -strip "${outputPath}"`, (error) => {
                        if (!error) {
                            console.log(`✅ 生成 ${suffix} 尺寸: ${path.basename(outputPath)}`);
                        }
                    });
                });
                
                // 转换为WebP
                const webpPath = path.join(outputDir, `${nameWithoutExt}.webp`);
                exec(`magick "${inputPath}" -quality 85 "${webpPath}"`, (error) => {
                    if (!error) {
                        console.log(`✅ 转换为WebP: ${path.basename(webpPath)}`);
                    }
                });
            }
            
            resolve();
        } catch (error) {
            reject(error);
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
        console.log(`🔄 处理: ${file}`);
        
        try {
            await optimizeImage(inputPath, optimizedDir, file);
        } catch (error) {
            console.error(`❌ 处理失败: ${file}`, error.message);
        }
    }
}

// 生成图片优化配置
function generateImageConfig() {
    const config = {
        images: {
            logo: {
                original: '/front-end/images/logo.png',
                optimized: {
                    small: '/front-end/images/optimized/logo_small.jpg',
                    medium: '/front-end/images/optimized/logo_medium.jpg',
                    large: '/front-end/images/optimized/logo_large.jpg',
                    webp: '/front-end/images/optimized/logo.webp'
                }
            },
            title: {
                original: '/front-end/images/title.png',
                optimized: {
                    small: '/front-end/images/optimized/title_small.png',
                    medium: '/front-end/images/optimized/title_medium.png',
                    large: '/front-end/images/optimized/title_large.png',
                    webp: '/front-end/images/optimized/title.webp'
                }
            }
        }
    };
    
    const configPath = path.join(__dirname, 'image-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`📝 生成图片配置: ${configPath}`);
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
        console.log('   4. 生成多种尺寸的图片');
        return;
    }

    console.log('✅ ImageMagick 已安装，开始优化...');
    
    // 优化前端图片
    console.log('\n🖼️ 优化前端图片...');
    await optimizeImages(imageDir);
    
    // 优化上传的图片
    console.log('\n📤 优化上传图片...');
    await optimizeImages(uploadsDir);
    
    // 生成配置
    generateImageConfig();
    
    console.log('\n🎉 图片优化完成！');
    console.log('📁 优化后的图片保存在:', optimizedDir);
    console.log('💡 建议在前端使用响应式图片和WebP格式');
}

main().catch(console.error);
