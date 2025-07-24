const axios = require('axios');

async function testCollectRoute() {
    try {
        console.log('测试 /api/posts/collect 路由...');
        
        // 测试不带认证头的请求
        try {
            const res = await axios.get('http://localhost:3000/api/posts/collect');
            console.log('✅ 不带认证头的请求成功:', res.data);
        } catch (error) {
            console.log('❌ 不带认证头的请求失败:', error.response?.status, error.response?.data);
        }
        
        // 测试带认证头的请求
        try {
            const res = await axios.get('http://localhost:3000/api/posts/collect', {
                headers: {
                    'Authorization': 'Bearer YOUR_JWT_TOKEN'
                }
            });
            console.log('✅ 带认证头的请求成功:', res.data);
        } catch (error) {
            console.log('❌ 带认证头的请求失败:', error.response?.status, error.response?.data);
        }
        
    } catch (error) {
        console.error('测试失败:', error.message);
    }
}

testCollectRoute(); 