const axios = require('axios');
const fs = require('fs');

console.log('🚀 开始生产环境测试...');
console.log('========================');

// 测试配置
const TEST_CONFIG = {
    baseURL: 'http://47.83.218.173',
    timeout: 10000,
    headers: {
        'User-Agent': 'Production-Test/1.0'
    }
};

// 测试页面列表
const TEST_PAGES = [
    '/',
    '/index',
    '/login',
    '/register',
    '/personal',
    '/message',
    '/api/data',
    '/api/posts/index',
    '/health'
];

// 测试静态资源
const TEST_STATIC = [
    '/front-end/css/index.min.css',
    '/front-end/images/logo.png',
    '/front-end/http.js'
];

// 页面加载测试
async function testPageLoading() {
    console.log('\n📄 测试页面加载...');
    
    const results = [];
    
    for (const page of TEST_PAGES) {
        try {
            const start = Date.now();
            const response = await axios.get(`${TEST_CONFIG.baseURL}${page}`, {
                timeout: TEST_CONFIG.timeout,
                headers: TEST_CONFIG.headers
            });
            const duration = Date.now() - start;
            
            results.push({
                page,
                status: response.status,
                duration,
                success: true
            });
            
            console.log(`✅ ${page} - ${response.status} - ${duration}ms`);
            
        } catch (error) {
            const duration = Date.now() - Date.now();
            results.push({
                page,
                status: error.response?.status || 0,
                duration,
                success: false,
                error: error.message
            });
            
            console.log(`❌ ${page} - ${error.response?.status || 'ERROR'} - ${error.message}`);
        }
    }
    
    return results;
}

// 静态资源测试
async function testStaticResources() {
    console.log('\n📦 测试静态资源...');
    
    const results = [];
    
    for (const resource of TEST_STATIC) {
        try {
            const start = Date.now();
            const response = await axios.get(`${TEST_CONFIG.baseURL}${resource}`, {
                timeout: TEST_CONFIG.timeout,
                headers: TEST_CONFIG.headers
            });
            const duration = Date.now() - start;
            
            results.push({
                resource,
                status: response.status,
                duration,
                success: true,
                size: response.headers['content-length'] || 'unknown'
            });
            
            console.log(`✅ ${resource} - ${response.status} - ${duration}ms - ${response.headers['content-length'] || 'unknown'} bytes`);
            
        } catch (error) {
            const duration = Date.now() - Date.now();
            results.push({
                resource,
                status: error.response?.status || 0,
                duration,
                success: false,
                error: error.message
            });
            
            console.log(`❌ ${resource} - ${error.response?.status || 'ERROR'} - ${error.message}`);
        }
    }
    
    return results;
}

// API性能测试
async function testAPIPerformance() {
    console.log('\n⚡ 测试API性能...');
    
    const apiTests = [
        { name: '健康检查', url: '/health' },
        { name: '数据API', url: '/api/data' },
        { name: '帖子列表', url: '/api/posts/index?page=1&limit=5' }
    ];
    
    const results = [];
    
    for (const test of apiTests) {
        try {
            const start = Date.now();
            const response = await axios.get(`${TEST_CONFIG.baseURL}${test.url}`, {
                timeout: TEST_CONFIG.timeout,
                headers: TEST_CONFIG.headers
            });
            const duration = Date.now() - start;
            
            results.push({
                name: test.name,
                url: test.url,
                status: response.status,
                duration,
                success: true,
                dataSize: JSON.stringify(response.data).length
            });
            
            console.log(`✅ ${test.name} - ${response.status} - ${duration}ms - ${JSON.stringify(response.data).length} bytes`);
            
        } catch (error) {
            const duration = Date.now() - Date.now();
            results.push({
                name: test.name,
                url: test.url,
                status: error.response?.status || 0,
                duration,
                success: false,
                error: error.message
            });
            
            console.log(`❌ ${test.name} - ${error.response?.status || 'ERROR'} - ${error.message}`);
        }
    }
    
    return results;
}

// 并发测试
async function testConcurrency() {
    console.log('\n🔄 测试并发性能...');
    
    const concurrentRequests = 10;
    const promises = [];
    
    for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
            axios.get(`${TEST_CONFIG.baseURL}/api/data`, {
                timeout: TEST_CONFIG.timeout,
                headers: TEST_CONFIG.headers
            }).then(response => ({
                success: true,
                status: response.status,
                duration: Date.now() - Date.now()
            })).catch(error => ({
                success: false,
                status: error.response?.status || 0,
                error: error.message
            }))
        );
    }
    
    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    console.log(`✅ 并发测试完成: ${successCount} 成功, ${failureCount} 失败`);
    
    return {
        total: results.length,
        success: successCount,
        failure: failureCount,
        successRate: (successCount / results.length * 100).toFixed(2) + '%'
    };
}

