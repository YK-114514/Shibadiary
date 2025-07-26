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

// 测试关注消息显示
async function testFollowMessageDisplay() {
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

        // 插入测试关注消息
        console.log('\n插入测试关注消息...');
        await new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO message (from_id, target_id, kind, time) VALUES (?, ?, ?, NOW())',
                [2, 3, 'follow'],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        console.log('关注消息插入成功');

        // 模拟后端消息查询逻辑
        console.log('\n模拟后端消息查询...');
        const messages = await new Promise((resolve, reject) => {
            connection.query(`
                SELECT 
                    m.*,
                    u.name as from_user_name,
                    u.avatar as from_user_avatar,
                    p.content as post_content,
                    p.images as post_images
                FROM message m
                LEFT JOIN user u ON m.from_id = u.id_user
                LEFT JOIN post_infom p ON m.from_post_id = p.id AND m.from_post_id IS NOT NULL
                WHERE m.target_id = ? AND m.from_id != m.target_id
                ORDER BY m.time DESC
            `, [3], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('查询到的原始消息:', messages);

        // 处理消息内容（模拟后端逻辑）
        const processedMessages = messages.map(msg => {
            let content = '';
            let type = '';

            switch (msg.kind) {
                case 'like':
                    content = `${msg.from_user_name || '用户'}点赞了你的帖子`;
                    type = '点赞通知';
                    break;
                case 'collect':
                    content = `${msg.from_user_name || '用户'}收藏了你的帖子`;
                    type = '收藏通知';
                    break;
                case 'comment':
                    content = `${msg.from_user_name || '用户'}评论了你的帖子`;
                    type = '评论通知';
                    break;
                case 'reply':
                    content = `${msg.from_user_name || '用户'}回复了你的评论`;
                    type = '回复通知';
                    break;
                case 'follow':
                    content = `${msg.from_user_name || '用户'}关注了你`;
                    type = '关注通知';
                    break;
                default:
                    content = msg.content || '新消息';
                    type = '系统通知';
            }

            return {
                id: msg.id,
                type: type,
                content: content,
                from_user_name: msg.from_user_name,
                from_user_avatar: msg.from_user_avatar,
                post_content: msg.post_content,
                post_images: msg.post_images ? JSON.parse(msg.post_images) : [],
                isread: msg.isread,
                time: msg.time,
                from_post_id: msg.from_post_id
            };
        });

        console.log('\n处理后的消息:', processedMessages);

        // 清理测试数据
        console.log('\n清理测试数据...');
        await new Promise((resolve, reject) => {
            connection.query('DELETE FROM message WHERE kind = "follow" AND from_id = 2 AND target_id = 3', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('测试数据清理完成');

        console.log('\n关注消息显示测试完成！');
    } catch (error) {
        console.error('测试失败:', error);
    } finally {
        connection.end();
    }
}

// 运行测试
testFollowMessageDisplay(); 