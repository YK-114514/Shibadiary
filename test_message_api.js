const axios = require('axios');

// 测试消息中心API
async function testMessageAPI() {
    try {
        console.log('开始测试消息中心API...');
        
        // 首先登录获取token
        const loginResponse = await axios.post('http://localhost:3000/api/user/login', {
            phone: '19999999999', // 使用testAccount用户
            password: '12345678' // 正确的密码
        });
        
        console.log('登录成功:', loginResponse.data);
        const token = loginResponse.data.token;
        
        // 测试获取消息列表
        console.log('\n测试获取消息列表...');
        const messagesResponse = await axios.get('http://localhost:3000/api/message', {
            headers: {
                'Authorization': token
            }
        });
        
        console.log('消息列表响应:', messagesResponse.data);
        
        // 如果有消息，测试标记已读
        if (messagesResponse.data.messages && messagesResponse.data.messages.length > 0) {
            const firstMessage = messagesResponse.data.messages[0];
            console.log('\n测试标记消息已读...');
            
            const readResponse = await axios.put(`http://localhost:3000/api/message/${firstMessage.id}/read`, {}, {
                headers: {
                    'Authorization': token
                }
            });
            
            console.log('标记已读响应:', readResponse.data);
        }
        
        // 测试标记所有消息为已读
        console.log('\n测试标记所有消息为已读...');
        const readAllResponse = await axios.put('http://localhost:3000/api/message/read-all', {}, {
            headers: {
                'Authorization': token
            }
        });
        
        console.log('标记全部已读响应:', readAllResponse.data);
        
    } catch (error) {
        console.error('测试失败:', error.response?.data || error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应头:', error.response.headers);
        }
    }
}

// 运行测试
testMessageAPI(); 