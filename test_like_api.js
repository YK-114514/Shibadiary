const axios = require('axios');

// 测试点赞API
async function testLikeAPI() {
    try {
        console.log('开始测试点赞API...');
        
        // 首先登录获取token
        const loginResponse = await axios.post('http://localhost:3000/api/user/login', {
            phone: '13999999999', // 使用数据库中存在的用户
            password: '12345678' // 正确的密码
        });
        
        console.log('登录成功:', loginResponse.data);
        const token = loginResponse.data.token;
        
        // 测试点赞API
        const likeResponse = await axios.post('http://localhost:3000/api/posts/addLike', {
            userid_like: 2, // 用户ID为2 (Niconiconi)
            id_from_post: 12 // 使用存在的帖子ID
        }, {
            headers: {
                'Authorization': token
            }
        });
        
        console.log('点赞API响应:', likeResponse.data);
        
        // 检查数据库中的点赞记录
        console.log('\n检查数据库中的点赞记录...');
        const checkResponse = await axios.get('http://localhost:3000/api/posts/like/12');
        console.log('点赞记录:', checkResponse.data);
        
    } catch (error) {
        console.error('测试失败:', error.response?.data || error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应头:', error.response.headers);
        }
    }
}

// 运行测试
testLikeAPI(); 