// 生成测试报告
function generateReport(pageResults, staticResults, apiResults, concurrencyResults) {
    console.log('\n📊 测试报告');
    console.log('==========');
    
    // 页面加载统计
    const pageSuccess = pageResults.filter(r => r.success).length;
    const pageFailure = pageResults.length - pageSuccess;
    console.log(`📄 页面加载: ${pageSuccess}/${pageResults.length} 成功 (${(pageSuccess/pageResults.length*100).toFixed(1)}%)`);
    
    // 静态资源统计
    const staticSuccess = staticResults.filter(r => r.success).length;
    const staticFailure = staticResults.length - staticSuccess;
    console.log(`📦 静态资源: ${staticSuccess}/${staticResults.length} 成功 (${(staticSuccess/staticResults.length*100).toFixed(1)}%)`);
    
    // API性能统计
    const apiSuccess = apiResults.filter(r => r.success).length;
    const apiFailure = apiResults.length - apiSuccess;
    console.log(`⚡ API性能: ${apiSuccess}/${apiResults.length} 成功 (${(apiSuccess/apiResults.length*100).toFixed(1)}%)`);
    
    // 平均响应时间
    const avgPageTime = pageResults.reduce((sum, r) => sum + r.duration, 0) / pageResults.length;
    const avgApiTime = apiResults.reduce((sum, r) => sum + r.duration, 0) / apiResults.length;
    
    console.log(`⏱️ 平均页面响应时间: ${avgPageTime.toFixed(0)}ms`);
    console.log(`⏱️ 平均API响应时间: ${avgApiTime.toFixed(0)}ms`);
    console.log(`🔄 并发成功率: ${concurrencyResults.successRate}`);
    
    // 性能评估
    console.log('\n📈 性能评估:');
    if (avgPageTime < 1000) {
        console.log('✅ 页面加载速度: 优秀 (< 1s)');
    } else if (avgPageTime < 3000) {
        console.log('🟡 页面加载速度: 良好 (< 3s)');
    } else {
        console.log('🔴 页面加载速度: 需要优化 (> 3s)');
    }
    
    if (avgApiTime < 500) {
        console.log('✅ API响应速度: 优秀 (< 500ms)');
    } else if (avgApiTime < 1000) {
        console.log('🟡 API响应速度: 良好 (< 1s)');
    } else {
        console.log('🔴 API响应速度: 需要优化 (> 1s)');
    }
    
    if (parseFloat(concurrencyResults.successRate) > 90) {
        console.log('✅ 并发处理能力: 优秀 (> 90%)');
    } else if (parseFloat(concurrencyResults.successRate) > 70) {
        console.log('🟡 并发处理能力: 良好 (> 70%)');
    } else {
        console.log('🔴 并发处理能力: 需要优化 (< 70%)');
    }
    
    // 问题诊断
    console.log('\n🔍 问题诊断:');
    const failedPages = pageResults.filter(r => !r.success);
    if (failedPages.length > 0) {
        console.log('❌ 页面加载失败:');
        failedPages.forEach(page => {
            console.log(`   - ${page.page}: ${page.error}`);
        });
    }
    
    const failedStatic = staticResults.filter(r => !r.success);
    if (failedStatic.length > 0) {
        console.log('❌ 静态资源加载失败:');
        failedStatic.forEach(resource => {
            console.log(`   - ${resource.resource}: ${resource.error}`);
        });
    }
    
    const failedAPIs = apiResults.filter(r => !r.success);
    if (failedAPIs.length > 0) {
        console.log('❌ API调用失败:');
        failedAPIs.forEach(api => {
            console.log(`   - ${api.name}: ${api.error}`);
        });
    }
    
    // 建议
    console.log('\n💡 优化建议:');
    if (avgPageTime > 3000) {
        console.log('• 优化页面加载速度');
        console.log('• 启用静态文件缓存');
        console.log('• 压缩图片和CSS文件');
    }
    
    if (avgApiTime > 1000) {
        console.log('• 优化数据库查询');
        console.log('• 添加数据库索引');
        console.log('• 启用API缓存');
    }
    
    if (parseFloat(concurrencyResults.successRate) < 90) {
        console.log('• 增加服务器资源');
        console.log('• 优化并发处理');
        console.log('• 检查数据库连接池');
    }
    
    console.log('\n🎉 生产环境测试完成！');
}

// 主测试函数
async function runProductionTest() {
    try {
        console.log('开始生产环境测试...\n');
        
        // 1. 测试页面加载
        const pageResults = await testPageLoading();
        
        // 2. 测试静态资源
        const staticResults = await testStaticResources();
        
        // 3. 测试API性能
        const apiResults = await testAPIPerformance();
        
        // 4. 测试并发性能
        const concurrencyResults = await testConcurrency();
        
        // 5. 生成报告
        generateReport(pageResults, staticResults, apiResults, concurrencyResults);
        
    } catch (error) {
        console.error('测试过程中出现错误:', error.message);
    }
}

// 运行测试
runProductionTest(); 