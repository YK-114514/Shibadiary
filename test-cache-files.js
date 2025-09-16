/**
 * 测试缓存相关文件是否能正常加载
 */

console.log('🧪 测试缓存相关文件...\n');

// 测试1: 缓存配置
console.log('📋 测试1: 缓存配置');
try {
    const cacheConfig = require('./cache-config');
    console.log('✅ 缓存配置加载成功');
    console.log('策略数量:', Object.keys(cacheConfig.strategies).length);
} catch (error) {
    console.log('❌ 缓存配置加载失败:', error.message);
}

// 测试2: 简化缓存中间件
console.log('\n📋 测试2: 简化缓存中间件');
try {
    const simpleCache = require('./cache-middleware-simple');
    console.log('✅ 简化缓存中间件加载成功');
    console.log('导出函数:', Object.keys(simpleCache));
} catch (error) {
    console.log('❌ 简化缓存中间件加载失败:', error.message);
}

// 测试3: 禁用缓存中间件
console.log('\n📋 测试3: 禁用缓存中间件');
try {
    const disabledCache = require('./cache-disabled');
    console.log('✅ 禁用缓存中间件加载成功');
    console.log('导出函数:', Object.keys(disabledCache));
} catch (error) {
    console.log('❌ 禁用缓存中间件加载失败:', error.message);
}

// 测试4: 缓存策略配置
console.log('\n📋 测试4: 缓存策略配置');
try {
    const cacheStrategy = require('./cache-strategy');
    console.log('✅ 缓存策略配置加载成功');
    console.log('导出函数:', Object.keys(cacheStrategy));
} catch (error) {
    console.log('❌ 缓存策略配置加载失败:', error.message);
}

console.log('\n🎯 如果所有测试都通过，说明缓存文件正常');
console.log('如果某个测试失败，请检查对应的文件');
