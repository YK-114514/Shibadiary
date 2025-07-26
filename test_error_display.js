const axios = require('axios');

// 测试错误信息显示
async function testErrorDisplay() {
    try {
        console.log('测试错误信息显示...');

        // 测试1: 昵称重复
        console.log('\n1. 测试昵称重复...');
        const testData1 = {
            name: 'testAccount', // 已存在的昵称
            phone: '15733333333', // 新的手机号
            password: 'test123456'
        };

        try {
            const response1 = await axios.post('http://localhost:3000/api/user/register', testData1);
            console.log('❌ 应该失败但成功了:', response1.data);
        } catch (error) {
            console.log('✅ 昵称重复错误:', error.response?.data);
            console.log('应该显示: 该昵称已被占用');
        }

        // 测试2: 手机号重复
        console.log('\n2. 测试手机号重复...');
        const testData2 = {
            name: 'NewUser123', // 新的昵称
            phone: '19999999999', // 已存在的手机号
            password: 'test123456'
        };

        try {
            const response2 = await axios.post('http://localhost:3000/api/user/register', testData2);
            console.log('❌ 应该失败但成功了:', response2.data);
        } catch (error) {
            console.log('✅ 手机号重复错误:', error.response?.data);
            console.log('应该显示: 该手机号已被占用');
        }

        console.log('\n✅ 错误信息测试完成！');
        console.log('\n现在请测试前端注册页面：');
        console.log('1. 尝试注册昵称 "testAccount" -> 应该显示 "该昵称已被占用"');
        console.log('2. 尝试注册手机号 "19999999999" -> 应该显示 "该手机号已被占用"');

    } catch (error) {
        console.error('测试失败:', error);
    }
}

// 运行测试
testErrorDisplay(); 