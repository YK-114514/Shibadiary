const mysql = require('mysql');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin123',
    database: 'user_db'
});

connection.connect((err) => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    
    console.log('数据库连接成功');
    
    const userId = 3;
    
    // 查询消息
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
    `, [userId], (err, result) => {
        if (err) {
            console.error('查询失败:', err);
            return;
        }
        
        console.log('查询到的消息数量:', result.length);
        
        // 调试每条消息的处理
        result.forEach((msg, index) => {
            console.log(`\n=== 消息 ${index + 1} ===`);
            console.log('消息ID:', msg.id);
            console.log('kind字段值:', `"${msg.kind}"`);
            console.log('kind字段类型:', typeof msg.kind);
            console.log('kind字段长度:', msg.kind.length);
            console.log('kind字段字符码:', Array.from(msg.kind).map(c => c.charCodeAt(0)));
            
            // 模拟后端处理逻辑
            let content = '';
            let type = '';
            
            console.log('开始switch匹配...');
            switch (msg.kind) {
                case 'like':
                    console.log('匹配到: like');
                    content = `${msg.from_user_name || '用户'}点赞了你的帖子`;
                    type = '点赞通知';
                    break;
                case 'collect':
                    console.log('匹配到: collect');
                    content = `${msg.from_user_name || '用户'}收藏了你的帖子`;
                    type = '收藏通知';
                    break;
                case 'comment':
                    console.log('匹配到: comment');
                    content = `${msg.from_user_name || '用户'}评论了你的帖子`;
                    type = '评论通知';
                    break;
                case 'reply':
                    console.log('匹配到: reply');
                    content = `${msg.from_user_name || '用户'}回复了你的评论`;
                    type = '回复通知';
                    break;
                case 'follow':
                    console.log('匹配到: follow');
                    content = `${msg.from_user_name || '用户'}关注了你`;
                    type = '关注通知';
                    break;
                default:
                    console.log('匹配到: default');
                    content = msg.content || '新消息';
                    type = '系统通知';
            }
            
            console.log('处理结果 - type:', type);
            console.log('处理结果 - content:', content);
        });
        
        connection.end();
    });
}); 