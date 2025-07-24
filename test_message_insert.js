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

// 测试message表插入
async function testMessageInsert() {
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

        // 测试插入消息
        console.log('\n测试插入点赞消息...');
        try {
            const insertResult = await new Promise((resolve, reject) => {
                connection.query(
                    'INSERT INTO message (target_id, kind, from_id, from_post_id, specific) VALUES (?, ?, ?, ?, ?)',
                    [3, 'like', 2, 12, ''],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });
            console.log('插入成功:', insertResult);

            // 查询刚插入的数据
            const queryResult = await new Promise((resolve, reject) => {
                connection.query('SELECT * FROM message WHERE id = ?', [insertResult.insertId], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('查询结果:', queryResult);

            // 删除测试数据
            await new Promise((resolve, reject) => {
                connection.query('DELETE FROM message WHERE id = ?', [insertResult.insertId], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('测试数据删除成功');

        } catch (error) {
            console.error('插入失败:', error.message);
            console.error('错误详情:', error);
        }

        console.log('\nmessage表插入测试完成！');
    } catch (error) {
        console.error('测试失败:', error);
    } finally {
        connection.end();
    }
}

// 运行测试
testMessageInsert(); 