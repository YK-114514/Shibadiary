const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken');
const db = require('../../database/index')

// 获取用户帖子和关注信息
router.get('/:userId/accounts', (req, res) => {
    // 获取用户帖子
    db.query('select * from post_infom where id_user=?', [req.params.userId], (err, results) => {
        if (err) throw err

        // 查询user表的following和fans字段
        db.query('SELECT following, fans FROM user WHERE id_user = ?', [req.params.userId], (err, userResults) => {
            if (err) throw err

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

            return res.json(response)
        })
    })
})

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
                            res.json({ success: true });
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