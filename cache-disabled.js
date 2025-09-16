/**
 * 禁用缓存中间件
 * 完全绕过所有缓存，确保实时性
 */

/**
 * 禁用缓存中间件
 */
function disableCache() {
    return (req, res, next) => {
        // 设置禁用缓存的头
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('X-Cache-Status', 'DISABLED');
        
        // 直接传递给下一个中间件，不做任何缓存
        next();
    };
}

/**
 * 空缓存更新中间件
 */
function noCacheUpdate() {
    return (req, res, next) => {
        // 不做任何缓存操作
        next();
    };
}

/**
 * 空缓存清理中间件
 */
function noCacheCleanup() {
    // 不做任何清理操作
    console.log('[缓存] 缓存已禁用，跳过清理');
}

/**
 * 缓存统计中间件
 */
function cacheStats() {
    return (req, res, next) => {
        if (req.path === '/api/cache/stats') {
            const stats = {
                totalEntries: 0,
                memoryUsage: process.memoryUsage(),
                cacheConfig: { status: 'DISABLED' },
                timestamp: new Date().toISOString()
            };
            
            return res.json(stats);
        }
        next();
    };
}

module.exports = {
    disableCache,
    noCacheUpdate,
    noCacheCleanup,
    cacheStats
};
