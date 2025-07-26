const axios = require('axios');

// 测试消息中心API
async function testMessageAPI() {
    try {
        console.log('开始测试消息中心API...');
        
        // 1. 登录获取token
        console.log('\n1. 登录获取token...');
        const loginRes = await axios.post('http://localhost:3000/api/user/login', {
            phone: '19999999999',
            password: '123456'
        });
        
        if (!loginRes.data.success) {
            console.error('登录失败:', loginRes.data);
            return;
        }
        
        console.log('登录成功:', loginRes.data);
        const token = loginRes.data.token;
        
        // 设置请求头
        axios.defaults.headers.common['Authorization'] = token;
        
        // 2. 获取消息列表
        console.log('\n2. 获取消息列表...');
        const messagesRes = await axios.get('http://localhost:3000/api/message');
        
        if (!messagesRes.data.success) {
            console.error('获取消息失败:', messagesRes.data);
            return;
        }
        
        console.log('消息列表响应:', messagesRes.data);
        
        // 检查是否有关注消息
        const followMessages = messagesRes.data.messages.filter(msg => msg.type === '关注通知');
        console.log('\n关注消息数量:', followMessages.length);
        if (followMessages.length > 0) {
            console.log('关注消息详情:', followMessages);
        }
        
    } catch (error) {
        console.error('测试失败:', error.response?.data || error.message);
    }
}

// 运行测试
testMessageAPI(); 