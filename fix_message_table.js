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

// 修复message表
async function fixMessageTable() {
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

        // 删除现有的message表
        console.log('\n删除现有的message表...');
        try {
            await new Promise((resolve, reject) => {
                connection.query('DROP TABLE IF EXISTS message', (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('message表删除成功');
        } catch (error) {
            console.log('删除message表失败:', error.message);
        }

        // 重新创建message表
        console.log('\n重新创建message表...');
        try {
            await new Promise((resolve, reject) => {
                connection.query(`
                    CREATE TABLE message (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        target_id INT NOT NULL,
                        kind VARCHAR(45) NOT NULL,
                        from_id INT,
                        from_post_id INT,
                        isread TINYINT DEFAULT 0,
                        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('message表创建成功');
        } catch (error) {
            console.error('创建message表失败:', error.message);
        }

        // 测试插入
        console.log('\n测试插入数据...');
        try {
            const result = await new Promise((resolve, reject) => {
                connection.query(
                    'INSERT INTO message (target_id, kind, from_id, from_post_id) VALUES (?, ?, ?, ?)',
                    [3, 'like', 2, 12],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });
            console.log('插入成功:', result);

            // 查询结果
            const queryResult = await new Promise((resolve, reject) => {
                connection.query('SELECT * FROM message WHERE id = ?', [result.insertId], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('查询结果:', queryResult);

            // 清理测试数据
            await new Promise((resolve, reject) => {
                connection.query('DELETE FROM message WHERE id = ?', [result.insertId], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('测试数据清理完成');

        } catch (error) {
            console.error('测试插入失败:', error.message);
        }

        console.log('\nmessage表修复完成！');
    } catch (error) {
        console.error('修复失败:', error);
    } finally {
        connection.end();
    }
}

// 运行修复
fixMessageTable(); 