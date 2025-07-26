const axios = require('axios');

async function testReplyMessage() {
    try {
        console.log('开始测试回复功能的消息插入...');
        
        // 模拟回复请求数据
        const replyData = {
            content: '这是一条测试回复',
            id_user: 2,  // 发送回复的用户ID
            id_from_post: 12,  // 帖子ID
            parent_id: 5,  // 被回复的评论ID
            parent_user_id: 3  // 被回复的用户ID
        };
        
        console.log('模拟回复数据:', replyData);
        
        // 检查数据完整性
        if (!replyData.parent_user_id) {
            console.error('❌ parent_user_id 为空，这会导致消息插入失败');
            return;
        }
        
        console.log('✅ parent_user_id 存在:', replyData.parent_user_id);
        
        // 模拟后端逻辑
        let targetId, messageKind;
        
        if (replyData.parent_id) {
            // 这是回复，目标是被回复的用户
            targetId = replyData.parent_user_id;
            messageKind = 'reply';
            console.log('回复消息 - 目标用户ID:', targetId);
        } else {
            // 这是评论，目标是帖子作者
            targetId = 1; // 假设帖子作者ID为1
            messageKind = 'comment';
            console.log('评论消息 - 目标用户ID:', targetId);
        }
        
        // 检查是否是自己给自己发消息
        if (parseInt(replyData.id_user) === parseInt(targetId)) {
            console.log('用户给自己发消息，不发送消息通知');
        } else {
            console.log('✅ 应该插入消息，类型:', messageKind, '目标用户:', targetId);
        }
        
        console.log('\n测试完成！');
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

testReplyMessage(); 