/**
 * 图片懒加载中间件
 * 专门解决图片加载慢的问题
 */

class ImageLazyLoadMiddleware {
    constructor() {
        this.placeholderImage = '/front-end/images/placeholder.webp';
        this.supportedFormats = ['webp', 'avif', 'jpg', 'jpeg', 'png', 'gif'];
    }

    // 创建懒加载中间件
    createMiddleware() {
        return (req, res, next) => {
            // 为HTML页面注入懒加载脚本
            if (req.path.endsWith('.html') || req.path === '/') {
                this.injectLazyLoadScript(req, res);
            }
            
            // 为图片请求添加缓存和优化头
            if (req.path.match(/\.(png|jpg|jpeg|gif|webp|avif)$/i)) {
                this.addImageHeaders(req, res);
            }
            
            next();
        };
    }

    // 注入懒加载脚本
    injectLazyLoadScript(req, res) {
        const originalSend = res.send;
        
        res.send = function(data) {
            if (typeof data === 'string' && data.includes('</head>')) {
                // 注入懒加载CSS
                const lazyLoadCSS = `
<style>
.lazy-image {
    opacity: 0;
    transition: opacity 0.3s ease;
    background: #f0f0f0;
    border-radius: 8px;
}

.lazy-image.loaded {
    opacity: 1;
}

.lazy-image.error {
    background: #ffebee;
    border: 1px solid #f44336;
}

.image-placeholder {
    background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    animation: placeholder-shimmer 1.5s infinite;
}

@keyframes placeholder-shimmer {
    0% { background-position: 0 0, 0 10px, 10px -10px, -10px 0px; }
    100% { background-position: 20px 20px, 20px 30px, 30px 10px, 10px 20px; }
}

.image-container {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
}

.image-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
}
</style>`;

                // 注入懒加载JavaScript
                const lazyLoadJS = `
<script>
(function() {
    'use strict';
    
    // 懒加载实现
    class ImageLazyLoader {
        constructor() {
            this.images = [];
            this.observer = null;
            this.init();
        }
        
        init() {
            this.setupIntersectionObserver();
            this.setupImageElements();
            this.setupErrorHandling();
        }
        
        setupIntersectionObserver() {
            if ('IntersectionObserver' in window) {
                this.observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadImage(entry.target);
                            this.observer.unobserve(entry.target);
                        }
                    });
                }, {
                    rootMargin: '50px 0px',
                    threshold: 0.01
                });
            }
        }
        
        setupImageElements() {
            // 查找所有需要懒加载的图片
            const lazyImages = document.querySelectorAll('img[data-src], img[data-srcset]');
            
            lazyImages.forEach(img => {
                // 设置占位符
                if (!img.src || img.src === window.location.href) {
                    img.src = '${this.placeholderImage}';
                    img.classList.add('lazy-image');
                }
                
                // 添加到观察列表
                if (this.observer) {
                    this.observer.observe(img);
                } else {
                    // 降级处理：直接加载
                    this.loadImage(img);
                }
                
                this.images.push(img);
            });
        }
        
        loadImage(img) {
            const src = img.dataset.src;
            const srcset = img.dataset.srcset;
            
            if (src || srcset) {
                // 显示加载状态
                img.classList.add('image-loading');
                
                // 创建新图片对象进行预加载
                const tempImg = new Image();
                
                tempImg.onload = () => {
                    // 加载成功
                    if (src) img.src = src;
                    if (srcset) img.srcset = srcset;
                    
                    img.classList.remove('lazy-image', 'image-loading');
                    img.classList.add('loaded');
                    
                    // 移除data属性
                    img.removeAttribute('data-src');
                    img.removeAttribute('data-srcset');
                    
                    // 触发加载完成事件
                    img.dispatchEvent(new CustomEvent('lazyLoadComplete'));
                };
                
                tempImg.onerror = () => {
                    // 加载失败
                    this.handleImageError(img);
                };
                
                // 开始加载
                if (src) tempImg.src = src;
                if (srcset) tempImg.srcset = srcset;
            }
        }
        
        handleImageError(img) {
            img.classList.remove('image-loading');
            img.classList.add('error');
            img.src = '${this.placeholderImage}';
            
            // 触发错误事件
            img.dispatchEvent(new CustomEvent('lazyLoadError'));
            
            console.warn('图片加载失败:', img.dataset.src || img.dataset.srcset);
        }
        
        setupErrorHandling() {
            // 全局图片错误处理
            document.addEventListener('error', (e) => {
                if (e.target.tagName === 'IMG') {
                    e.target.src = '${this.placeholderImage}';
                    e.target.classList.add('error');
                }
            }, true);
        }
        
        // 手动刷新所有图片
        refresh() {
            this.images.forEach(img => {
                if (img.dataset.src || img.dataset.srcset) {
                    this.loadImage(img);
                }
            });
        }
        
        // 销毁观察器
        destroy() {
            if (this.observer) {
                this.observer.disconnect();
            }
        }
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.imageLazyLoader = new ImageLazyLoader();
        });
    } else {
        window.imageLazyLoader = new ImageLazyLoader();
    }
    
    // 暴露到全局
    window.ImageLazyLoader = ImageLazyLoader;
})();
</script>`;

                // 注入到HTML中
                data = data.replace('</head>', lazyLoadCSS + '</head>');
                data = data.replace('</body>', lazyLoadJS + '</body>');
            }
            
            originalSend.call(this, data);
        };
    }

