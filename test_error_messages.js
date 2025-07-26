const mysql = require('mysql');

// 数据库配置
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: 'admin123',
    database: 'user_db'
};

// 创建连接
const connection = mysql.createConnection(dbConfig);

// 测试错误信息
async function testErrorMessages() {
    try {
        console.log('正在连接数据库...');
        await new Promise((resolve, reject) => {
            connection.connect((err) => {
                if (err) {
                    console.error('数据库连接失败:', err);
                    reject(err);
                } else {
                    console.log('数据库连接成功');
                    resolve();
                }
            });
        });

        // 检查现有用户
        console.log('\n1. 检查现有用户...');
        const existingUsers = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT id_user, name, phone FROM user ORDER BY id_user',
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        console.log('现有用户:', existingUsers);

        // 测试昵称重复检查
        console.log('\n2. 测试昵称重复检查...');
        const existingNickname = 'testAccount';
        const checkNickname = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM user WHERE name = ?',
                [existingNickname],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        console.log(`昵称 "${existingNickname}" 检查结果:`, checkNickname.length > 0 ? '已存在' : '可用');
        console.log('应该显示错误: 该昵称已被占用');

        // 测试手机号重复检查
        console.log('\n3. 测试手机号重复检查...');
        const existingPhone = '19999999999';
        const checkPhone = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM user WHERE phone = ?',
                [existingPhone],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        console.log(`手机号 "${existingPhone}" 检查结果:`, checkPhone.length > 0 ? '已存在' : '可用');
        console.log('应该显示错误: 该手机号已被占用');

        console.log('\n✅ 错误信息测试完成！');
        console.log('\n现在请测试注册功能：');
        console.log('1. 尝试注册昵称 "testAccount" -> 应该显示 "该昵称已被占用"');
        console.log('2. 尝试注册手机号 "19999999999" -> 应该显示 "该手机号已被占用"');

    } catch (error) {
        console.error('测试失败:', error);
    } finally {
        connection.end();
    }
}

// 运行测试
testErrorMessages(); 