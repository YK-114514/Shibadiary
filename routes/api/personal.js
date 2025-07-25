const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken');
const db = require('../../database/index')

//获取全部帖子信息和关注信息
router.get('/personal', passport.authenticate('jwt', {session: false}), (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    
    console.log('分页参数:', { page, limit, offset });
    
    // 获取用户帖子总数
    db.query('SELECT COUNT(*) as total FROM post_infom WHERE id_user = ?', [req.user.id_user], (err, countResult) => {
        if (err) throw err
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        console.log('分页计算结果:', { total, totalPages, currentPage: page });
        
        // 获取用户帖子（分页）
        db.query('SELECT p.*, u.name, u.avatar FROM post_infom p LEFT JOIN user u ON p.id_user = u.id_user WHERE p.id_user = ? ORDER BY p.time DESC LIMIT ? OFFSET ?', 
            [req.user.id_user, limit, offset], (err, results) => {
            if (err) throw err

            console.log('查询到的帖子数量:', results.length);

            // 获取关注数
            db.query('SELECT COUNT(*) as following_count FROM follows WHERE follower_id = ?', [req.user.id_user], (err, followingResults) => {
                if (err) throw err

                // 获取粉丝数
                db.query('SELECT COUNT(*) as followers_count FROM follows WHERE following_id = ?', [req.user.id_user], (err, followersResults) => {
                    if (err) throw err

                    // 将关注数和粉丝数添加到结果中
                    const response = {
                        posts: results,
                        following: followingResults[0].following_count,
                        followers: followersResults[0].followers_count,
                        pagination: {
                            currentPage: page,
                            totalPages: totalPages,
                            totalPosts: total,
                            postsPerPage: limit,
                            hasNextPage: page < totalPages,
                            hasPrevPage: page > 1
                        }
                    }

                    console.log('返回的分页信息:', response.pagination);
                    return res.json(response)
                })
            })
        })
    })
})

module.exports = router