    // 为图片添加优化头
    addImageHeaders(req, res) {
        // 设置缓存头
        res.set({
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Vary': 'Accept',
            'X-Image-Optimized': 'true'
        });
        
        // 根据文件类型设置不同的缓存策略
        const ext = req.path.split('.').pop().toLowerCase();
        if (ext === 'webp') {
            res.set('X-Image-Format', 'modern');
        } else {
            res.set('X-Image-Format', 'legacy');
        }
    }

    // 创建响应式图片HTML
    createResponsiveImage(src, alt, sizes = [300, 600, 1200]) {
        const baseName = src.replace(/\.[^/.]+$/, '');
        const ext = src.split('.').pop();
        
        let html = '<picture>';
        
        // 添加WebP格式的响应式图片
        sizes.forEach(size => {
            html += `<source media="(max-width: ${size}px)" srcset="${baseName}_${size}.webp" type="image/webp">`;
        });
        
        // 添加原始格式作为后备
        html += `<img src="${src}" alt="${alt}" loading="lazy" decoding="async">`;
        html += '</picture>';
        
        return html;
    }

    // 创建懒加载图片HTML
    createLazyImage(src, alt, placeholder = this.placeholderImage) {
        return `<img 
            src="${placeholder}" 
            data-src="${src}" 
            alt="${alt}" 
            class="lazy-image"
            loading="lazy"
            decoding="async"
            onerror="this.src='${placeholder}'"
        />`;
    }

    // 批量处理图片
    processImages(html) {
        // 查找所有img标签
        const imgRegex = /<img([^>]+)>/gi;
        
        return html.replace(imgRegex, (match, attributes) => {
            // 检查是否已经有懒加载属性
            if (attributes.includes('data-src') || attributes.includes('loading="lazy"')) {
                return match;
            }
            
            // 添加懒加载属性
            let newAttributes = attributes;
            
            if (!attributes.includes('loading=')) {
                newAttributes += ' loading="lazy"';
            }
            
            if (!attributes.includes('decoding=')) {
                newAttributes += ' decoding="async"';
            }
            
            if (!attributes.includes('class=')) {
                newAttributes += ' class="lazy-image"';
            } else {
                newAttributes = newAttributes.replace(/class="([^"]*)"/, 'class="$1 lazy-image"');
            }
            
            return `<img${newAttributes}>`;
        });
    }
}

module.exports = ImageLazyLoadMiddleware;

