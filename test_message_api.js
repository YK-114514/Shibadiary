const axios = require('axios');
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
    
    const userId = 3; // 被关注的用户ID
    
    // 模拟后端消息查询逻辑
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
        } else {
            console.log('查询到的原始消息数量:', result.length);
            console.log('原始消息:', result);
            
            // 处理消息内容（模拟后端逻辑）
            const processedMessages = result.map(msg => {
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
            
            console.log('\n处理后的消息:');
            processedMessages.forEach(msg => {
                console.log(`- ${msg.type}: ${msg.content} (ID: ${msg.id})`);
            });
        }
        
        connection.end();
    });
});


// 测试消息中心API
async function testMessageAPI() {
    try {
        console.log('开始测试消息中心API...');
        
        // 首先登录获取token
        const loginResponse = await axios.post('http://localhost:3000/api/user/login', {
            phone: '19999999999', // 使用testAccount用户
            password: '12345678' // 正确的密码
        });
        
        console.log('登录成功:', loginResponse.data);
        const token = loginResponse.data.token;
        
        // 测试获取消息列表
        console.log('\n测试获取消息列表...');
        const messagesResponse = await axios.get('http://localhost:3000/api/message', {
            headers: {
                'Authorization': token
            }
        });
        
        console.log('消息列表响应:', messagesResponse.data);
        
        // 如果有消息，测试标记已读
        if (messagesResponse.data.messages && messagesResponse.data.messages.length > 0) {
            const firstMessage = messagesResponse.data.messages[0];
            console.log('\n测试标记消息已读...');
            
            const readResponse = await axios.put(`http://localhost:3000/api/message/${firstMessage.id}/read`, {}, {
                headers: {
                    'Authorization': token
                }
            });
            
            console.log('标记已读响应:', readResponse.data);
        }
        
        // 测试标记所有消息为已读
        console.log('\n测试标记所有消息为已读...');
        const readAllResponse = await axios.put('http://localhost:3000/api/message/read-all', {}, {
            headers: {
                'Authorization': token
            }
        });
        
        console.log('标记全部已读响应:', readAllResponse.data);
        
    } catch (error) {
        console.error('测试失败:', error.response?.data || error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应头:', error.response.headers);
        }
    }
}

// 运行测试
testMessageAPI(); 