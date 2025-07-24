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

// 调试表结构
async function debugTable() {
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

        // 检查message表是否存在
        console.log('\n检查message表是否存在...');
        const tables = await new Promise((resolve, reject) => {
            connection.query('SHOW TABLES LIKE "message"', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('message表检查结果:', tables);

        if (tables.length > 0) {
            // 检查message表结构
            console.log('\n检查message表结构...');
            const structure = await new Promise((resolve, reject) => {
                connection.query('DESCRIBE message', (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('message表结构:', structure);

            // 尝试不同的插入语句
            console.log('\n尝试不同的插入语句...');
            
            // 方法1：只插入必要字段
            try {
                const result1 = await new Promise((resolve, reject) => {
                    connection.query(
                        'INSERT INTO message (target_id, kind, from_id, from_post_id) VALUES (?, ?, ?, ?)',
                        [3, 'like', 2, 12],
                        (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        }
                    );
                });
                console.log('方法1成功:', result1);
                
                // 删除测试数据
                await new Promise((resolve, reject) => {
                    connection.query('DELETE FROM message WHERE id = ?', [result1.insertId], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                console.log('测试数据删除成功');
            } catch (error) {
                console.error('方法1失败:', error.message);
            }

            // 方法2：使用所有字段
            try {
                const result2 = await new Promise((resolve, reject) => {
                    connection.query(
                        'INSERT INTO message (target_id, kind, from_id, from_post_id, specific, isread, time) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                        [3, 'like', 2, 12, '', 0],
                        (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        }
                    );
                });
                console.log('方法2成功:', result2);
                
                // 删除测试数据
                await new Promise((resolve, reject) => {
                    connection.query('DELETE FROM message WHERE id = ?', [result2.insertId], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                console.log('测试数据删除成功');
            } catch (error) {
                console.error('方法2失败:', error.message);
            }
        } else {
            console.log('message表不存在，需要创建');
        }

        console.log('\n调试完成！');
    } catch (error) {
        console.error('调试失败:', error);
    } finally {
        connection.end();
    }
}

// 运行调试
debugTable(); 