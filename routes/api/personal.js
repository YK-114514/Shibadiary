const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken');
const db = require('../../database/index')

//获取全部帖子信息和关注信息
router.get('/personal', passport.authenticate('jwt', {session: false}), (req, res) => {
    // 获取用户帖子
    db.query('select * from post_infom where id_user=?', [req.user.id_user], (err, results) => {
        if (err) throw err

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
                    followers: followersResults[0].followers_count
                }

                return res.json(response)
            })
        })
    })
})

module.exports = router