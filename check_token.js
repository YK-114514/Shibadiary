const fs = require('fs');
const path = require('path');

console.log('检查本地存储的token...');

// 检查是否有本地存储的token文件
const tokenFile = path.join(__dirname, 'test_token.txt');

if (fs.existsSync(tokenFile)) {
    const token = fs.readFileSync(tokenFile, 'utf8');
    console.log('找到测试token:', token.substring(0, 20) + '...');
    
    // 测试token是否有效
    const axios = require('axios');
    const FormData = require('form-data');
    
    async function testWithToken() {
        try {
            const formData = new FormData();
            formData.append('content', '测试内容');
            formData.append('type', '帖子');
            
            const response = await axios.post('http://localhost:3000/api/posts/add', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Content-Type': 'multipart/form-data',
                    'Authorization': token
                }
            });
            
            console.log('✅ 使用token成功');
            console.log('响应:', response.data);
            
        } catch (error) {
            console.error('❌ 使用token失败:', error.message);
            if (error.response) {
                console.error('响应状态:', error.response.status);
                console.error('响应数据:', error.response.data);
            }
        }
    }
    
    testWithToken();
    
} else {
    console.log('没有找到测试token文件');
    console.log('请先登录获取token，然后保存到 test_token.txt 文件中');
} 