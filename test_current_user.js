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

// 检查当前用户信息
async function checkCurrentUser() {
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

        // 检查所有用户
        console.log('\n1. 检查所有用户...');
        const users = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT id_user, name, phone FROM user ORDER BY id_user',
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        console.log('所有用户:', users);

        // 检查用户3的消息
        console.log('\n2. 检查用户3的消息...');
        const user3Messages = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT id, kind, from_id, target_id, isread, time FROM message WHERE target_id = 3 ORDER BY id DESC',
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        console.log('用户3的消息:', user3Messages);

        // 检查用户2的消息
        console.log('\n3. 检查用户2的消息...');
        const user2Messages = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT id, kind, from_id, target_id, isread, time FROM message WHERE target_id = 2 ORDER BY id DESC',
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        console.log('用户2的消息:', user2Messages);

        console.log('\n请确认你登录的是用户3的账号（testAccount）来查看关注消息');

    } catch (error) {
        console.error('检查失败:', error);
    } finally {
        connection.end();
    }
}

// 运行检查
checkCurrentUser(); 