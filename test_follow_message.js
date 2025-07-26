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

// 测试关注消息功能
async function testFollowMessage() {
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

        // 测试插入关注消息
        console.log('\n测试插入关注消息...');
        const testResult = await new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO message (from_id, target_id, kind, time) VALUES (?, ?, ?, NOW())',
                [2, 3, 'follow'],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        console.log('关注消息插入成功:', testResult);

        // 查询刚插入的消息
        console.log('\n查询关注消息...');
        const messages = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM message WHERE kind = "follow" ORDER BY id DESC LIMIT 1',
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        console.log('查询到的关注消息:', messages);

        // 清理测试数据
        console.log('\n清理测试数据...');
        await new Promise((resolve, reject) => {
            connection.query('DELETE FROM message WHERE kind = "follow" AND from_id = 2 AND target_id = 3', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('测试数据清理完成');

        console.log('\n关注消息功能测试完成！');
    } catch (error) {
        console.error('测试失败:', error);
    } finally {
        connection.end();
    }
}

// 运行测试
testFollowMessage(); 