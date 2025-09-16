/**
 * 简化的图片服务中间件
 * 专门解决图片显示问题，确保图片能正常加载
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

// 创建简化的图片服务中间件
function createSimpleImageMiddleware() {
    return (req, res, next) => {
        // 只处理图片请求
        if (!req.path.match(/\.(jpg|jpeg|png|gif|webp|bmp|tiff|ico|svg)$/i)) {
            return next();
        }
        
        console.log(`🖼️ 处理图片请求: ${req.path}`);
        
        // 处理不同的图片路径
        let imagePath = null;
        
        // 1. 处理 /images/ 路径
        if (req.path.startsWith('/images/')) {
            imagePath = path.join(process.cwd(), 'front-end/images', req.path.replace('/images/', ''));
        }
        // 2. 处理 /front-end/images/ 路径
        else if (req.path.startsWith('/front-end/images/')) {
            imagePath = path.join(process.cwd(), 'front-end/images', req.path.replace('/front-end/images/', ''));
        }
        // 3. 处理 /uploads/ 路径
        else if (req.path.startsWith('/uploads/')) {
            // 解码URL编码的文件名
            const decodedPath = decodeURIComponent(req.path);
            console.log(`📁 处理上传图片请求: ${req.path} -> ${decodedPath}`);
            const requestedFileName = decodedPath.replace('/uploads/', '');
            imagePath = path.join(process.cwd(), 'uploads', requestedFileName);
            
            // 如果直接路径不存在，尝试在目录中查找匹配的文件
            if (!fs.existsSync(imagePath)) {
                console.log(`❌ 直接路径不存在: ${imagePath}`);
                
                try {
                    const files = fs.readdirSync(path.join(process.cwd(), 'uploads'));
                    const matchingFile = files.find(file => {
                        // 尝试不同的编码匹配方式
                        const decodedFile = decodeURIComponent(encodeURIComponent(file));
                        return file === requestedFileName || 
                               decodedFile === requestedFileName ||
                               file.includes(requestedFileName.split('_')[0]); // 按时间戳匹配
                    });
                    
                    if (matchingFile) {
                        console.log(`✅ 找到匹配文件: ${matchingFile}`);
                        imagePath = path.join(process.cwd(), 'uploads', matchingFile);
                    }
                } catch (error) {
                    console.error('读取uploads目录失败:', error);
                }
            }
        }
        
        // 如果找到了图片路径
        if (imagePath && fs.existsSync(imagePath)) {
            console.log(`✅ 找到图片: ${imagePath}`);
            
            // 设置正确的MIME类型
            const ext = path.extname(imagePath).toLowerCase();
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
            
            if (mimeTypes[ext]) {
                res.setHeader('Content-Type', mimeTypes[ext]);
            }
            
            // 设置缓存头（1小时缓存）
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('Expires', new Date(Date.now() + 3600 * 1000).toUTCString());
            
            // 确保不压缩图片
            res.setHeader('Content-Encoding', 'identity');
            
            // 添加调试头
            res.setHeader('X-Image-Served', 'true');
            res.setHeader('X-Image-Path', req.path);
            res.setHeader('X-Image-File', path.basename(imagePath));
            
            // 发送图片文件
            res.sendFile(imagePath, (err) => {
                if (err) {
                    console.error(`❌ 发送图片失败: ${err.message}`);
                    res.status(500).send('图片加载失败');
                } else {
                    console.log(`✅ 图片发送成功: ${req.path}`);
                }
            });
        } else {
            // 图片不存在，记录并返回404
            console.warn(`❌ 图片不存在: ${req.path} -> ${imagePath}`);
            res.status(404).send('图片不存在');
        }
    };
}

// 创建图片状态检查中间件
function createImageStatusMiddleware() {
    return (req, res, next) => {
        // 为图片请求添加状态头
        if (req.path.match(/\.(jpg|jpeg|png|gif|webp|bmp|tiff|ico|svg)$/i)) {
            res.setHeader('X-Image-Served', 'true');
            res.setHeader('X-Image-Path', req.path);
        }
        next();
    };
}

// 创建图片错误处理中间件
function createImageErrorMiddleware() {
    return (err, req, res, next) => {
        // 如果是图片请求出错
        if (req.path.match(/\.(jpg|jpeg|png|gif|webp|bmp|tiff|ico|svg)$/i)) {
            console.error(`❌ 图片请求错误: ${err.message}`);
            
            // 返回默认图片或错误信息
            const defaultImagePath = path.join(process.cwd(), 'front-end/images/default_avatar.jpg');
            
            if (fs.existsSync(defaultImagePath)) {
                res.setHeader('Content-Type', 'image/jpeg');
                res.sendFile(defaultImagePath);
            } else {
                res.status(500).json({
                    error: '图片加载失败',
                    message: err.message,
                    path: req.path
                });
            }
        } else {
            next(err);
        }
    };
}

module.exports = {
    createSimpleImageMiddleware,
    createImageStatusMiddleware,
    createImageErrorMiddleware
};
