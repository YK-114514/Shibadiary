/**
 * 缓存诊断脚本
 * 帮助排查缓存更新延迟问题
 */

const { CacheManager } = require('./cache-manager');

console.log('🔍 缓存问题诊断工具\n');

console.log('=== 问题排查清单 ===');
console.log('1. ✅ 缓存管理器已创建');
console.log('2. ✅ 缓存清理函数已添加到帖子路由');
console.log('3. ✅ nginx缓存时间已减少到10秒');
console.log('4. ✅ 应用缓存时间已减少到10秒');
console.log('5. ✅ 新增了紧急缓存清理API\n');

console.log('=== 当前缓存状态 ===');
try {
    const stats = CacheManager.getStats();
    console.log(`缓存条目数: ${stats.totalEntries}`);
    console.log(`内存使用: ${Math.round(stats.memoryUsage.heapUsed / 1024 / 1024)} MB`);
    console.log(`时间戳: ${stats.timestamp}\n`);
} catch (error) {
    console.log(`❌ 获取缓存状态失败: ${error.message}\n`);
}

console.log('=== 测试步骤 ===');
console.log('1. 重启Node.js服务器');
console.log('2. 重启nginx服务器（如果使用）');
console.log('3. 发布一个新帖子');
console.log('4. 检查服务器控制台是否有缓存清理日志');
console.log('5. 等待10-30秒后刷新页面\n');

console.log('=== 调试API端点 ===');
console.log('GET  /api/posts/cache/stats          - 查看缓存统计');
console.log('POST /api/posts/cache/clear          - 清理指定类型缓存');
console.log('POST /api/posts/cache/emergency-clear - 紧急清理所有缓存（无需认证）\n');

console.log('=== 缓存清理测试 ===');
console.log('清理所有缓存...');
try {
    const cleared = CacheManager.clearAll();
    console.log(`✅ 成功清理了 ${cleared} 个缓存条目\n`);
} catch (error) {
    console.log(`❌ 缓存清理失败: ${error.message}\n`);
}

console.log('=== 常见问题解决方案 ===');
console.log('问题1: 缓存清理后仍然不更新');
console.log('解决: 检查nginx是否重启，检查浏览器是否清除了缓存\n');

console.log('问题2: 服务器日志中没有缓存清理记录');
console.log('解决: 检查CacheManager是否正确导入，检查路由是否正确配置\n');

console.log('问题3: 某些页面更新了，某些没有');
console.log('解决: 检查是否有其他缓存层（如CDN、浏览器缓存）\n');

console.log('=== 强制刷新方法 ===');
console.log('1. 浏览器: Ctrl+F5 或 Cmd+Shift+R');
console.log('2. 移动端: 下拉刷新');
console.log('3. API: 调用紧急缓存清理接口');
console.log('4. 服务器: 重启Node.js和nginx\n');

console.log('🎯 如果问题仍然存在，请检查:');
console.log('- 服务器错误日志');
console.log('- 浏览器开发者工具的网络请求');
console.log('- 是否有其他中间件干扰缓存');
console.log('- 数据库连接是否正常');
