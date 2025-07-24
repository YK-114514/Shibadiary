const axios = require('axios');

// 测试点赞功能
async function testLike() {
    try {
        const response = await axios.post('http://localhost:3000/api/posts/addLike', {
            userid_like: 1,  // 假设用户ID为1
            id_from_post: 1  // 假设帖子ID为1
        }, {
            headers: {
                'Authorization': 'Bearer YOUR_TOKEN_HERE' // 需要替换为实际的token
            }
        });
        
        console.log('点赞成功:', response.data);
    } catch (error) {
        console.error('点赞失败:', error.response?.data || error.message);
    }
}

// 运行测试
testLike(); 