const express = require('express');
const router = express.Router();
const passport = require('passport');
const db = require('../../database/index');

// 封装数据库查询为 Promise
const query = (sql, values) => {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// 获取用户的消息列表
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const userId = req.user.id_user;
        console.log('获取用户消息列表，用户ID:', userId);

        // 查询该用户收到的所有消息，排除自己给自己的互动消息
        const messages = await query(`
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
        `, [userId]);

        console.log('查询到的消息数量:', messages.length);

        // 处理消息内容
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

        res.json({
            success: true,
            messages: processedMessages,
            unreadCount: processedMessages.filter(msg => !msg.isread).length
        });

    } catch (error) {
        console.error('获取消息列表失败:', error);
        res.status(500).json({ success: false, message: '获取消息失败' });
    }
});

// 标记消息为已读
router.put('/:messageId/read', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const messageId = req.params.messageId;
        const userId = req.user.id_user;

        console.log('标记消息已读，消息ID:', messageId, '用户ID:', userId);

        // 验证消息是否属于当前用户
        const message = await query('SELECT * FROM message WHERE id = ? AND target_id = ?', [messageId, userId]);
        
        if (message.length === 0) {
            return res.status(404).json({ success: false, message: '消息不存在或无权限' });
        }

        // 标记为已读
        await query('UPDATE message SET isread = 1 WHERE id = ?', [messageId]);

        res.json({ success: true, message: '标记已读成功' });

    } catch (error) {
        console.error('标记消息已读失败:', error);
        res.status(500).json({ success: false, message: '标记已读失败' });
    }
});

// 标记所有消息为已读
router.put('/read-all', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const userId = req.user.id_user;

        console.log('标记所有消息已读，用户ID:', userId);

        // 标记该用户的所有未读消息为已读，排除自己给自己的消息
        await query('UPDATE message SET isread = 1 WHERE target_id = ? AND isread = 0 AND from_id != target_id', [userId]);

        res.json({ success: true, message: '全部标记已读成功' });

    } catch (error) {
        console.error('标记所有消息已读失败:', error);
        res.status(500).json({ success: false, message: '标记已读失败' });
    }
});

// 删除消息
router.delete('/:messageId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const messageId = req.params.messageId;
        const userId = req.user.id_user;

        console.log('删除消息，消息ID:', messageId, '用户ID:', userId);

        // 验证消息是否属于当前用户
        const message = await query('SELECT * FROM message WHERE id = ? AND target_id = ?', [messageId, userId]);
        
        if (message.length === 0) {
            return res.status(404).json({ success: false, message: '消息不存在或无权限' });
        }

        // 删除消息
        await query('DELETE FROM message WHERE id = ?', [messageId]);

        res.json({ success: true, message: '删除成功' });

    } catch (error) {
        console.error('删除消息失败:', error);
        res.status(500).json({ success: false, message: '删除失败' });
    }
});

module.exports = router;
