const axios = require('axios');

async function simpleTest() {
    try {
        console.log('测试服务器连接...');
        
        // 测试基本连接
        const response = await axios.get('http://localhost:3000/api/posts/index?page=1&limit=1');
        console.log('✅ 服务器连接正常');
        console.log('响应状态:', response.status);
        console.log('响应数据:', response.data);
        
    } catch (error) {
        console.error('❌ 连接失败:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('服务器可能没有运行，请启动服务器');
        }
    }
}

simpleTest(); 