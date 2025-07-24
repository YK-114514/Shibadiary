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

// 检查message表结构
async function checkMessageTable() {
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

        // 检查message表结构
        console.log('\n检查message表结构...');
        const structure = await new Promise((resolve, reject) => {
            connection.query('DESCRIBE message', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('message表结构:', structure);

        // 尝试插入测试数据
        console.log('\n测试插入消息...');
        try {
            const testResult = await new Promise((resolve, reject) => {
                connection.query(
                    'INSERT INTO message (target_id, kind, from_id, from_post_id, specific, isread, time) VALUES (?, ?, ?, ?, ?, 0, NOW())',
                    [1, 'like', 2, 12, ''],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });
            console.log('测试插入成功:', testResult);

            // 删除测试数据
            await new Promise((resolve, reject) => {
                connection.query('DELETE FROM message WHERE kind = "like" AND from_id = 2 AND from_post_id = 12', (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('测试数据删除成功');
        } catch (error) {
            console.error('测试插入失败:', error.message);
        }

        console.log('\nmessage表检查完成！');
    } catch (error) {
        console.error('检查失败:', error);
    } finally {
        connection.end();
    }
}

// 运行检查
checkMessageTable(); 