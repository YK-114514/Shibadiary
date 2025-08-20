/**
 * SWR (Stale-While-Revalidate) 缓存中间件
 * 为只读接口提供智能缓存策略
 */

// 内存缓存存储
const cacheStore = new Map();

// 导入缓存配置
const cacheConfig = require('./cache-config');

// 构建缓存配置映射
const CACHE_CONFIG = {};

// 合并所有策略配置
Object.values(cacheConfig.strategies).forEach(strategy => {
    Object.assign(CACHE_CONFIG, strategy);
});

// 添加默认配置
CACHE_CONFIG.default = cacheConfig.global.default;

// 获取环境配置
const env = process.env.NODE_ENV || 'development';
const envConfig = cacheConfig.environments[env] || cacheConfig.environments.development;

/**
 * 获取缓存配置
 * @param {string} path - 请求路径
 * @returns {Object} 缓存配置
 */
function getCacheConfig(path) {
    // 精确匹配
    if (CACHE_CONFIG[path]) {
        return CACHE_CONFIG[path];
    }
    
    // 模式匹配（处理动态参数）
    for (const [pattern, config] of Object.entries(CACHE_CONFIG)) {
        if (pattern.includes(':')) {
            const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+');
            if (new RegExp(`^${regexPattern}$`).test(path)) {
                return config;
            }
        }
    }
    
    // 返回默认配置
    return CACHE_CONFIG.default;
}

/**
 * 生成缓存键
 * @param {string} path - 请求路径
 * @param {Object} query - 查询参数
 * @param {Object} user - 用户信息（用于区分不同用户的缓存）
 * @returns {string} 缓存键
 */
function generateCacheKey(path, query, user = null) {
    const queryStr = Object.keys(query).length > 0 ? JSON.stringify(query) : '';
    const userStr = user ? `:user_${user.id_user}` : '';
    return `${path}${queryStr}${userStr}`;
}

/**
 * 检查缓存是否有效
 * @param {Object} cacheEntry - 缓存条目
 * @param {number} maxAge - 最大缓存时间
 * @returns {boolean} 缓存是否有效
 */
function isCacheValid(cacheEntry, maxAge) {
    if (!cacheEntry || !cacheEntry.timestamp) return false;
    const now = Date.now();
    return (now - cacheEntry.timestamp) < (maxAge * 1000);
}

/**
 * 检查缓存是否处于stale状态
 * @param {Object} cacheEntry - 缓存条目
 * @param {number} staleWhileRevalidate - stale时间
 * @returns {boolean} 缓存是否处于stale状态
 */
function isCacheStale(cacheEntry, staleWhileRevalidate) {
    if (!cacheEntry || !cacheEntry.timestamp) return false;
    const now = Date.now();
    return (now - cacheEntry.timestamp) < (staleWhileRevalidate * 1000);
}

/**
 * SWR缓存中间件
 * @param {Object} options - 配置选项
 * @returns {Function} 中间件函数
 */
function swrCache(options = {}) {
    return async (req, res, next) => {
        // 只对GET请求应用缓存
        if (req.method !== 'GET') {
            return next();
        }
        
        const path = req.path;
        const cacheConfig = getCacheConfig(path);
        
        // 如果没有缓存配置，跳过缓存
        if (!cacheConfig) {
            return next();
        }
        
        const { maxAge, staleWhileRevalidate } = cacheConfig;
        const cacheKey = generateCacheKey(path, req.query, req.user);
        const cacheEntry = cacheStore.get(cacheKey);
        
        // 检查缓存是否有效
        if (isCacheValid(cacheEntry, maxAge)) {
            if (envConfig.debug) {
                console.log(`[缓存] 命中有效缓存: ${path}`);
            }
            
            // 设置缓存头
            res.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`);
            res.set('X-Cache-Status', 'HIT');
            res.set('X-Cache-Age', Math.floor((Date.now() - cacheEntry.timestamp) / 1000));
            
            return res.json(cacheEntry.data);
        }
        
        // 检查缓存是否处于stale状态
        if (isCacheStale(cacheEntry, staleWhileRevalidate)) {
            if (envConfig.debug) {
                console.log(`[缓存] 使用stale缓存: ${path}`);
            }
            
            // 设置缓存头
            res.set('Cache-Control', `public, max-age=0, stale-while-revalidate=${staleWhileRevalidate}`);
            res.set('X-Cache-Status', 'STALE');
            res.set('X-Cache-Age', Math.floor((Date.now() - cacheEntry.timestamp) / 1000));
            
            // 返回stale数据，同时在后台更新缓存
            res.json(cacheEntry.data);
            
            // 在后台异步更新缓存
            setImmediate(() => {
                req.cacheKey = cacheKey; // 传递给下一个中间件
                req.shouldUpdateCache = true;
            });
            
            return;
        }
        
        // 没有缓存或缓存已过期，设置缓存更新标志
        if (envConfig.debug) {
            console.log(`[缓存] 缓存未命中: ${path}`);
        }
        req.cacheKey = cacheKey;
        req.shouldUpdateCache = true;
        
        // 设置缓存头
        res.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`);
        res.set('X-Cache-Status', 'MISS');
        
        next();
    };
}

/**
 * 缓存更新中间件
 * 在响应发送后更新缓存
 */
function cacheUpdate() {
    return (req, res, next) => {
        if (!req.shouldUpdateCache) {
            return next();
        }
        
        // 保存原始的res.json方法
        const originalJson = res.json;
        
        // 重写res.json方法以捕获响应数据
        res.json = function(data) {
            // 更新缓存
            if (req.cacheKey && data) {
                cacheStore.set(req.cacheKey, {
                    data: data,
                    timestamp: Date.now()
                });
                if (envConfig.debug) {
                    console.log(`[缓存] 更新缓存: ${req.cacheKey}`);
                }
            }
            
            // 调用原始的json方法
            return originalJson.call(this, data);
        };
        
        next();
    };
}

/**
 * 缓存清理中间件
 * 定期清理过期缓存
 */
function cacheCleanup() {
    setInterval(() => {
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [key, entry] of cacheStore.entries()) {
            // 检查是否超过最大stale时间
            const maxStaleTime = Math.max(
                ...Object.values(CACHE_CONFIG)
                    .filter(config => config.staleWhileRevalidate)
                    .map(config => config.staleWhileRevalidate)
            );
            
            if ((now - entry.timestamp) > (maxStaleTime * 1000)) {
                cacheStore.delete(key);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0 && envConfig.debug) {
            console.log(`[缓存] 清理了 ${cleanedCount} 个过期缓存条目`);
        }
    }, 60000); // 每分钟清理一次
}

/**
 * 缓存统计中间件
 */
function cacheStats() {
    return (req, res, next) => {
        if (req.path === '/api/cache/stats') {
            const stats = {
                totalEntries: cacheStore.size,
                memoryUsage: process.memoryUsage(),
                cacheConfig: CACHE_CONFIG,
                timestamp: new Date().toISOString()
            };
            
            return res.json(stats);
        }
        next();
    };
}

module.exports = {
    swrCache,
    cacheUpdate,
    cacheCleanup,
    cacheStats,
    cacheStore
}; 