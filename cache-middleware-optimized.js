/**
 * 优化的缓存中间件
 * 提供智能缓存策略和性能优化
 */

const { CacheManager, CACHE_PATTERNS } = require('./cache-manager');

class OptimizedCacheMiddleware {
    constructor(options = {}) {
        this.options = {
            // 默认缓存配置
            defaultTTL: 5 * 60 * 1000, // 5分钟
            maxSize: 1000,              // 最大缓存条目数
            enableCompression: true,    // 启用压缩
            enableStats: true,          // 启用统计
            ...options
        };
        
        this.cacheStore = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };
        
        // 定期清理过期缓存
        setInterval(() => this.cleanupExpired(), 60 * 1000); // 每分钟清理一次
        
        console.log('[缓存中间件] 优化的缓存中间件已初始化');
    }

    /**
     * 创建缓存中间件
     */
    createMiddleware(ttl = null, keyGenerator = null) {
        return (req, res, next) => {
            // 跳过非GET请求
            if (req.method !== 'GET') {
                return next();
            }

            // 跳过API请求（可选）
            if (req.path.startsWith('/api/') && !this.options.cacheAPI) {
                return next();
            }

            const cacheKey = keyGenerator ? keyGenerator(req) : this.generateCacheKey(req);
            const cacheTTL = ttl || this.options.defaultTTL;

            // 尝试从缓存获取
            const cached = this.get(cacheKey);
            if (cached && !this.isExpired(cached)) {
                this.stats.hits++;
                return this.sendCachedResponse(res, cached);
            }

            this.stats.misses++;

            // 重写res.send以缓存响应
            const originalSend = res.send;
            res.send = (body) => {
                // 恢复原始方法
                res.send = originalSend;
                
                // 缓存响应
                this.set(cacheKey, {
                    body: body,
                    headers: res.getHeaders(),
                    statusCode: res.statusCode,
                    timestamp: Date.now(),
                    ttl: cacheTTL
                });

                // 发送响应
                originalSend.call(res, body);
            };

            next();
        };
    }

    /**
     * 生成缓存键
     */
    generateCacheKey(req) {
        const key = `${req.method}:${req.path}:${JSON.stringify(req.query)}:${req.user?.id_user || 'guest'}`;
        return this.hashString(key);
    }

    /**
     * 简单的字符串哈希函数
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return `cache_${Math.abs(hash)}`;
    }

    /**
     * 获取缓存
     */
    get(key) {
        const entry = this.cacheStore.get(key);
        if (entry && !this.isExpired(entry)) {
            return entry;
        }
        
        // 删除过期条目
        if (entry) {
            this.cacheStore.delete(key);
        }
        
        return null;
    }

    /**
     * 设置缓存
     */
    set(key, value) {
        // 检查缓存大小限制
        if (this.cacheStore.size >= this.options.maxSize) {
            this.evictOldest();
        }

        this.cacheStore.set(key, value);
        this.stats.sets++;
    }

    /**
     * 检查是否过期
     */
    isExpired(entry) {
        return Date.now() - entry.timestamp > entry.ttl;
    }

    /**
     * 清理过期缓存
     */
    cleanupExpired() {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [key, entry] of this.cacheStore.entries()) {
            if (this.isExpired(entry)) {
                this.cacheStore.delete(key);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`[缓存中间件] 清理了 ${cleanedCount} 个过期缓存条目`);
        }
    }

    /**
     * 淘汰最旧的缓存条目
     */
    evictOldest() {
        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, entry] of this.cacheStore.entries()) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cacheStore.delete(oldestKey);
            console.log(`[缓存中间件] 淘汰最旧缓存条目: ${oldestKey}`);
        }
    }

    /**
     * 发送缓存的响应
     */
    sendCachedResponse(res, cached) {
        // 设置缓存头
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Age', Math.floor((Date.now() - cached.timestamp) / 1000));
        
        // 设置响应头
        Object.entries(cached.headers).forEach(([key, value]) => {
            res.set(key, value);
        });

        // 发送响应
        res.status(cached.statusCode).send(cached.body);
    }

    /**
     * 创建API缓存中间件
     */
    createAPICacheMiddleware(ttl = 5 * 60 * 1000) {
        return this.createMiddleware(ttl, (req) => {
            // 为API请求生成更精确的缓存键
            const userAgent = req.get('User-Agent') || '';
            const accept = req.get('Accept') || '';
            return `api:${req.path}:${JSON.stringify(req.query)}:${req.user?.id_user || 'guest'}:${this.hashString(userAgent + accept)}`;
        });
    }

    /**
     * 创建静态文件缓存中间件
     */
    createStaticCacheMiddleware(ttl = 24 * 60 * 60 * 1000) { // 24小时
        return this.createMiddleware(ttl, (req) => {
            return `static:${req.path}:${req.get('If-None-Match') || 'no-etag'}`;
        });
    }

    /**
     * 创建用户特定缓存中间件
     */
    createUserCacheMiddleware(ttl = 2 * 60 * 1000) { // 2分钟
        return this.createMiddleware(ttl, (req) => {
            return `user:${req.user?.id_user || 'guest'}:${req.path}:${JSON.stringify(req.query)}`;
        });
    }

    /**
     * 批量清理缓存
     */
    invalidateByPattern(pattern) {
        let clearedCount = 0;
        const keysToDelete = [];

        for (const [key, entry] of this.cacheStore.entries()) {
            if (this.matchesPattern(key, pattern)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => {
            this.cacheStore.delete(key);
            clearedCount++;
        });

        console.log(`[缓存中间件] 按模式清理了 ${clearedCount} 个缓存条目`);
        return clearedCount;
    }

    /**
     * 检查键是否匹配模式
     */
    matchesPattern(key, pattern) {
        if (typeof pattern === 'string') {
            return key.includes(pattern);
        }
        if (pattern instanceof RegExp) {
            return pattern.test(key);
        }
        if (Array.isArray(pattern)) {
            return pattern.some(p => this.matchesPattern(key, p));
        }
        return false;
    }

    /**
     * 获取缓存统计信息
     */
    getStats() {
        const hitRate = this.stats.hits + this.stats.misses > 0 
            ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
            : 0;

        return {
            ...this.stats,
            hitRate: `${hitRate}%`,
            size: this.cacheStore.size,
            maxSize: this.options.maxSize
        };
    }

    /**
     * 清理所有缓存
     */
    clearAll() {
        const size = this.cacheStore.size;
        this.cacheStore.clear();
        this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
        console.log(`[缓存中间件] 清理了所有缓存，共 ${size} 个条目`);
        return size;
    }

    /**
     * 获取缓存大小
     */
    getSize() {
        return this.cacheStore.size;
    }

    /**
     * 检查缓存键是否存在
     */
    has(key) {
        const entry = this.cacheStore.get(key);
        return entry && !this.isExpired(entry);
    }
}

// 创建默认实例
const defaultCacheMiddleware = new OptimizedCacheMiddleware();

module.exports = {
    OptimizedCacheMiddleware,
    defaultCacheMiddleware,
    createMiddleware: (ttl, keyGenerator) => defaultCacheMiddleware.createMiddleware(ttl, keyGenerator),
    createAPICache: (ttl) => defaultCacheMiddleware.createAPICacheMiddleware(ttl),
    createStaticCache: (ttl) => defaultCacheMiddleware.createStaticCacheMiddleware(ttl),
    createUserCache: (ttl) => defaultCacheMiddleware.createUserCacheMiddleware(ttl),
    invalidateByPattern: (pattern) => defaultCacheMiddleware.invalidateByPattern(pattern),
    getStats: () => defaultCacheMiddleware.getStats(),
    clearAll: () => defaultCacheMiddleware.clearAll()
};
