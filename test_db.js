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

// 测试数据库连接和表结构
async function testDatabase() {
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

        // 检查likes表
        console.log('\n检查likes表...');
        const likesResult = await new Promise((resolve, reject) => {
            connection.query('SHOW TABLES LIKE "likes"', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('likes表存在:', likesResult.length > 0);

        if (likesResult.length === 0) {
            console.log('创建likes表...');
            await new Promise((resolve, reject) => {
                connection.query(`
                    CREATE TABLE likes (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        userid_like INT NOT NULL,
                        id_from_post INT NOT NULL,
                        UNIQUE KEY unique_like (userid_like, id_from_post)
                    )
                `, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('likes表创建成功');
        }

        // 检查message表
        console.log('\n检查message表...');
        const messageResult = await new Promise((resolve, reject) => {
            connection.query('SHOW TABLES LIKE "message"', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('message表存在:', messageResult.length > 0);

        if (messageResult.length === 0) {
            console.log('创建message表...');
            await new Promise((resolve, reject) => {
                connection.query(`
                    CREATE TABLE message (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        target_id INT NOT NULL,
                        from_id INT NOT NULL,
                        content TEXT NOT NULL,
                        kind VARCHAR(50) DEFAULT 'message',
                        from_post_id INT,
                        specific VARCHAR(255) DEFAULT '',
                        time DATETIME DEFAULT CURRENT_TIMESTAMP,
                        isread TINYINT(1) DEFAULT 0
                    )
                `, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('message表创建成功');
        }

        // 检查post_infom表
        console.log('\n检查post_infom表...');
        const postResult = await new Promise((resolve, reject) => {
            connection.query('SHOW TABLES LIKE "post_infom"', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('post_infom表存在:', postResult.length > 0);

        // 测试插入点赞记录
        console.log('\n测试插入点赞记录...');
        try {
            const testResult = await new Promise((resolve, reject) => {
                connection.query('INSERT INTO likes (userid_like, id_from_post) VALUES (?, ?)', [1, 1], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('测试插入成功:', testResult);

            // 删除测试记录
            await new Promise((resolve, reject) => {
                connection.query('DELETE FROM likes WHERE userid_like = ? AND id_from_post = ?', [1, 1], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('测试记录删除成功');
        } catch (error) {
            console.error('测试插入失败:', error.message);
        }

        console.log('\n数据库测试完成！');
    } catch (error) {
        console.error('测试失败:', error);
    } finally {
        connection.end();
    }
}

// 运行测试
testDatabase(); 