const mysql = require('mysql');
const bcrypt = require('bcrypt');

// 数据库配置
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: 'admin123',
    database: 'user_db'
};

// 创建连接
const connection = mysql.createConnection(dbConfig);

// 检查用户密码
async function checkPassword() {
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

        // 获取用户数据
        const users = await new Promise((resolve, reject) => {
            connection.query('SELECT * FROM user LIMIT 3', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        console.log('\n检查用户密码...');
        for (let user of users) {
            console.log(`用户: ${user.name}, 手机: ${user.phone}`);
            
            // 测试常见密码
            const testPasswords = ['12345678', 'password', '123456', 'admin', 'test'];
            for (let testPwd of testPasswords) {
                const isMatch = await bcrypt.compare(testPwd, user.password);
                if (isMatch) {
                    console.log(`  密码匹配: ${testPwd}`);
                    break;
                }
            }
        }

        console.log('\n密码检查完成！');
    } catch (error) {
        console.error('检查失败:', error);
    } finally {
        connection.end();
    }
}

// 运行检查
checkPassword(); 