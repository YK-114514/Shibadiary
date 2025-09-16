const express = require('express');
const path = require('path');
const fs = require('fs');

// 图片优化中间件
class ImageOptimizationMiddleware {
    constructor() {
        this.supportedFormats = ['webp', 'avif', 'jpeg', 'jpg', 'png'];
        this.devicePixelRatios = [1, 2, 3]; // 支持不同设备像素比
    }

    // 检测浏览器支持的图片格式
    detectSupportedFormat(req) {
        const acceptHeader = req.headers.accept || '';
        
        if (acceptHeader.includes('image/avif')) {
            return 'avif';
        } else if (acceptHeader.includes('image/webp')) {
            return 'webp';
        } else if (acceptHeader.includes('image/jpeg')) {
            return 'jpeg';
        } else if (acceptHeader.includes('image/png')) {
            return 'png';
        }
        
        return 'jpeg'; // 默认格式
    }

    // 检测设备像素比
    detectDevicePixelRatio(req) {
        const dpr = req.headers['sec-ch-dpr'] || req.headers['dpr'] || '1';
        return parseInt(dpr) || 1;
    }

    // 查找最佳图片格式
    findBestImageFormat(originalPath, preferredFormat) {
        const dir = path.dirname(originalPath);
        const ext = path.extname(originalPath);
        const nameWithoutExt = path.basename(originalPath, ext);
        
        // 优先查找WebP格式
        if (preferredFormat === 'webp') {
            const webpPath = path.join(dir, 'optimized', `${nameWithoutExt}.webp`);
            if (fs.existsSync(webpPath)) {
                return webpPath;
            }
        }
        
        // 查找AVIF格式
        if (preferredFormat === 'avif') {
            const avifPath = path.join(dir, 'optimized', `${nameWithoutExt}.avif`);
            if (fs.existsSync(avifPath)) {
                return avifPath;
            }
        }
        
        // 查找优化后的原格式
        const optimizedPath = path.join(dir, 'optimized', `${nameWithoutExt}${ext}`);
        if (fs.existsSync(optimizedPath)) {
            return optimizedPath;
        }
        
        return originalPath; // 返回原图
    }

    // 查找响应式图片
    findResponsiveImage(originalPath, dpr) {
        const dir = path.dirname(originalPath);
        const ext = path.extname(originalPath);
        const nameWithoutExt = path.basename(originalPath, ext);
        
        // 根据设备像素比查找对应尺寸
        let sizeSuffix = '';
        if (dpr >= 3) {
            sizeSuffix = '_large';
        } else if (dpr >= 2) {
            sizeSuffix = '_medium';
        } else {
            sizeSuffix = '_small';
        }
        
        const responsivePath = path.join(dir, 'optimized', `${nameWithoutExt}${sizeSuffix}${ext}`);
        if (fs.existsSync(responsivePath)) {
            return responsivePath;
        }
        
        return originalPath;
    }

    // 创建图片优化中间件
    createMiddleware() {
        return (req, res, next) => {
            // 只处理图片请求
            if (!req.path.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
                return next();
            }

            const originalPath = path.join(process.cwd(), req.path);
            
            // 检查原图是否存在
            if (!fs.existsSync(originalPath)) {
                return next();
            }

            // 检测浏览器支持的格式和设备像素比
            const supportedFormat = this.detectSupportedFormat(req);
            const devicePixelRatio = this.detectDevicePixelRatio(req);

            // 查找最佳图片
            let bestImagePath = this.findBestImageFormat(originalPath, supportedFormat);
            bestImagePath = this.findResponsiveImage(bestImagePath, devicePixelRatio);

            // 设置缓存头
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            res.setHeader('Expires', new Date(Date.now() + 31536000 * 1000).toUTCString());
            
            // 设置图片优化相关的响应头
            res.setHeader('X-Image-Optimized', 'true');
            res.setHeader('X-Image-Format', path.extname(bestImagePath).substring(1));
            res.setHeader('X-Device-Pixel-Ratio', devicePixelRatio);

            // 发送优化后的图片
            res.sendFile(bestImagePath, (err) => {
                if (err) {
                    console.error('发送优化图片失败:', err);
                    // 如果优化图片发送失败，回退到原图
                    res.sendFile(originalPath);
                }
            });
        };
    }

    // 创建图片预加载中间件
    createPreloadMiddleware() {
        return (req, res, next) => {
            // 为HTML页面添加图片预加载头
            if (req.path.endsWith('.html') || req.path === '/') {
                res.setHeader('Link', [
                    '</front-end/images/logo.webp>; rel=preload; as=image; type=image/webp',
                    '</front-end/images/title.webp>; rel=preload; as=image; type=image/webp',
                    '</front-end/images/default_avatar.jpg>; rel=preload; as=image; type=image/jpeg'
                ].join(', '));
            }
            next();
        };
    }

    // 创建图片懒加载中间件
    createLazyLoadMiddleware() {
        return (req, res, next) => {
            // 为HTML页面注入懒加载脚本
            if (req.path.endsWith('.html') || req.path === '/') {
                res.setHeader('X-Lazy-Load', 'enabled');
            }
            next();
        };
    }
}

// 导出中间件
module.exports = ImageOptimizationMiddleware;
