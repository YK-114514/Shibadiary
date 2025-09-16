/**
 * 缓存测试脚本
 * 用于验证缓存清理功能是否正常工作
 */

const { CacheManager, CACHE_PATTERNS } = require('./cache-manager');

console.log('🧪 开始缓存测试...\n');

// 测试1: 获取初始缓存状态
console.log('📊 测试1: 获取初始缓存状态');
const initialStats = CacheManager.getStats();
console.log('初始缓存条目数:', initialStats.totalEntries);
console.log('内存使用:', Math.round(initialStats.memoryUsage.heapUsed / 1024 / 1024), 'MB\n');

// 测试2: 清理帖子相关缓存
console.log('🧹 测试2: 清理帖子相关缓存');
const postsCleared = CacheManager.invalidateByPattern(CACHE_PATTERNS.POSTS);
console.log(`清理了 ${postsCleared} 个帖子相关缓存\n`);

// 测试3: 清理所有缓存
console.log('🧹 测试3: 清理所有缓存');
const allCleared = CacheManager.clearAll();
console.log(`清理了所有缓存，共 ${allCleared} 个条目\n`);

// 测试4: 获取最终缓存状态
console.log('📊 测试4: 获取最终缓存状态');
const finalStats = CacheManager.getStats();
console.log('最终缓存条目数:', finalStats.totalEntries);
console.log('内存使用:', Math.round(finalStats.memoryUsage.heapUsed / 1024 / 1024), 'MB\n');

// 测试5: 测试模式匹配
console.log('🔍 测试5: 测试模式匹配');
const testPatterns = [
    '/api/posts/index',
    '/api/posts/123',
    '/api/posts/search',
    '/api/accounts/456/accounts'
];

testPatterns.forEach(pattern => {
    const isMatch = CacheManager.matchesPattern(pattern, '/api/posts/*');
    console.log(`模式 "/api/posts/*" 匹配 "${pattern}": ${isMatch ? '✅' : '❌'}`);
});

console.log('\n🎉 缓存测试完成！');

// 如果直接运行此脚本，显示使用说明
if (require.main === module) {
    console.log('\n📖 使用说明:');
    console.log('1. 重启您的Node.js服务器');
    console.log('2. 重启nginx服务器（如果使用）');
    console.log('3. 尝试发布新帖子，查看是否及时更新');
    console.log('4. 检查服务器日志中的缓存清理记录');
}
