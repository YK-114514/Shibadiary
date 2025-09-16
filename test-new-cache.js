/**
 * 测试新的缓存策略
 */

const { getCurrentStrategy, getAllStrategies, switchStrategy } = require('./cache-strategy');

console.log('🧪 测试新的缓存策略...\n');

// 显示所有可用策略
console.log('📋 所有可用策略:');
const allStrategies = getAllStrategies();
allStrategies.forEach(strategy => {
    console.log(`  ${strategy.key}: ${strategy.name} - ${strategy.description}`);
});

console.log('\n=== 当前策略测试 ===');

// 测试当前策略
const currentStrategy = getCurrentStrategy();
console.log(`当前策略: ${currentStrategy.name}`);
console.log(`描述: ${currentStrategy.description}`);

// 测试策略切换
console.log('\n=== 策略切换测试 ===');
try {
    const newStrategy = switchStrategy('DISABLED');
    console.log(`切换到: ${newStrategy.name}`);
    
    const backStrategy = switchStrategy('SIMPLE');
    console.log(`切换回: ${backStrategy.name}`);
} catch (error) {
    console.log(`策略切换失败: ${error.message}`);
}

console.log('\n=== 使用说明 ===');
console.log('1. 重启Node.js服务器');
console.log('2. 系统会自动使用简化缓存策略');
console.log('3. 如果仍有问题，可以设置环境变量禁用缓存:');
console.log('   export CACHE_STRATEGY=DISABLED');
console.log('4. 或者直接修改cache-strategy.js中的CURRENT_STRATEGY');

console.log('\n=== 预期效果 ===');
console.log('简化缓存策略:');
console.log('- 无复杂的SWR逻辑');
console.log('- 缓存过期后直接查询数据库');
console.log('- 确保数据实时性');

console.log('\n禁用缓存策略:');
console.log('- 完全绕过所有缓存');
console.log('- 每次请求都查询数据库');
console.log('- 100%实时性，但性能较低');

console.log('\n🎯 建议: 先使用简化缓存策略，如果仍有问题再禁用缓存');
