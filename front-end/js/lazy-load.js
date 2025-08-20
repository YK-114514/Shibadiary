// 图片懒加载脚本 - 改善Speed Index性能
class LazyLoader {
    constructor() {
        this.images = [];
        this.observer = null;
        this.init();
    }

    init() {
        // 检查浏览器是否支持Intersection Observer
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // 降级方案：使用滚动事件
            this.setupScrollListener();
        }
    }

    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px', // 提前50px开始加载
            threshold: 0.01
        });

        // 查找所有需要懒加载的图片
        this.findLazyImages();
    }

    setupScrollListener() {
        // 降级方案：使用节流的滚动监听
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.checkImagesInView();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });
        
        // 初始检查
        this.findLazyImages();
        this.checkImagesInView();
    }

    findLazyImages() {
        // 查找所有带有data-src属性的图片
        const lazyImages = document.querySelectorAll('img[data-src]');
        this.images = Array.from(lazyImages);
        
        this.images.forEach(img => {
            if (this.observer) {
                this.observer.observe(img);
            }
        });
    }

    checkImagesInView() {
        this.images.forEach(img => {
            if (this.isInViewport(img)) {
                this.loadImage(img);
                this.images = this.images.filter(i => i !== img);
            }
        });
    }

    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;

        // 创建新的图片对象来预加载
        const tempImg = new Image();
        
        tempImg.onload = () => {
            img.src = src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
            
            // 移除data-src属性
            img.removeAttribute('data-src');
            
            // 触发加载完成事件
            img.dispatchEvent(new CustomEvent('lazyLoaded'));
        };

        tempImg.onerror = () => {
            console.warn('图片加载失败:', src);
            img.classList.add('lazy-error');
        };

        tempImg.src = src;
    }

    // 手动添加新的懒加载图片
    addImage(img) {
        if (img.hasAttribute('data-src')) {
            this.images.push(img);
            if (this.observer) {
                this.observer.observe(img);
            }
        }
    }

    // 销毁观察器
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// 初始化懒加载器
let lazyLoader;

document.addEventListener('DOMContentLoaded', () => {
    lazyLoader = new LazyLoader();
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
}

// 全局函数，供其他脚本调用
window.LazyLoader = LazyLoader;
window.lazyLoader = lazyLoader;
    