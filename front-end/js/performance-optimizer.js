/**
 * 前端性能优化器
 * 提供页面加载速度优化功能
 */

class PerformanceOptimizer {
    constructor() {
        this.initialized = false;
        this.observer = null;
        this.intersectionObserver = null;
        this.init();
    }

    init() {
        if (this.initialized) return;
        
        console.log('[性能优化] 初始化性能优化器...');
        
        // 设置资源提示
        this.setupResourceHints();
        
        // 设置图片懒加载
        this.setupLazyLoading();
        
        // 设置预加载
        this.setupPreloading();
        
        // 设置性能监控
        this.setupPerformanceMonitoring();
        
        // 设置缓存策略
        this.setupCaching();
        
        this.initialized = true;
        console.log('[性能优化] 性能优化器初始化完成');
    }

    /**
     * 设置资源提示（DNS预解析、预连接等）
     */
    setupResourceHints() {
        const hints = [
            // DNS预解析
            { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
            { rel: 'dns-prefetch', href: '//cdn.jsdelivr.net' },
            
            // 预连接
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://cdn.jsdelivr.net' },
            
            // 预加载关键资源
            { rel: 'preload', href: '/front-end/css/critical.css', as: 'style' },
            { rel: 'preload', href: '/front-end/js/performance-optimizer.js', as: 'script' }
        ];

        hints.forEach(hint => {
            const link = document.createElement('link');
            Object.assign(link, hint);
            document.head.appendChild(link);
        });
    }

    /**
     * 设置图片懒加载
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            this.loadImage(img);
                            this.intersectionObserver.unobserve(img);
                        }
                    });
                },
                {
                    rootMargin: '50px 0px',
                    threshold: 0.01
                }
            );

            // 观察所有图片
            document.querySelectorAll('img[data-src]').forEach(img => {
                this.intersectionObserver.observe(img);
            });
        } else {
            // 降级处理：直接加载所有图片
            document.querySelectorAll('img[data-src]').forEach(img => {
                this.loadImage(img);
            });
        }
    }

    /**
     * 加载图片
     */
    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
        }
    }

    /**
     * 设置预加载
     */
    setupPreloading() {
        // 预加载下一页内容
        this.preloadNextPage();
        
        // 预加载用户头像
        this.preloadUserAvatars();
    }

    /**
     * 预加载下一页内容
     */
    preloadNextPage() {
        let currentPage = 1;
        const preloadThreshold = 0.8; // 当滚动到80%时预加载

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            
            if (scrollTop / (scrollHeight - clientHeight) > preloadThreshold) {
                this.preloadPage(currentPage + 1);
            }
        });
    }

    /**
     * 预加载指定页面
     */
    async preloadPage(page) {
        try {
            const response = await fetch(`/api/posts/index?page=${page}&limit=10`);
            const data = await response.json();
            
            if (data.success) {
                // 将预加载的数据存储到缓存
                this.cachePageData(page, data);
                console.log(`[性能优化] 预加载第${page}页完成`);
            }
        } catch (error) {
            console.warn(`[性能优化] 预加载第${page}页失败:`, error);
        }
    }

    /**
     * 预加载用户头像
     */
    preloadUserAvatars() {
        const avatars = document.querySelectorAll('img[src*="/uploads/"]');
        avatars.forEach(avatar => {
            if (avatar.src && !avatar.complete) {
                const img = new Image();
                img.src = avatar.src;
            }
        });
    }

    /**
     * 设置性能监控
     */
    setupPerformanceMonitoring() {
        // 监控关键性能指标
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        this.handlePerformanceEntry(entry);
                    });
                });
                
                observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
            } catch (e) {
                console.warn('[性能优化] 性能监控设置失败:', e);
            }
        }

        // 监控页面加载时间
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.reportPageLoadMetrics();
            }, 0);
        });
    }

    /**
     * 处理性能指标
     */
    handlePerformanceEntry(entry) {
        switch (entry.entryType) {
            case 'navigation':
                console.log('[性能监控] 页面导航时间:', entry.loadEventEnd - entry.loadEventStart, 'ms');
                break;
            case 'paint':
                if (entry.name === 'first-paint') {
                    console.log('[性能监控] 首次绘制:', entry.startTime, 'ms');
                } else if (entry.name === 'first-contentful-paint') {
                    console.log('[性能监控] 首次内容绘制:', entry.startTime, 'ms');
                }
                break;
            case 'largest-contentful-paint':
                console.log('[性能监控] 最大内容绘制:', entry.startTime, 'ms');
                break;
        }
    }

    /**
     * 报告页面加载指标
     */
    reportPageLoadMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            const metrics = {
                dns: navigation.domainLookupEnd - navigation.domainLookupStart,
                tcp: navigation.connectEnd - navigation.connectStart,
                ttfb: navigation.responseStart - navigation.requestStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                load: navigation.loadEventEnd - navigation.loadEventStart,
                total: navigation.loadEventEnd - navigation.navigationStart
            };
            
            console.log('[性能监控] 页面加载指标:', metrics);
            
            // 如果性能指标超过阈值，记录警告
            if (metrics.ttfb > 800) {
                console.warn('[性能警告] 首字节时间过长:', metrics.ttfb, 'ms');
            }
            if (metrics.total > 3000) {
                console.warn('[性能警告] 页面总加载时间过长:', metrics.total, 'ms');
            }
        }
    }

    /**
     * 设置缓存策略
     */
    setupCaching() {
        // 使用localStorage缓存API响应
        this.apiCache = new Map();
        
        // 设置缓存过期时间
        this.cacheExpiry = 5 * 60 * 1000; // 5分钟
    }

    /**
     * 缓存页面数据
     */
    cachePageData(page, data) {
        const cacheKey = `page_${page}`;
        this.apiCache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
    }

    /**
     * 获取缓存的页面数据
     */
    getCachedPageData(page) {
        const cacheKey = `page_${page}`;
        const cached = this.apiCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
            return cached.data;
        }
        
        return null;
    }

    /**
     * 清理过期缓存
     */
    cleanupExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.apiCache.entries()) {
            if (now - value.timestamp > this.cacheExpiry) {
                this.apiCache.delete(key);
            }
        }
    }

    /**
     * 优化图片加载
     */
    optimizeImages() {
        // 为所有图片添加loading="lazy"属性
        document.querySelectorAll('img:not([loading])').forEach(img => {
            if (!img.hasAttribute('data-src')) {
                img.setAttribute('loading', 'lazy');
            }
        });

        // 为图片添加错误处理
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('error', () => {
                img.src = '/front-end//images/placeholder.webp';
                img.alt = '图片加载失败';
            });
        });
    }

    /**
     * 优化字体加载
     */
    optimizeFonts() {
        // 设置字体显示策略
        if ('fonts' in document) {
            document.fonts.ready.then(() => {
                console.log('[性能优化] 字体加载完成');
            });
        }
    }

    /**
     * 清理资源
     */
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        if (this.observer) {
            this.observer.disconnect();
        }
        this.initialized = false;
    }
}

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
} 