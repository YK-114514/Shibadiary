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

// 创建新的关注消息
async function createNewFollowMessage() {
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

        // 插入新的关注消息（用户4关注用户3）
        console.log('\n插入新的关注消息...');
        const result = await new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO message (from_id, target_id, kind, time) VALUES (?, ?, ?, NOW())',
                [4, 3, 'follow'],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        console.log('新关注消息插入成功，ID:', result.insertId);

        // 验证消息是否插入成功
        console.log('\n验证新关注消息...');
        const messages = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM message WHERE id = ?',
                [result.insertId],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        console.log('新关注消息详情:', messages);

        console.log('\n✅ 新的关注消息已创建！');
        console.log('请登录用户3的账号（testAccount）查看消息中心');

    } catch (error) {
        console.error('创建失败:', error);
    } finally {
        connection.end();
    }
}

// 运行创建
createNewFollowMessage(); 