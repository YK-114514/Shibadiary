const axios = require('axios');

async function testAPI() {
    try {
        console.log('测试API接口...');
        
        // 测试获取所有帖子
        console.log('\n1. 测试获取所有帖子:');
        const allPosts = await axios.get('http://localhost:3000/api/posts/index');
        console.log('成功获取所有帖子，数量:', allPosts.data.length);
        
        // 测试获取单个帖子详情
        console.log('\n2. 测试获取帖子详情 (ID: 12):');
        const postDetail = await axios.get('http://localhost:3000/api/posts/12');
        console.log('成功获取帖子详情:', postDetail.data);
        
        // 测试获取帖子评论
        console.log('\n3. 测试获取帖子评论 (ID: 12):');
        const comments = await axios.get('http://localhost:3000/api/posts/12/comments');
        console.log('成功获取评论，数量:', comments.data.length);
        
        console.log('\n✅ 所有API接口测试通过！');
        
    } catch (error) {
        console.error('❌ API测试失败:', error.message);
        if (error.response) {
            console.error('状态码:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testAPI(); 