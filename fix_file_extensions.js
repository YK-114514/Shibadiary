const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 文件魔数（文件头）映射表
const magicNumbers = {
    // JPEG
    'ffd8ffe0': 'jpg',
    'ffd8ffe1': 'jpg',
    'ffd8ffe2': 'jpg',
    'ffd8ffe3': 'jpg',
    'ffd8ffe8': 'jpg',
    
    // PNG
    '89504e47': 'png',
    
    // GIF
    '47494638': 'gif',
    
    // WebP
    '52494646': 'webp', // 需要进一步检查
    
    // BMP
    '424d': 'bmp',
    
    // TIFF
    '49492a00': 'tiff',
    '4d4d002a': 'tiff',
    
    // ICO
    '00000100': 'ico',
    
    // SVG (文本文件，检查内容)
    '3c3f786d': 'svg', // XML声明
    '3c737667': 'svg', // SVG标签
};

// 检测文件类型
function detectFileType(filePath) {
    try {
        const buffer = fs.readFileSync(filePath);
        const hex = buffer.toString('hex', 0, 8).toLowerCase();
        
        // 检查WebP文件（需要特殊处理）
        if (hex.startsWith('52494646') && buffer.length > 12) {
            const webpHeader = buffer.toString('ascii', 8, 12);
            if (webpHeader === 'WEBP') {
                return 'webp';
            }
        }
        
        // 检查其他文件类型
        for (const [magic, ext] of Object.entries(magicNumbers)) {
            if (hex.startsWith(magic)) {
                return ext;
            }
        }
        
        // 检查SVG文件（文本文件）
        if (buffer.length > 100) {
            const content = buffer.toString('utf8', 0, 100).toLowerCase();
            if (content.includes('<?xml') || content.includes('<svg')) {
                return 'svg';
            }
        }
        
        return null; // 无法识别的文件类型
    } catch (error) {
        console.error(`读取文件失败 ${filePath}:`, error.message);
        return null;
    }
}

// 重命名文件
function renameFile(oldPath, newPath) {
    try {
        fs.renameSync(oldPath, newPath);
        return true;
    } catch (error) {
        console.error(`重命名文件失败 ${oldPath} -> ${newPath}:`, error.message);
        return false;
    }
}

// 主函数
function fixFileExtensions() {
    const uploadsDir = path.join(__dirname, 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
        console.error('uploads目录不存在');
        return;
    }
    
    console.log('开始检测和修复文件扩展名...');
    
    const files = fs.readdirSync(uploadsDir);
    let processedCount = 0;
    let renamedCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        
        // 跳过目录
        if (stats.isDirectory()) {
            continue;
        }
        
        // 跳过已经有扩展名的文件
        if (path.extname(file)) {
            console.log(`跳过已有扩展名的文件: ${file}`);
            continue;
        }
        
        processedCount++;
        console.log(`处理文件: ${file}`);
        
        // 检测文件类型
        const fileType = detectFileType(filePath);
        
        if (fileType) {
            const newFileName = `${file}.${fileType}`;
            const newFilePath = path.join(uploadsDir, newFileName);
            
            // 检查新文件名是否已存在
            if (fs.existsSync(newFilePath)) {
                console.log(`目标文件已存在，跳过: ${newFileName}`);
                continue;
            }
            
            // 重命名文件
            if (renameFile(filePath, newFilePath)) {
                console.log(`✅ 成功重命名: ${file} -> ${newFileName}`);
                renamedCount++;
            } else {
                errorCount++;
            }
        } else {
            console.log(`❌ 无法识别文件类型: ${file}`);
            errorCount++;
        }
    }
    
    console.log('\n=== 修复完成 ===');
    console.log(`总处理文件数: ${processedCount}`);
    console.log(`成功重命名: ${renamedCount}`);
    console.log(`处理失败: ${errorCount}`);
}

// 运行脚本
if (require.main === module) {
    fixFileExtensions();
}

module.exports = { detectFileType, fixFileExtensions }; 