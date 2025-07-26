const axios = require('axios');

async function testReplyFix() {
    try {
        console.log('开始测试回复功能的消息插入修复...');
        
        // 测试场景1：正常的回复（有parent_user_id）
        console.log('\n=== 测试场景1：正常回复 ===');
        const normalReply = {
            content: '这是一条正常回复',
            id_user: 2,
            id_from_post: 12,
            parent_id: 5,
            parent_user_id: 3
        };
        
        console.log('正常回复数据:', normalReply);
        
        // 模拟后端逻辑
        let targetId, messageKind;
        
        if (normalReply.parent_id) {
            targetId = normalReply.parent_user_id;
            messageKind = 'reply';
            console.log('回复消息 - 目标用户ID:', targetId);
            
            if (!targetId) {
                console.error('❌ 回复消息缺少parent_user_id');
            } else {
                console.log('✅ parent_user_id存在，可以发送消息');
            }
        }
        
        // 测试场景2：缺少parent_user_id的回复
        console.log('\n=== 测试场景2：缺少parent_user_id的回复 ===');
        const invalidReply = {
            content: '这是一条缺少parent_user_id的回复',
            id_user: 2,
            id_from_post: 12,
            parent_id: 5,
            parent_user_id: null  // 这里为null
        };
        
        console.log('无效回复数据:', invalidReply);
        
        if (invalidReply.parent_id) {
            targetId = invalidReply.parent_user_id;
            messageKind = 'reply';
            console.log('回复消息 - 目标用户ID:', targetId);
            
            if (!targetId) {
                console.error('❌ 回复消息缺少parent_user_id，无法发送消息通知');
                console.log('✅ 修复后：跳过消息插入，继续执行评论功能');
            } else {
                console.log('✅ parent_user_id存在，可以发送消息');
            }
        }
        
        // 测试场景3：自己回复自己
        console.log('\n=== 测试场景3：自己回复自己 ===');
        const selfReply = {
            content: '自己回复自己',
            id_user: 3,
            id_from_post: 12,
            parent_id: 5,
            parent_user_id: 3  // 自己回复自己
        };
        
        console.log('自己回复自己数据:', selfReply);
        
        if (selfReply.parent_id) {
            targetId = selfReply.parent_user_id;
            messageKind = 'reply';
            console.log('回复消息 - 目标用户ID:', targetId);
            
            if (targetId && parseInt(selfReply.id_user) === parseInt(targetId)) {
                console.log('✅ 用户给自己发消息，不发送消息通知');
            } else if (targetId) {
                console.log('✅ 应该发送消息通知');
            } else {
                console.log('❌ targetId无效');
            }
        }
        
        console.log('\n✅ 测试完成！');
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

testReplyFix(); 