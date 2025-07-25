const axios = require('axios');

async function testSearch() {
    try {
        console.log('测试搜索API...');
        
        // 测试搜索
        const response = await axios.get('http://localhost:3000/api/posts/search?keyword=test');
        console.log('✅ 搜索API正常');
        console.log('响应状态:', response.status);
        console.log('响应数据:', response.data);
        
    } catch (error) {
        console.error('❌ 搜索API失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testSearch(); 