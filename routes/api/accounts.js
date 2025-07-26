const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken');
const db = require('../../database/index')

// 获取用户帖子和关注信息
router.get('/:userId/accounts', (req, res) => {
    const targetUserId = req.params.userId;
    console.log('请求用户数据，用户ID:', targetUserId);
    console.log('请求参数:', req.params);
    console.log('请求头:', req.headers);
    
    // 获取用户帖子
    db.query('select p.*, u.name, u.avatar from post_infom p LEFT JOIN user u ON p.id_user = u.id_user where p.id_user=?', [targetUserId], (err, results) => {
        if (err) {
            console.error('查询用户帖子失败:', err);
            return res.status(500).json({ error: '数据库查询失败' });
        }

        console.log('查询到的帖子数量:', results.length);
        console.log('查询到的帖子:', results);

        // 查询user表的following和fans字段
        db.query('SELECT following, fans FROM user WHERE id_user = ?', [targetUserId], (err, userResults) => {
            if (err) {
                console.error('查询用户信息失败:', err);
                return res.status(500).json({ error: '数据库查询失败' });
            }

            console.log('查询到的用户信息:', userResults);

            let followingCount = 0;
            let followersCount = 0;

            if (userResults.length > 0) {
                const following = userResults[0].following;
                const fans = userResults[0].fans;

                // 统计数量（排除空字符串和null）
                followingCount = following ? following.split(',').filter(id => id.trim() !== '').length : 0;
                followersCount = fans ? fans.split(',').filter(id => id.trim() !== '').length : 0;
            }

            // 返回数据
            const response = {
                posts: results,
                following: followingCount,
                followers: followersCount
            }

            console.log('返回的数据:', response);
            return res.json(response)
        })
    })
})

// 检查关注状态
router.get('/check-follow', (req, res) => {
    const { follower_id, following_id } = req.query;
    if (!follower_id || !following_id) {
        return res.json({ success: false, message: '参数缺失' });
    }
    
    // 查询follows表检查是否存在关注关系
    db.query('SELECT * FROM follows WHERE follower_id = ? AND following_id = ?', 
        [follower_id, following_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: '数据库错误' });
        }
        
        const isFollowing = results.length > 0;
        return res.json({ 
            success: true, 
            isFollowing: isFollowing 
        });
    });
});

// 获取用户的关注列表详情
router.get('/following/:userId', (req, res) => {
    const userId = req.params.userId;
    
    if (!userId) {
        return res.json({ success: false, message: '用户ID缺失' });
    }
    
    // 首先获取用户的关注ID列表
    db.query('SELECT following FROM user WHERE id_user = ?', [userId], (err, userResults) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: '数据库错误' });
        }
        
        if (userResults.length === 0) {
            return res.json({ success: true, data: [] });
        }
        
        const followingStr = userResults[0].following || '';
        const followingIds = followingStr ? followingStr.split(',').filter(id => id.trim() !== '') : [];
        
        if (followingIds.length === 0) {
            return res.json({ success: true, data: [] });
        }
        
        // 获取关注用户的详细信息
        const placeholders = followingIds.map(() => '?').join(',');
        const sql = `SELECT id_user, name, avatar FROM user WHERE id_user IN (${placeholders})`;
        
        db.query(sql, followingIds, (err, results) => {
            if (err) {
                console.error(err);
                return res.json({ success: false, message: '获取关注用户信息失败' });
            }
            
            return res.json({ success: true, data: results });
        });
    });
});

// 关注接口
router.post('/follow', (req, res) => {
    const { follower_id, following_id } = req.body;
    if (!follower_id || !following_id) {
        return res.json({ success: false, message: '参数缺失' });
    }
    if (follower_id == following_id) {
        return res.json({ success: false, message: '不能关注自己' });
    }
    // 插入关注关系
    const sql = 'INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)';
    db.query(sql, [follower_id, following_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: '数据库错误' });
        }
        if (result.affectedRows > 0) {
            // 更新当前用户的following字段
            db.query(
                "UPDATE user SET following = IFNULL(CONCAT(IFNULL(NULLIF(following, ''), ''), IF(following IS NULL OR following = '', '', ','), ?), ?) WHERE id_user = ?",
                [following_id, following_id, follower_id],
                (err1) => {
                    if (err1) {
                        console.error(err1);
                        return res.json({ success: false, message: '更新following失败' });
                    }
                    // 更新被关注者的fans字段
                    db.query(
                        "UPDATE user SET fans = IFNULL(CONCAT(IFNULL(NULLIF(fans, ''), ''), IF(fans IS NULL OR fans = '', '', ','), ?), ?) WHERE id_user = ?",
                        [follower_id, follower_id, following_id],
                        (err2) => {
                            if (err2) {
                                console.error(err2);
                                return res.json({ success: false, message: '更新fans失败' });
                            }
                            // 发送关注消息
                            const messageSql = 'INSERT INTO message (from_id, target_id, kind, time) VALUES (?, ?, ?, NOW())';
                            db.query(messageSql, [follower_id, following_id, 'follow'], (err3) => {
                                if (err3) {
                                    console.error('发送关注消息失败:', err3);
                                }
                                res.json({ success: true });
                            });
                        }
                    );
                }
            );
        } else {
            res.json({ success: false, message: '已关注过' });
        }
    });
});

// 取消关注接口
router.post('/unfollow', (req, res) => {
    const { follower_id, following_id } = req.body;
    if (!follower_id || !following_id) {
        return res.json({ success: false, message: '参数缺失' });
    }
    // 删除关注关系
    db.query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [follower_id, following_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: '数据库错误' });
        }
        // 更新当前用户的following字段
        db.query(
            "UPDATE user SET following = TRIM(BOTH ',' FROM REPLACE(CONCAT(',', IFNULL(following, ''), ','), CONCAT(',', ?, ','), ',')) WHERE id_user = ?",
            [following_id, follower_id],
            (err1) => {
                if (err1) {
                    console.error(err1);
                    return res.json({ success: false, message: '更新following失败' });
                }
                // 更新被关注者的fans字段
                db.query(
                    "UPDATE user SET fans = TRIM(BOTH ',' FROM REPLACE(CONCAT(',', IFNULL(fans, ''), ','), CONCAT(',', ?, ','), ',')) WHERE id_user = ?",
                    [follower_id, following_id],
                    (err2) => {
                        if (err2) {
                            console.error(err2);
                            return res.json({ success: false, message: '更新fans失败' });
                        }
                        res.json({ success: true });
                    }
                );
            }
        );
    });
});

module.exports = router