const express = require('express');
const path = require('path');
const fs = require('fs');

// MIME类型映射
const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
};

// 创建静态文件中间件
function createStaticFileMiddleware(uploadsDir) {
    return (req, res, next) => {
        // 只处理 /uploads/ 路径的请求
        if (!req.path.startsWith('/uploads/')) {
            return next();
        }
        
        // 获取文件路径
        const filePath = path.join(uploadsDir, req.path.replace('/uploads/', ''));
        
        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            return res.status(404).send('File not found');
        }
        
        // 获取文件扩展名
        const ext = path.extname(filePath).toLowerCase();
        
        // 设置正确的Content-Type
        if (mimeTypes[ext]) {
            res.setHeader('Content-Type', mimeTypes[ext]);
        } else {
            // 对于没有扩展名的文件，尝试检测文件类型
            try {
                const buffer = fs.readFileSync(filePath);
                const detectedType = detectFileTypeFromBuffer(buffer);
                if (detectedType) {
                    res.setHeader('Content-Type', detectedType);
                }
            } catch (error) {
                console.error('检测文件类型失败:', error);
            }
        }
        
        // 设置缓存头
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年缓存
        res.setHeader('Expires', new Date(Date.now() + 31536000 * 1000).toUTCString());

          // 确保不压缩图片文件
          res.setHeader('Content-Encoding', 'identity');
        
        // 发送文件
        res.sendFile(filePath);
    };
}

// 从文件内容检测MIME类型
function detectFileTypeFromBuffer(buffer) {
    if (buffer.length < 4) return null;
    
    const hex = buffer.toString('hex', 0, 8).toLowerCase();
    
    // JPEG
    if (hex.startsWith('ffd8ffe')) {
        return 'image/jpeg';
    }
    
    // PNG
    if (hex.startsWith('89504e47')) {
        return 'image/png';
    }
    
    // GIF
    if (hex.startsWith('47494638')) {
        return 'image/gif';
    }
    
    // WebP
    if (hex.startsWith('52494646') && buffer.length > 12) {
        const webpHeader = buffer.toString('ascii', 8, 12);
        if (webpHeader === 'WEBP') {
            return 'image/webp';
        }
    }
    
    // BMP
    if (hex.startsWith('424d')) {
        return 'image/bmp';
    }
    
    // TIFF
    if (hex.startsWith('49492a00') || hex.startsWith('4d4d002a')) {
        return 'image/tiff';
    }
    
    // ICO
    if (hex.startsWith('00000100')) {
        return 'image/x-icon';
    }
    
    // SVG
    if (buffer.length > 100) {
        const content = buffer.toString('utf8', 0, 100).toLowerCase();
        if (content.includes('<?xml') || content.includes('<svg')) {
            return 'image/svg+xml';
        }
    }
    
    return null;
}

module.exports = { createStaticFileMiddleware, detectFileTypeFromBuffer }; 