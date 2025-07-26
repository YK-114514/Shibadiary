const axios = require('axios');

// 直接测试注册API
async function testRegisterDirect() {
    try {
        console.log('开始测试注册API...');

        // 测试1: 使用已存在的昵称
        console.log('\n1. 测试使用已存在的昵称 "testAccount"...');
        const testData1 = {
            name: 'testAccount',
            phone: '15733333333',
            password: 'test123456'
        };

        try {
            const response1 = await axios.post('http://localhost:3000/api/user/register', testData1);
            console.log('❌ 应该失败但成功了:', response1.data);
        } catch (error) {
            console.log('✅ 正确返回错误:', error.response?.data);
            console.log('状态码:', error.response?.status);
        }

        // 测试2: 使用已存在的手机号
        console.log('\n2. 测试使用已存在的手机号 "19999999999"...');
        const testData2 = {
            name: 'NewUser123',
            phone: '19999999999',
            password: 'test123456'
        };

        try {
            const response2 = await axios.post('http://localhost:3000/api/user/register', testData2);
            console.log('❌ 应该失败但成功了:', response2.data);
        } catch (error) {
            console.log('✅ 正确返回错误:', error.response?.data);
            console.log('状态码:', error.response?.status);
        }

        // 测试3: 使用新的昵称和手机号
        console.log('\n3. 测试使用新的昵称和手机号...');
        const testData3 = {
            name: 'NewUser' + Date.now(),
            phone: '157' + Date.now().toString().slice(-8),
            password: 'test123456'
        };

        try {
            const response3 = await axios.post('http://localhost:3000/api/user/register', testData3);
            console.log('✅ 注册成功:', response3.data);
        } catch (error) {
            console.log('❌ 应该成功但失败了:', error.response?.data);
        }

    } catch (error) {
        console.error('测试失败:', error);
    }
}

// 运行测试
testRegisterDirect(); 