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

// 模拟实际的关注操作
async function testActualFollow() {
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

        const follower_id = 2; // 关注者ID
        const following_id = 3; // 被关注者ID

        console.log(`\n模拟用户${follower_id}关注用户${following_id}...`);

        // 1. 检查是否已经关注
        console.log('\n1. 检查关注状态...');
        const followCheck = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?',
                [follower_id, following_id],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        console.log('当前关注状态:', followCheck.length > 0 ? '已关注' : '未关注');

        // 2. 如果未关注，执行关注操作
        if (followCheck.length === 0) {
            console.log('\n2. 执行关注操作...');
            
            // 插入关注关系
            const followResult = await new Promise((resolve, reject) => {
                connection.query(
                    'INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)',
                    [follower_id, following_id],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });
            console.log('关注关系插入结果:', followResult);

            if (followResult.affectedRows > 0) {
                console.log('\n3. 更新用户关注数据...');
                
                // 更新关注者的following字段
                await new Promise((resolve, reject) => {
                    connection.query(
                        "UPDATE user SET following = IFNULL(CONCAT(IFNULL(NULLIF(following, ''), ''), IF(following IS NULL OR following = '', '', ','), ?), ?) WHERE id_user = ?",
                        [following_id, following_id, follower_id],
                        (err) => {
                            if (err) reject(err);
                            else resolve();
                        }
                    );
                });
                console.log('关注者following字段更新完成');

                // 更新被关注者的fans字段
                await new Promise((resolve, reject) => {
                    connection.query(
                        "UPDATE user SET fans = IFNULL(CONCAT(IFNULL(NULLIF(fans, ''), ''), IF(fans IS NULL OR fans = '', '', ','), ?), ?) WHERE id_user = ?",
                        [follower_id, follower_id, following_id],
                        (err) => {
                            if (err) reject(err);
                            else resolve();
                        }
                    );
                });
                console.log('被关注者fans字段更新完成');

                // 4. 发送关注消息
                console.log('\n4. 发送关注消息...');
                const messageResult = await new Promise((resolve, reject) => {
                    connection.query(
                        'INSERT INTO message (from_id, target_id, kind, time) VALUES (?, ?, ?, NOW())',
                        [follower_id, following_id, 'follow'],
                        (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        }
                    );
                });
                console.log('关注消息发送结果:', messageResult);

                // 5. 验证消息是否发送成功
                console.log('\n5. 验证关注消息...');
                const messages = await new Promise((resolve, reject) => {
                    connection.query(
                        'SELECT * FROM message WHERE kind = "follow" AND from_id = ? AND target_id = ? ORDER BY id DESC LIMIT 1',
                        [follower_id, following_id],
                        (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        }
                    );
                });
                console.log('最新关注消息:', messages);

                console.log('\n✅ 关注操作完成！');
            } else {
                console.log('\n❌ 关注操作失败或已关注');
            }
        } else {
            console.log('\n⚠️ 已经关注过了');
        }

    } catch (error) {
        console.error('测试失败:', error);
    } finally {
        connection.end();
    }
}

// 运行测试
testActualFollow(); 