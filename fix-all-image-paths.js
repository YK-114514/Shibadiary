#!/usr/bin/env node

/**
 * 全面修复所有文件中的图片路径问题
 * 包括HTML、CSS、JS等所有文件类型
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 开始全面修复图片路径问题...\n');

// 需要搜索和修复的目录
const searchDirs = [
    'front-end',
    'routes',
    'components'
];

// 需要修复的文件扩展名
const fileExtensions = ['.html', '.css', '.js', '.ejs', '.vue'];

// 图片路径映射
const pathMappings = [
    { from: '../images/', to: '/images/' },
    { from: './images/', to: '/images/' },
    { from: 'images/', to: '/images/' },
    { from: '../front-end/images/', to: '/front-end/images/' },
    { from: './front-end/images/', to: '/front-end/images/' },
    { from: 'front-end/images/', to: '/front-end/images/' }
];

// 递归查找文件
function findFiles(dir, extensions) {
    let files = [];
    
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && !item.startsWith('node_modules')) {
            files = files.concat(findFiles(fullPath, extensions));
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// 修复单个文件
function fixFile(filePath) {
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
            const backupPath = filePath + '.backup';
            fs.writeFileSync(backupPath, originalContent);
            console.log(`💾 已备份: ${backupPath}`);
            
            // 写入修复后的内容
            fs.writeFileSync(filePath, content);
            console.log(`✅ 已修复: ${filePath} (${changes} 处路径修复)`);
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error(`❌ 修复文件失败 ${filePath}:`, error.message);
        return false;
    }
}

// 修复CSS中的图片路径
function fixCSSImagePaths(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let changes = 0;
        
        // 修复CSS中的url()路径
        const urlRegex = /url\(['"]?([^'")\s]+)['"]?\)/g;
        content = content.replace(urlRegex, (match, url) => {
            if (url.includes('../images/')) {
                changes++;
                return `url('/images/${url.replace('../images/', '')}')`;
            } else if (url.includes('./images/')) {
                changes++;
                return `url('/images/${url.replace('./images/', '')}')`;
            } else if (url.includes('images/') && !url.startsWith('/')) {
                changes++;
                return `url('/images/${url.replace('images/', '')}')`;
            }
            return match;
        });
        
        if (content !== originalContent) {
            const backupPath = filePath + '.backup';
            fs.writeFileSync(backupPath, originalContent);
            console.log(`💾 已备份: ${backupPath}`);
            
            fs.writeFileSync(filePath, content);
            console.log(`✅ 已修复CSS: ${filePath} (${changes} 处路径修复)`);
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error(`❌ 修复CSS失败 ${filePath}:`, error.message);
        return false;
    }
}

// 主函数
function main() {
    console.log('📁 搜索需要修复的文件...\n');
    
    let allFiles = [];
    
    // 查找所有需要修复的文件
    searchDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            const files = findFiles(dir, fileExtensions);
            allFiles = allFiles.concat(files);
            console.log(`📂 ${dir}: 找到 ${files.length} 个文件`);
        }
    });
    
    console.log(`\n📊 总共找到 ${allFiles.length} 个文件需要检查\n`);
    
    let fixedFiles = 0;
    let totalChanges = 0;
    
    // 修复所有文件
    allFiles.forEach(filePath => {
        let fileFixed = false;
        
        // 根据文件类型选择修复方法
        if (filePath.endsWith('.css')) {
            fileFixed = fixCSSImagePaths(filePath);
        } else {
            fileFixed = fixFile(filePath);
        }
        
        if (fileFixed) {
            fixedFiles++;
        }
    });
    
    console.log(`\n🎯 修复完成！`);
    console.log(`📊 修复统计: ${fixedFiles}/${allFiles.length} 个文件已修复`);
    
    if (fixedFiles > 0) {
        console.log('\n📋 下一步操作:');
        console.log('1. 重启服务器');
        console.log('2. 清除浏览器缓存');
        console.log('3. 测试图片是否正常显示');
        console.log('4. 检查所有页面是否正常');
    } else {
        console.log('\n✨ 所有文件都已经是正确的路径，无需修复！');
    }
}

// 运行修复
main();
