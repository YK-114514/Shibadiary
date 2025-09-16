/**
 * 性能优化配置文件
 * 集中管理所有性能优化相关的配置
 */

module.exports = {
    // 图片优化配置
    imageOptimization: {
        // 支持的图片格式
        supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        
        // 图片质量设置
        quality: {
            webp: 85,
            jpeg: 80,
            png: 9
        },
        
        // 响应式图片尺寸
        responsiveSizes: [
            { width: 300, height: 300, suffix: 'small' },
            { width: 600, height: 600, suffix: 'medium' },
            { width: 1200, height: 1200, suffix: 'large' }
        ],
        
        // 懒加载配置
        lazyLoading: {
            threshold: 0.01,
            rootMargin: '50px 0px',
            placeholder: '/front-end/images/placeholder.webp'
        }
    },

    // 缓存策略配置
    caching: {
        // 静态资源缓存
        staticAssets: {
            maxAge: '1y',
            immutable: true,
            vary: 'Accept-Encoding'
        },
        
        // HTML文件缓存
        htmlFiles: {
            maxAge: '1h',
            mustRevalidate: true
        },
        
        // API响应缓存
        apiResponses: {
            maxAge: '5m',
            mustRevalidate: true
        }
    },

    // 压缩配置
    compression: {
        // gzip压缩级别
        level: 6,
        
        // 最小压缩阈值
        threshold: 1024,
        
        // 不压缩的文件类型
        excludeTypes: [
            'image/jpeg',
            'image/png', 
            'image/gif',
            'image/webp',
            'image/svg+xml'
        ],
        
        // 不压缩的路径
        excludePaths: [
            '/uploads/',
            '/images/',
            '/front-end/images/'
        ]
    },

    // 预加载配置
    preloading: {
        // 关键CSS文件
        criticalCSS: [
            '/front-end/css/critical.css',
            '/front-end/css/index.min.css'
        ],
        
        // 关键JavaScript文件
        criticalJS: [
            '/front-end/js/performance-optimizer.js',
            '/front-end/js/index.min.js'
        ],
        
        // 关键图片文件
        criticalImages: [
            '/front-end/images/logo.webp',
            '/front-end/images/background2.webp'
        ],
        
        // 预连接域名
        preconnectDomains: [
            'https://fonts.googleapis.com',
            'https://cdn.jsdelivr.net'
        ]
    },

    // 资源提示配置
    resourceHints: {
        // DNS预解析
        dnsPrefetch: [
            '//fonts.googleapis.com',
            '//cdn.jsdelivr.net',
            '//api.example.com'
        ],
        
        // 预连接
        preconnect: [
            'https://fonts.googleapis.com',
            'https://cdn.jsdelivr.net'
        ]
    },

    // 性能监控配置
    monitoring: {
        // 关键性能指标阈值
        thresholds: {
            fcp: 2000,      // 首次内容绘制
            lcp: 2500,      // 最大内容绘制
            fid: 100,       // 首次输入延迟
            cls: 0.1,       // 累积布局偏移
            ttfb: 800       // 首字节时间
        },
        
        // 性能数据收集
        collectMetrics: [
            'navigation',
            'paint',
            'largest-contentful-paint',
            'first-input',
            'layout-shift'
        ]
    },

    // 字体优化配置
    fontOptimization: {
        // 字体显示策略
        display: 'swap',
        
        // 预加载字体
        preload: [
            {
                family: 'Roboto',
                weight: '400,700',
                style: 'normal'
            }
        ],
        
        // 字体子集化
        subset: true
    },

    // 代码分割配置
    codeSplitting: {
        // 入口点
        entryPoints: {
            main: './front-end/js/index.js',
            vendor: './front-end/js/vendor.js'
        },
        
        // 分割策略
        splitChunks: {
            chunks: 'all',
            minSize: 20000,
            maxSize: 244000
        }
    },

    // 服务工作者配置
    serviceWorker: {
        // 缓存策略
        cacheStrategy: 'stale-while-revalidate',
        
        // 缓存名称
        cacheName: 'xiaochai-diary-v1',
        
        // 预缓存资源
        precache: [
            '/front-end/css/critical.css',
            '/front-end/js/performance-optimizer.js',
            '/front-end/images/logo.webp'
        ]
    },

    // 环境特定配置
    environments: {
        development: {
            compression: false,
            caching: false,
            minification: false
        },
        
        production: {
            compression: true,
            caching: true,
            minification: true,
            sourceMaps: false
        }
    },

    // 错误处理配置
    errorHandling: {
        // 图片加载失败处理
        imageErrorFallback: '/front-end/images/placeholder.webp',
        
        // 字体加载失败处理
        fontErrorFallback: 'system-ui, -apple-system, sans-serif',
        
        // 脚本加载失败重试
        scriptRetryAttempts: 3,
        scriptRetryDelay: 1000
    }
};
