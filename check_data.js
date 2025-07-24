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

// 检查数据库中的数据
async function checkData() {
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

        // 检查用户数据
        console.log('\n检查用户数据...');
        const users = await new Promise((resolve, reject) => {
            connection.query('SELECT * FROM user LIMIT 5', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('用户数据:', users);

        // 检查帖子数据
        console.log('\n检查帖子数据...');
        const posts = await new Promise((resolve, reject) => {
            connection.query('SELECT * FROM post_infom LIMIT 5', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('帖子数据:', posts);

        // 检查点赞数据
        console.log('\n检查点赞数据...');
        const likes = await new Promise((resolve, reject) => {
            connection.query('SELECT * FROM likes LIMIT 10', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('点赞数据:', likes);

        // 检查消息数据
        console.log('\n检查消息数据...');
        const messages = await new Promise((resolve, reject) => {
            connection.query('SELECT * FROM message LIMIT 10', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('消息数据:', messages);

        console.log('\n数据检查完成！');
    } catch (error) {
        console.error('检查失败:', error);
    } finally {
        connection.end();
    }
}

// 运行检查
checkData(); 