/**
 * 缓存策略配置
 * 可以选择不同的缓存策略
 */

const { simpleCache, cacheUpdate, cacheCleanup, cacheStats } = require('./cache-middleware-simple');
const { disableCache, noCacheUpdate, noCacheCleanup } = require('./cache-disabled');

// 缓存策略配置
const CACHE_STRATEGIES = {
    // 策略1: 简化缓存（推荐）
    SIMPLE: {
        name: '简化缓存',
        description: '基本的缓存存储，无复杂SWR逻辑',
        middleware: simpleCache,
        update: cacheUpdate,
        cleanup: cacheCleanup,
        stats: cacheStats
    },
    
    // 策略2: 完全禁用缓存
    DISABLED: {
        name: '禁用缓存',
        description: '完全绕过所有缓存，确保实时性',
        middleware: disableCache,
        update: noCacheUpdate,
        cleanup: noCacheCleanup,
        stats: cacheStats
    }
};

// 当前使用的策略（可以通过环境变量或配置文件修改）
const CURRENT_STRATEGY = process.env.CACHE_STRATEGY || 'SIMPLE';

/**
 * 获取当前缓存策略
 */
function getCurrentStrategy() {
    const strategy = CACHE_STRATEGIES[CURRENT_STRATEGY];
    if (!strategy) {
        console.warn(`[缓存策略] 未知策略: ${CURRENT_STRATEGY}，使用默认策略: SIMPLE`);
        return CACHE_STRATEGIES.SIMPLE;
    }
    
    console.log(`[缓存策略] 当前使用: ${strategy.name} - ${strategy.description}`);
    return strategy;
}

/**
 * 获取所有可用策略
 */
function getAllStrategies() {
    return Object.keys(CACHE_STRATEGIES).map(key => ({
        key,
        ...CACHE_STRATEGIES[key]
    }));
}

/**
 * 切换缓存策略
 */
function switchStrategy(strategyKey) {
    if (!CACHE_STRATEGIES[strategyKey]) {
        throw new Error(`未知的缓存策略: ${strategyKey}`);
    }
    
    console.log(`[缓存策略] 切换到: ${CACHE_STRATEGIES[strategyKey].name}`);
    return CACHE_STRATEGIES[strategyKey];
}

module.exports = {
    CACHE_STRATEGIES,
    getCurrentStrategy,
    getAllStrategies,
    switchStrategy,
    CURRENT_STRATEGY
};
