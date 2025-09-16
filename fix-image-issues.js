#!/usr/bin/env node

/**
 * 图片显示问题诊断和修复脚本
 * 解决小柴日记项目中的图片显示问题
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🔍 开始诊断图片显示问题...\n');

// 检查图片文件是否存在
function checkImageFiles() {
    console.log('📁 检查图片文件...');
    
    const imagePaths = [
        'front-end/images/logo.png',
        'front-end/images/logo_2.png',
        'front-end/images/logo_3.png',
        'front-end/images/title.png',
        'front-end/images/default_avatar.jpg',
        'front-end/images/add.png',
        'front-end/images/background1.png',
        'front-end/images/background2.png'
    ];
    
    let missingImages = [];
    
    imagePaths.forEach(imgPath => {
        if (fs.existsSync(imgPath)) {
            const stats = fs.statSync(imgPath);
            console.log(`✅ ${imgPath} - ${(stats.size / 1024).toFixed(2)} KB`);
        } else {
            console.log(`❌ ${imgPath} - 文件不存在`);
            missingImages.push(imgPath);
        }
    });
    
    if (missingImages.length > 0) {
        console.log(`\n⚠️  发现 ${missingImages.length} 个缺失的图片文件`);
    } else {
        console.log('\n✅ 所有基础图片文件都存在');
    }
    
    return missingImages;
}

// 检查uploads目录
function checkUploadsDirectory() {
    console.log('\n📁 检查uploads目录...');
    
    const uploadsPath = 'uploads';
    if (!fs.existsSync(uploadsPath)) {
        console.log('❌ uploads目录不存在');
        return false;
    }
    
    const files = fs.readdirSync(uploadsPath);
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });
    
    console.log(`✅ uploads目录存在，包含 ${imageFiles.length} 个图片文件`);
    
    if (imageFiles.length > 0) {
        console.log('📸 前5个图片文件:');
        imageFiles.slice(0, 5).forEach(file => {
            const filePath = path.join(uploadsPath, file);
            const stats = fs.statSync(filePath);
            console.log(`   - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
        });
    }
    
    return true;
}

// 检查服务器配置
function checkServerConfig() {
    console.log('\n⚙️  检查服务器配置...');
    
    const appPath = 'app.js';
    if (!fs.existsSync(appPath)) {
        console.log('❌ app.js文件不存在');
        return false;
    }
    
    const appContent = fs.readFileSync(appPath, 'utf8');
    
    // 检查静态文件配置
    const staticConfigs = [
        { pattern: '/images', desc: '图片路径 /images' },
        { pattern: '/front-end/images', desc: '图片路径 /front-end/images' },
        { pattern: '/uploads', desc: '上传文件路径 /uploads' },
        { pattern: 'express.static', desc: 'express.static中间件' }
    ];
    
    staticConfigs.forEach(config => {
        if (appContent.includes(config.pattern)) {
            console.log(`✅ ${config.desc} - 已配置`);
        } else {
            console.log(`❌ ${config.desc} - 未配置`);
        }
    });
    
    return true;
}

// 测试图片URL可访问性
function testImageAccessibility() {
    console.log('\n🌐 测试图片URL可访问性...');
    
    const testUrls = [
        'http://localhost:3000/images/logo.png',
        'http://localhost:3000/images/logo_2.png',
        'http://localhost:3000/front-end/images/logo.png',
        'http://localhost:3000/front-end/images/logo_2.png'
    ];
    
    testUrls.forEach(url => {
        const req = http.get(url, (res) => {
            if (res.statusCode === 200) {
                console.log(`✅ ${url} - 状态码: ${res.statusCode}`);
            } else {
                console.log(`⚠️  ${url} - 状态码: ${res.statusCode}`);
            }
        });
        
        req.on('error', (err) => {
            console.log(`❌ ${url} - 连接失败: ${err.message}`);
        });
        
        req.setTimeout(5000, () => {
            console.log(`⏰ ${url} - 请求超时`);
            req.destroy();
        });
    });
}

// 生成修复建议
function generateFixSuggestions(missingImages) {
    console.log('\n🔧 修复建议:');
    
    if (missingImages.length > 0) {
        console.log('1. 缺失的图片文件需要重新添加:');
        missingImages.forEach(img => console.log(`   - ${img}`));
    }
    
    console.log(`
2. 前端页面图片路径统一:
   - 将 ../images/ 改为 /images/
   - 或者确保服务器同时支持两种路径

3. 检查浏览器控制台错误:
   - 打开开发者工具
   - 查看Console和Network标签页
   - 确认图片请求的状态码

4. 清除浏览器缓存:
   - 强制刷新页面 (Ctrl+F5)
   - 清除浏览器缓存和Cookie

5. 检查服务器日志:
   - 查看是否有图片请求的错误日志
   - 确认静态文件中间件正常工作

6. 图片懒加载优化:
   - 为所有图片添加 loading="lazy" 属性
   - 使用 data-src 属性进行懒加载
`);
}

// 主函数
function main() {
    try {
        const missingImages = checkImageFiles();
        checkUploadsDirectory();
        checkServerConfig();
        
        // 等待一段时间后测试URL可访问性
        setTimeout(() => {
            testImageAccessibility();
            
            setTimeout(() => {
                generateFixSuggestions(missingImages);
                console.log('\n🎯 诊断完成！请根据上述建议进行修复。');
            }, 2000);
        }, 1000);
        
    } catch (error) {
        console.error('❌ 诊断过程中出现错误:', error.message);
    }
}

// 运行诊断
main();
