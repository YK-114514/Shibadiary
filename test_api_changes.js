const axios = require('axios');

// 测试API修改
async function testAPIChanges() {
    console.log('开始测试API修改...');
    
    try {
        // 测试获取帖子列表
        console.log('\n1. 测试获取帖子列表...');
        const postsResponse = await axios.get('http://localhost:3000/api/posts/index?page=1&limit=3');
        console.log('帖子列表响应:', postsResponse.data);
        
        if (postsResponse.data.posts && postsResponse.data.posts.length > 0) {
            const firstPost = postsResponse.data.posts[0];
            console.log('第一个帖子信息:');
            console.log('- ID:', firstPost.id);
            console.log('- 用户ID:', firstPost.id_user);
            console.log('- 用户名:', firstPost.name);
            console.log('- 头像:', firstPost.avatar);
            console.log('- 内容:', firstPost.content);
        }
        
        // 测试搜索功能
        console.log('\n2. 测试搜索功能...');
        const searchResponse = await axios.get('http://localhost:3000/api/posts/search?keyword=测试');
        console.log('搜索响应:', searchResponse.data);
        
        if (searchResponse.data.data && searchResponse.data.data.length > 0) {
            const firstSearchResult = searchResponse.data.data[0];
            console.log('第一个搜索结果:');
            console.log('- ID:', firstSearchResult.id);
            console.log('- 用户ID:', firstSearchResult.id_user);
            console.log('- 用户名:', firstSearchResult.name);
            console.log('- 头像:', firstSearchResult.avatar);
        }
        
        console.log('\n✅ API修改测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        if (error.response) {
            console.error('响应数据:', error.response.data);
        }
    }
}

testAPIChanges(); 