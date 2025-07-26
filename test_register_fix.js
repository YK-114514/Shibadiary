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

// 测试修复后的注册逻辑
async function testRegisterFix() {
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

        // 测试数据
        const testCases = [
            {
                name: 'testAccount', // 已存在的昵称
                phone: '15733333333', // 新的手机号
                description: '测试昵称重复'
            },
            {
                name: 'NewUser123', // 新的昵称
                phone: '19999999999', // 已存在的手机号
                description: '测试手机号重复'
            },
            {
                name: 'NewUser' + Date.now(), // 新的昵称
                phone: '157' + Date.now().toString().slice(-8), // 新的手机号
                description: '测试正常注册'
            }
        ];

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            console.log(`\n${i + 1}. ${testCase.description}`);
            console.log('测试数据:', testCase);

            // 模拟后端注册逻辑
            try {
                // 先检查昵称
                const nameCheck = await new Promise((resolve, reject) => {
                    connection.query(
                        'SELECT * FROM user WHERE name = ?',
                        [testCase.name],
                        (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        }
                    );
                });

                if (nameCheck.length > 0) {
                    console.log('❌ 昵称已存在，应该返回: 该昵称已被占用');
                    continue;
                }

                // 再检查手机号
                const phoneCheck = await new Promise((resolve, reject) => {
                    connection.query(
                        'SELECT * FROM user WHERE phone = ?',
                        [testCase.phone],
                        (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        }
                    );
                });

                if (phoneCheck.length > 0) {
                    console.log('❌ 手机号已存在，应该返回: 该手机号已被占用');
                    continue;
                }

                console.log('✅ 昵称和手机号都可用，可以注册');

            } catch (error) {
                console.error('测试失败:', error);
            }
        }

        console.log('\n✅ 注册逻辑测试完成！');

    } catch (error) {
        console.error('测试失败:', error);
    } finally {
        connection.end();
    }
}

// 运行测试
testRegisterFix(); 