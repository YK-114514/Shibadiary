#!/usr/bin/env node

/**
 * 快速修复图片显示问题
 * 批量修复前端页面中的图片路径问题
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 开始快速修复图片显示问题...\n');

// 需要修复的HTML文件
const htmlFiles = [
    'front-end/views/index.html',
    'front-end/views/login.html',
    'front-end/views/register.html',
    'front-end/views/accounts.html',
    'front-end/views/personal.html',
    'front-end/views/specific.html',
    'front-end/views/setting.html',
    'front-end/views/message.html'
];

// 图片路径映射
const pathMappings = [
    { from: '../images/', to: '/images/' },
    { from: '../images/', to: '/front-end/images/' },
    { from: '/images/default_avatar.jpg', to: '/front-end/images/default_avatar.jpg' },
    { from: '/images/avatars/', to: '/front-end/images/avatars/' }
];

// 修复单个文件
function fixFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`❌ 文件不存在: ${filePath}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let changes = 0;
        
        // 应用路径映射
        pathMappings.forEach(mapping => {
            const regex = new RegExp(mapping.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            const newContent = content.replace(regex, mapping.to);
            if (newContent !== content) {
                changes += (content.match(regex) || []).length;
                content = newContent;
            }
        });
        
        // 添加懒加载属性
        const imgTagRegex = /<img([^>]*?)(?:\s+loading\s*=\s*["'][^"']*["'])?([^>]*?)>/gi;
        content = content.replace(imgTagRegex, (match, before, after) => {
            if (!match.includes('loading=')) {
                return `<img${before} loading="lazy"${after}>`;
            }
            return match;
        });
        
        // 检查是否有变化
        if (content !== originalContent) {
            // 备份原文件
            const backupPath = filePath + '.backup';
            fs.writeFileSync(backupPath, originalContent);
            console.log(`💾 已备份: ${backupPath}`);
            
            // 写入修复后的内容
            fs.writeFileSync(filePath, content);
            console.log(`✅ 已修复: ${filePath} (${changes} 处路径修复)`);
            return true;
        } else {
            console.log(`ℹ️  无需修复: ${filePath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ 修复文件失败 ${filePath}:`, error.message);
        return false;
    }
}

// 创建图片占位符
function createImagePlaceholder() {
    const placeholderPath = 'front-end/images/placeholder.png';
    
    if (!fs.existsSync(placeholderPath)) {
        console.log('\n🎨 创建图片占位符...');
        
        // 创建一个简单的SVG占位符
        const svgPlaceholder = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#f0f0f0"/>
  <text x="100" y="100" font-family="Arial" font-size="16" fill="#666" text-anchor="middle" dy=".3em">图片加载中...</text>
</svg>`;
        
        try {
            fs.writeFileSync(placeholderPath, svgPlaceholder);
            console.log(`✅ 已创建占位符: ${placeholderPath}`);
        } catch (error) {
            console.error(`❌ 创建占位符失败:`, error.message);
        }
    }
}

// 修复CSS中的图片路径
function fixCSSPaths() {
    const cssDir = 'front-end/css';
    if (!fs.existsSync(cssDir)) return;
    
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    
    cssFiles.forEach(file => {
        const filePath = path.join(cssDir, file);
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let originalContent = content;
            
            // 修复CSS中的图片路径
            content = content.replace(/url\(['"]?\.\.\/images\//g, 'url(/images/');
            content = content.replace(/url\(['"]?\.\.\/images\//g, 'url(/front-end/images/');
            
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content);
                console.log(`✅ 已修复CSS: ${filePath}`);
            }
        } catch (error) {
            console.error(`❌ 修复CSS失败 ${filePath}:`, error.message);
        }
    });
}

// 主函数
function main() {
    console.log('📝 修复HTML文件中的图片路径...\n');
    
    let fixedFiles = 0;
    let totalFiles = htmlFiles.length;
    
    htmlFiles.forEach(filePath => {
        if (fixFile(filePath)) {
            fixedFiles++;
        }
    });
    
    console.log(`\n📊 修复统计: ${fixedFiles}/${totalFiles} 个文件已修复`);
    
    // 修复CSS路径
    console.log('\n🎨 修复CSS文件中的图片路径...');
    fixCSSPaths();
    
    // 创建占位符
    createImagePlaceholder();
    
    console.log('\n🎯 快速修复完成！');
    console.log('\n📋 下一步操作:');
    console.log('1. 重启服务器');
    console.log('2. 清除浏览器缓存');
    console.log('3. 测试图片是否正常显示');
    console.log('4. 如果仍有问题，运行 fix-image-issues.js 进行详细诊断');
}

// 运行修复
main();
