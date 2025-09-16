#!/usr/bin/env node

/**
 * 修复双斜杠路径问题
 * 将 //images/ 改为 /images/
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 修复双斜杠路径问题...\n');

// 需要修复的HTML文件
const htmlFiles = [
    'front-end/views/index.html',
    'front-end/views/login.html',
    'front-end/views/register.html',
    'front-end/views/accounts.html',
    'front-end/views/personal.html',
    'front-end/views/specific.html',
    'front-end/views/setting.html',
    'front-end/views/message.html',
    'front-end/components/header.html'
];

// 路径修复映射
const pathMappings = [
    { from: '//images/', to: '/images/' },
    { from: '//front-end/images/', to: '/front-end/images/' },
    { from: '//front-end//images/', to: '/front-end/images/' }
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
                const matches = (content.match(regex) || []).length;
                changes += matches;
                content = newContent;
            }
        });
        
        // 检查是否有变化
        if (content !== originalContent) {
            // 备份原文件
            const backupPath = filePath + '.double-slash-backup';
            fs.writeFileSync(backupPath, originalContent);
            console.log(`💾 已备份: ${backupPath}`);
            
            // 写入修复后的内容
            fs.writeFileSync(filePath, content);
            console.log(`✅ 已修复: ${filePath} (${changes} 处双斜杠修复)`);
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

// 主函数
function main() {
    console.log('📝 修复HTML文件中的双斜杠路径...\n');
    
    let fixedFiles = 0;
    let totalFiles = htmlFiles.length;
    
    htmlFiles.forEach(filePath => {
        if (fixFile(filePath)) {
            fixedFiles++;
        }
    });
    
    console.log(`\n🎯 修复完成！`);
    console.log(`📊 修复统计: ${fixedFiles}/${totalFiles} 个文件已修复`);
    
    if (fixedFiles > 0) {
        console.log('\n📋 下一步操作:');
        console.log('1. 刷新浏览器页面');
        console.log('2. 清除浏览器缓存');
        console.log('3. 检查图片是否正常显示');
        console.log('4. 如果仍有问题，检查浏览器控制台');
    } else {
        console.log('\n✨ 所有文件都已经是正确的路径，无需修复！');
    }
}

// 运行修复
main();

