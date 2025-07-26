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

// 检查关注消息
async function checkFollowMessages() {
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

        // 检查所有关注消息
        console.log('\n1. 检查所有关注消息...');
        const followMessages = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM message WHERE kind = "follow" ORDER BY id DESC',
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        console.log('关注消息数量:', followMessages.length);
        console.log('关注消息详情:', followMessages);

        // 检查用户3收到的所有消息
        console.log('\n2. 检查用户3收到的所有消息...');
        const user3Messages = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM message WHERE target_id = 3 ORDER BY id DESC',
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        console.log('用户3收到的消息数量:', user3Messages.length);
        console.log('用户3收到的消息详情:', user3Messages);

        // 检查关注关系
        console.log('\n3. 检查关注关系...');
        const follows = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM follows WHERE follower_id = 2 AND following_id = 3',
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        console.log('关注关系:', follows);

        // 检查用户数据
        console.log('\n4. 检查用户数据...');
        const users = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT id_user, name, following, fans FROM user WHERE id_user IN (2, 3)',
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        console.log('用户数据:', users);

    } catch (error) {
        console.error('检查失败:', error);
    } finally {
        connection.end();
    }
}

// 运行检查
checkFollowMessages(); 