/**
 * 缓存管理器
 * 提供缓存失效和清理功能
 */

const { cacheStore } = require('./cache-middleware');

/**
 * 缓存管理器类
 */
class CacheManager {
    /**
     * 根据路径模式清理缓存
     * @param {string|Array} patterns - 缓存路径模式
     */
    static invalidateByPattern(patterns) {
        if (typeof patterns === 'string') {
            patterns = [patterns];
        }
        
        console.log(`[缓存管理] 开始清理缓存，模式: ${patterns.join(', ')}`);
        console.log(`[缓存管理] 当前缓存总数: ${cacheStore.size}`);
        
        let clearedCount = 0;
        const keysToDelete = [];
        
        // 显示所有缓存键用于调试
        console.log(`[缓存管理] 当前所有缓存键:`);
        for (const [key, entry] of cacheStore.entries()) {
            console.log(`  - ${key}`);
        }
        
        for (const [key, entry] of cacheStore.entries()) {
            for (const pattern of patterns) {
                if (this.matchesPattern(key, pattern)) {
                    keysToDelete.push(key);
                    console.log(`[缓存管理] 匹配模式 "${pattern}" -> 缓存键 "${key}"`);
                    break;
                }
            }
        }
        
        // 删除匹配的缓存
        keysToDelete.forEach(key => {
            cacheStore.delete(key);
            clearedCount++;
        });
        
        // 强制清理所有可能的缓存（更激进的策略）
        if (clearedCount === 0) {
            console.log(`[缓存管理] 没有找到匹配的缓存，执行强制清理...`);
            for (const [key, entry] of cacheStore.entries()) {
                if (key.includes('/api/posts/') || key.includes('/api/')) {
                    keysToDelete.push(key);
                }
            }
            
            keysToDelete.forEach(key => {
                cacheStore.delete(key);
                clearedCount++;
            });
            
            console.log(`[缓存管理] 强制清理了 ${clearedCount} 个缓存条目`);
        }
        
        if (clearedCount > 0) {
            console.log(`[缓存管理] 成功清理了 ${clearedCount} 个缓存条目`);
        } else {
            console.log(`[缓存管理] 没有找到匹配的缓存条目`);
        }
        
        console.log(`[缓存管理] 清理后缓存总数: ${cacheStore.size}`);
        
        return clearedCount;
    }
    
    /**
     * 清理所有缓存
     */
    static clearAll() {
        const size = cacheStore.size;
        cacheStore.clear();
        console.log(`[缓存管理] 清理了所有缓存，共 ${size} 个条目`);
        return size;
    }
    
    /**
     * 清理特定用户的缓存
     * @param {number} userId - 用户ID
     */
    static invalidateUserCache(userId) {
        let clearedCount = 0;
        const keysToDelete = [];
        
        for (const [key, entry] of cacheStore.entries()) {
            if (key.includes(`:user_${userId}`)) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => {
            cacheStore.delete(key);
            clearedCount++;
        });
        
        if (clearedCount > 0) {
            console.log(`[缓存管理] 清理了用户 ${userId} 的 ${clearedCount} 个缓存条目`);
        }
        
        return clearedCount;
    }
    
    /**
     * 检查路径是否匹配模式
     * @param {string} path - 缓存键路径
     * @param {string} pattern - 匹配模式
     * @returns {boolean} 是否匹配
     */
    static matchesPattern(path, pattern) {
        // 移除查询参数和用户信息部分
        const cleanPath = path.split('{')[0].split(':user_')[0];
        
        // 调试信息
        console.log(`    [匹配] 缓存键: "${path}" -> 清理后: "${cleanPath}"`);
        console.log(`    [匹配] 模式: "${pattern}"`);
        
        // 精确匹配
        if (pattern === cleanPath) {
            console.log(`    [匹配] ✅ 精确匹配成功`);
            return true;
        }
        
        // 模式匹配（处理动态参数）
        if (pattern.includes(':')) {
            const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+');
            const isMatch = new RegExp(`^${regexPattern}$`).test(cleanPath);
            console.log(`    [匹配] ${isMatch ? '✅' : '❌'} 动态参数匹配: ${regexPattern} -> ${isMatch}`);
            return isMatch;
        }
        
        // 前缀匹配
        if (pattern.endsWith('*')) {
            const prefix = pattern.slice(0, -1);
            const isMatch = cleanPath.startsWith(prefix);
            console.log(`    [匹配] ${isMatch ? '✅' : '❌'} 前缀匹配: "${prefix}" -> ${isMatch}`);
            return isMatch;
        }
        
        // 路径前缀匹配（处理 /api/posts/* 这样的模式）
        if (pattern.includes('*')) {
            const prefix = pattern.replace('*', '');
            const isMatch = cleanPath.startsWith(prefix);
            console.log(`    [匹配] ${isMatch ? '✅' : '❌'} 通配符匹配: "${prefix}" -> ${isMatch}`);
            return isMatch;
        }
        
        // 动态参数匹配（处理 /api/accounts/*/accounts 这样的模式）
        if (pattern.includes('*')) {
            const parts = pattern.split('*');
            if (parts.length === 2) {
                const startPart = parts[0];
                const endPart = parts[1];
                const isMatch = cleanPath.startsWith(startPart) && cleanPath.endsWith(endPart);
                console.log(`    [匹配] ${isMatch ? '✅' : '❌'} 动态参数匹配: "${startPart}*${endPart}" -> ${isMatch}`);
                return isMatch;
            }
        }
        
        console.log(`    [匹配] ❌ 无匹配`);
        return false;
    }
    
    /**
     * 获取缓存统计信息
     */
    static getStats() {
        return {
            totalEntries: cacheStore.size,
            memoryUsage: process.memoryUsage(),
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * 预定义的缓存清理模式
 */
const CACHE_PATTERNS = {
    // 帖子相关
    POSTS: [
        '/api/posts/index',
        '/api/posts/indexLike',
        '/api/posts/search',
        '/api/posts/*'  // 所有帖子详情
    ],
    
    // 用户相关
    USER_PROFILE: [
        '/api/accounts/*/accounts',
        '/api/accounts/check-follow',
        '/api/accounts/following/*',
        '/api/personal/personal'
    ],
    
    // 消息相关
    MESSAGES: [
        '/api/message'
    ]
};

module.exports = {
    CacheManager,
    CACHE_PATTERNS
};
