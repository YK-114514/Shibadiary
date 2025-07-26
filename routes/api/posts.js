const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken');
const db = require('../../database/index')
const multer = require('multer');
const upload = multer({ 
    dest: 'uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024 // 限制文件大小为10MB
    }
}); // 保存到本地 uploads 目录

console.log('✅ posts路由模块加载');

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

function toMysqlDatetime(date) {
    // date 可以是 Date 对象或 ISO 字符串
    const d = new Date(date);
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0') + ':' +
        String(d.getSeconds()).padStart(2, '0');
}



//获取好友（关注的人）的帖子
router.get('/friends', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const userId = req.user.id_user;
        console.log('获取好友帖子，用户ID:', userId);
        
        // 获取当前用户的关注列表
        const userResult = await query('SELECT following FROM user WHERE id_user = ?', [userId]);
        
        if (userResult.length === 0) {
            return res.json({ success: true, data: [] });
        }
        
        const followingStr = userResult[0].following || '';
        const followingArr = followingStr ? followingStr.split(',').filter(id => id.trim() !== '') : [];
        
        console.log('关注列表:', followingArr);
        
        if (followingArr.length === 0) {
            return res.json({ success: true, data: [] });
        }
        
        // 获取关注的人的帖子
        const placeholders = followingArr.map(() => '?').join(',');
        const sqlStr = `
            SELECT p.*, u.name, u.avatar 
            FROM post_infom p
            LEFT JOIN user u ON p.id_user = u.id_user
            WHERE p.id_user IN (${placeholders}) 
            ORDER BY p.time DESC
        `;
        
        console.log('执行SQL查询:', sqlStr);
        console.log('查询参数:', followingArr);
        
        const results = await query(sqlStr, followingArr);
        
        console.log('好友帖子数量:', results.length);
        
        return res.json({ success: true, data: results });
        
    } catch (error) {
        console.error('获取好友帖子失败:', error);
        return res.status(500).json({ success: false, message: '获取好友帖子失败' });
    }
});

//搜索帖子
router.get('/search', (req, res) => {
    const keyword = req.query.keyword;
    
    console.log('搜索请求 - 关键词:', keyword);
    
    if (!keyword || keyword.trim() === '') {
        console.log('搜索关键词为空，返回400错误');
        return res.status(400).json({ success: false, message: '搜索关键词不能为空' });
    }
    
    const searchKeyword = `%${keyword}%`;
    const sqlStr = `
        SELECT p.*, u.name, u.avatar 
        FROM post_infom p
        LEFT JOIN user u ON p.id_user = u.id_user
        WHERE (p.content LIKE ?) 
        ORDER BY p.time DESC
    `;
    
    console.log('执行SQL查询:', sqlStr);
    console.log('查询参数:', [searchKeyword]);
    
    db.query(sqlStr, [searchKeyword], (err, results) => {
        if (err) {
            console.log('搜索错误:', err.message);
            return res.status(500).json({ success: false, message: '搜索失败' });
        }
        
        console.log('搜索结果数量:', results.length);
        console.log('搜索结果:', results);
        
        // 即使没有结果也返回成功，让前端处理
        return res.json({
            success: true,
            data: results || [],
            keyword: keyword
        });
    });
});

//获取全部帖子信息（支持分页）
router.get('/index', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    
    console.log('首页分页参数:', { page, limit, offset });
    
    // 获取帖子总数
    db.query('SELECT COUNT(*) as total FROM post_infom', (err, countResult) => {
        if (err) throw err
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        console.log('首页分页计算结果:', { total, totalPages, currentPage: page });
        
        // 获取分页帖子
        db.query('SELECT p.*, u.name, u.avatar FROM post_infom p LEFT JOIN user u ON p.id_user = u.id_user ORDER BY p.time DESC LIMIT ? OFFSET ?', 
            [limit, offset], (err, results) => {
            if (err) throw err
            
            console.log('首页查询到的帖子数量:', results.length);
            
            if (results.length === 0) {
                return res.json({
                    posts: [],
                    pagination: {
                        currentPage: page,
                        totalPages: totalPages,
                        totalPosts: total,
                        postsPerPage: limit,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                });
            } else {
                return res.json({
                    posts: results,
                    pagination: {
                        currentPage: page,
                        totalPages: totalPages,
                        totalPosts: total,
                        postsPerPage: limit,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                });
            }
        });
    });
})

//根据点赞数显示帖子顺序（支持分页）
router.get('/indexLike', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    
    console.log('点赞排序分页参数:', { page, limit, offset });
    
    // 获取帖子总数
    db.query('SELECT COUNT(*) as total FROM post_infom', (err, countResult) => {
        if (err) throw err
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        console.log('点赞排序分页计算结果:', { total, totalPages, currentPage: page });
        
        // 获取分页帖子（按点赞数排序，点赞数相同时按时间降序）
        const sqlStr = `
            SELECT p.*, u.name, u.avatar,
                   (SELECT COUNT(*) FROM likes WHERE likes.id_from_post = p.id) as likeCount 
            FROM post_infom p
            LEFT JOIN user u ON p.id_user = u.id_user
            ORDER BY likeCount DESC, p.time DESC 
            LIMIT ? OFFSET ?
        `;
        
        console.log('执行SQL查询:', sqlStr);
        console.log('查询参数:', [limit, offset]);
        
        db.query(sqlStr, [limit, offset], (err, results) => {
            if (err) throw err
            
            console.log('点赞排序查询到的帖子数量:', results.length);
            
            if (results.length === 0) {
                return res.json({
                    posts: [],
                    pagination: {
                        currentPage: page,
                        totalPages: totalPages,
                        totalPosts: total,
                        postsPerPage: limit,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                });
            } else {
                return res.json({
                    posts: results,
                    pagination: {
                        currentPage: page,
                        totalPages: totalPages,
                        totalPosts: total,
                        postsPerPage: limit,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                });
            }
        });
    });
})

//显示收藏
router.get('/collect',passport.authenticate('jwt',{session:false}),(req,res)=>{
    db.query('select * from collect where userid_collect=?',[req.user.id_user],(err,result)=>{
        if(err){
            console.log(err.message)
            return res.status(500).json(err.message)
        }
        return res.json(result)
    })
})

//显示点赞
router.get('/like/:postId',(req,res)=>{
    db.query('select userid_like from likes where id_from_post=?',[req.params.postId],(err,result)=>{
        if(err){
            console.log(err.message)
            return res.status(500).json(err.message)
        }

        const likeCount = result.length     
        const userIdLike = result.map(item=>item.userid_like)   
        return res.json({likeCount:likeCount, userIdLike:userIdLike})
    })
})

//获取评论区的信息 - 移到具体路由之后
router.get('/:postId/comments',(req,res)=>{
    const postId = req.params.postId

    const sqlStr = 'SELECT c.*, u.name, u.avatar FROM comments c LEFT JOIN user u ON c.id_user = u.id_user WHERE c.id_from_post=? ORDER BY c.time DESC'
    db.query(sqlStr,[postId],(err,results)=>{
        if(err){
            console.log(err.message)
            return res.status(500).json(err.message)
        }
        return res.json(results)
    })
})

//获取单个帖子详情 - 移到所有具体路由之后
router.get('/:postId',(req,res)=>{
    const postId = req.params.postId
    
    const sqlStr = 'select p.*, u.name, u.avatar from post_infom p LEFT JOIN user u ON p.id_user = u.id_user where p.id=?'
    db.query(sqlStr,[postId],(err,results)=>{
        if(err){
            console.log('获取帖子详情错误:', err.message)
            return res.status(500).json(err.message)
        }
        if(results.length === 0){
            return res.status(404).json('帖子不存在')
        }else{
            return res.json(results[0])
        }
    })
})

//添加新帖子
router.post(
  '/add',
  passport.authenticate('jwt', { session: false }),
  upload.array('images', 9),
  async (req, res) => {
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);

    // 检查用户
    if (!req.user || !req.user.id_user) {
        return res.status(401).json('未登录或token无效');
    }

    // 检查内容
    const content = req.body?.content;
    const type = req.body?.type;

    console.log('=== 后端接收数据详情 ===');
    console.log('请求方法:', req.method);
    console.log('请求URL:', req.url);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Authorization:', req.headers.authorization ? '存在' : '不存在');
    console.log('收到的数据:', {
        content: content,
        type: type,
        bodyKeys: Object.keys(req.body),
        bodyValues: req.body,
        bodyType: typeof req.body,
        bodyStringified: JSON.stringify(req.body),
        filesCount: req.files ? req.files.length : 0,
        files: req.files
    });
    console.log('req.body类型:', typeof req.body);
    console.log('req.body是否为对象:', req.body && typeof req.body === 'object');
    console.log('req.body键值对:');
    for (let key in req.body) {
        console.log(`  ${key}: ${req.body[key]} (类型: ${typeof req.body[key]})`);
    }

    if (!content || !type) {
            console.log('缺少字段详情:', { 
        content: !!content, 
        type: !!type,
        contentValue: content,
        typeValue: type,
        bodyKeys: Object.keys(req.body),
        bodyValues: req.body
    });
    return res.status(400).json(`缺少必要字段: content=${!!content}, type=${!!type}`);
    }

    const imagePaths = req.files.map(file => '/uploads/' + file.filename);
    const imagesJson = JSON.stringify(imagePaths);

    const time = req.body?.time ? toMysqlDatetime(req.body.time) : toMysqlDatetime(new Date());
    const sqlInsert = 'insert into post_infom (content,images,type,id_user,time) values (?,?,?,?,?)'
    db.query(sqlInsert,[content,imagesJson,type,req.user.id_user,time],(err,result)=>{
        if(err) {
            console.log('数据库插入错误:', err.message)
            return res.status(500).json(err.message)
        }
        if(result.affectedRows === 1){
            // 获取新插入的帖子完整信息
            const getNewPostSql = `
                SELECT p.*, u.name, u.avatar 
                FROM post_infom p
                LEFT JOIN user u ON p.id_user = u.id_user
                WHERE p.id = ?
            `;
            db.query(getNewPostSql, [result.insertId], (err2, postResult) => {
                if(err2) {
                    console.log('获取新帖子信息失败:', err2.message)
                    return res.status(500).json(err2.message)
                }
                if(postResult.length > 0) {
                    console.log('新帖子信息:', postResult[0]);
                    return res.json(postResult[0]);
                } else {
                    return res.status(500).json('获取新帖子信息失败');
                }
            });
        }
    })
})

//发布评论/回复
router.post('/comments', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        console.log('评论请求数据:', req.body);
        console.log('用户信息:', req.user);
        
        const addComment = {};
        if (req.body.content) addComment.content = req.body.content;
        if (req.body.id_from_post) addComment.id_from_post = req.body.id_from_post;
        if (req.body.id_user) addComment.id_user = req.body.id_user;
        addComment.parent_id = req.body.parent_id || null;
        addComment.parent_user_id = req.body.parent_user_id || null;

        // 查询帖子作者 ID
        const postResult = await query('SELECT id_user FROM post_infom WHERE id = ?', [addComment.id_from_post]);
        console.log('查询帖子作者结果:', postResult);
        
        if (postResult.length === 0) {
            console.error('帖子不存在，ID:', addComment.id_from_post);
            return res.status(404).json({ success: false, message: '帖子不存在' });
        }
        const postAuthorId = postResult[0].id_user;
        console.log('帖子作者ID:', postAuthorId);
        
        // 确定消息的目标用户和类型
        let targetId, messageKind;
        
        if (addComment.parent_id) {
            // 这是回复，目标是被回复的用户
            targetId = addComment.parent_user_id;
            messageKind = 'reply';
            console.log('回复消息 - 目标用户ID:', targetId);
            
            // 检查parent_user_id是否存在
            if (!targetId) {
                console.error('回复消息缺少parent_user_id，无法发送消息通知');
                console.log('跳过消息插入，继续执行评论功能');
            }
        } else {
            // 这是评论，目标是帖子作者
            targetId = postAuthorId;
            messageKind = 'comment';
            console.log('评论消息 - 目标用户ID:', targetId);
        }
        
        // 检查是否是自己给自己发消息，以及targetId是否有效
        if (targetId && parseInt(addComment.id_user) === parseInt(targetId)) {
            console.log('用户给自己发消息，不发送消息通知');
        } else if (targetId) {
            // 检查message表是否存在，如果不存在则创建
            try {
                await query(`
                    CREATE TABLE IF NOT EXISTS message (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        target_id INT NOT NULL,
                        kind VARCHAR(45) NOT NULL,
                        from_id INT,
                        from_post_id INT,
                        specific VARCHAR(200),
                        isread TINYINT NOT NULL DEFAULT 0,
                        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                console.log('message表检查/创建成功');
            } catch (error) {
                console.log('message表已存在或创建失败:', error.message);
            }
            
            // 插入消息
            try {
                await query(
                    'INSERT INTO message (target_id, kind, from_id, from_post_id) VALUES (?, ?, ?, ?)',
                    [targetId, messageKind, addComment.id_user, addComment.id_from_post]
                );
                console.log('插入消息成功，类型:', messageKind);
            } catch (msgError) {
                console.error('插入消息失败:', msgError.message);
                // 即使消息插入失败，也不影响评论功能
            }
        } else {
            console.log('targetId无效，跳过消息插入');
        }

        const sqlInsert = 'insert into comments (content, id_from_post, id_user, parent_id, parent_user_id) values (?, ?, ?, ?, ?)';
        const result = await query(sqlInsert, [addComment.content, addComment.id_from_post, addComment.id_user, addComment.parent_id, addComment.parent_user_id]);
        
        if (result.affectedRows === 1) {
            // 新增：插入成功后查出完整评论对象返回（包含用户信息）
            const newId = result.insertId;
            const rows = await query('SELECT c.*, u.name, u.avatar FROM comments c LEFT JOIN user u ON c.id_user = u.id_user WHERE c.idcomments=?', [newId]);
            
            if (rows.length > 0) {
                // 返回新评论对象
                return res.json({
                    success: true,
                    ...rows[0], // 展开所有字段
                    replies: []
                });
            } else {
                return res.json({ success: true, message: '添加成功，但未查到新评论' });
            }
        } else {
            return res.status(500).json({ success: false, message: '评论添加失败' });
        }
    } catch (error) {
        console.error('评论操作错误:', error);
        console.error('错误堆栈:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
});

//收藏
router.post('/addCollect',passport.authenticate('jwt',{session:false}), async (req,res)=>{
    try {
        console.log('收藏请求数据:', req.body);
        console.log('用户信息:', req.user);
        
        const fromPostId = parseInt(req.body.id_from_post, 10);
        if (isNaN(fromPostId)) {
            console.error('无效的帖子ID:', req.body.id_from_post);
            return res.status(400).json({ success: false, message: '无效的帖子ID' });
        }

        const userId = req.body.userid_collect;
        console.log('处理收藏请求 - 用户ID:', userId, '帖子ID:', fromPostId);
        
        // 检查是否已收藏
        const collectResult = await query('SELECT * FROM collect WHERE userid_collect = ? AND id_from_post = ?', [userId, fromPostId]);
        console.log('查询收藏记录结果:', collectResult);

        if (collectResult.length > 0) {
            // 取消收藏
            console.log('用户已收藏，执行取消收藏');
            const deleteCollectResult = await query('DELETE FROM collect WHERE userid_collect = ? AND id_from_post = ?', [userId, fromPostId]);
            console.log('删除收藏记录结果:', deleteCollectResult);
            
            if (deleteCollectResult.affectedRows === 1) {
                // 删除消息
                try {
                    await query('DELETE FROM message WHERE kind = "collect" AND from_id = ? AND from_post_id = ?', [userId, fromPostId]);
                    console.log('删除收藏消息成功');
                } catch (msgError) {
                    console.log('删除收藏消息失败:', msgError.message);
                }
                return res.json({ success: true, message: '取消收藏成功' });
            } else {
                console.error('删除收藏记录失败，影响行数:', deleteCollectResult.affectedRows);
                return res.json({ success: false, message: '取消收藏失败' });
            }
        } else {
            // 插入收藏记录
            console.log('用户未收藏，执行添加收藏');
            const insertCollectResult = await query('INSERT INTO collect (userid_collect, id_from_post) VALUES (?, ?)', [userId, fromPostId]);
            console.log('插入收藏记录结果:', insertCollectResult);
            
            if (insertCollectResult.affectedRows === 1) {
                // 查询帖子作者 ID
                const postResult = await query('SELECT id_user FROM post_infom WHERE id = ?', [fromPostId]);
                console.log('查询帖子作者结果:', postResult);
                
                if (postResult.length === 0) {
                    console.error('帖子不存在，ID:', fromPostId);
                    return res.status(404).json({ success: false, message: '帖子不存在' });
                }
                const targetId = postResult[0].id_user;
                console.log('帖子作者ID:', targetId);
                
                // 检查是否是自己给自己收藏
                if (parseInt(userId) === parseInt(targetId)) {
                    console.log('用户给自己收藏，不发送消息通知');
                    return res.json({ success: true, message: '收藏成功' });
                }
                
                // 检查message表是否存在，如果不存在则创建
                try {
                    await query(`
                        CREATE TABLE IF NOT EXISTS message (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            target_id INT NOT NULL,
                            kind VARCHAR(45) NOT NULL,
                            from_id INT,
                            from_post_id INT,
                            specific VARCHAR(200),
                            isread TINYINT NOT NULL DEFAULT 0,
                            time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    `);
                    console.log('message表检查/创建成功');
                } catch (error) {
                    console.log('message表已存在或创建失败:', error.message);
                }
                
                // 插入消息
                try {
                    await query(
                        'INSERT INTO message (target_id, kind, from_id, from_post_id) VALUES (?, ?, ?, ?)',
                        [targetId, 'collect', userId, fromPostId]
                    );
                    console.log('插入收藏消息成功');
                } catch (msgError) {
                    console.error('插入收藏消息失败:', msgError.message);
                    // 即使消息插入失败，也不影响收藏功能
                }
                
                return res.json({ success: true, message: '收藏成功' });
            } else {
                console.error('插入收藏记录失败，影响行数:', insertCollectResult.affectedRows);
                return res.json({ success: false, message: '收藏失败' });
            }
        }
    } catch (error) {
        console.error('收藏操作错误:', error);
        console.error('错误堆栈:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
});

//点赞
router.post('/addLike', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        console.log('点赞请求数据:', req.body);
        console.log('用户信息:', req.user);
        
        const fromPostId = parseInt(req.body.id_from_post, 10);
        if (isNaN(fromPostId)) {
            console.error('无效的帖子ID:', req.body.id_from_post);
            return res.status(400).json({ success: false, message: '无效的帖子ID' });
        }

        const userId = req.body.userid_like;
        console.log('处理点赞请求 - 用户ID:', userId, '帖子ID:', fromPostId);
        
        // 检查是否已点赞
        const likeResult = await query('SELECT * FROM likes WHERE userid_like = ? AND id_from_post = ?', [userId, fromPostId]);
        console.log('查询点赞记录结果:', likeResult);

        if (likeResult.length > 0) {
            // 取消点赞
            console.log('用户已点赞，执行取消点赞');
            const deleteLikeResult = await query('DELETE FROM likes WHERE userid_like = ? AND id_from_post = ?', [userId, fromPostId]);
            console.log('删除点赞记录结果:', deleteLikeResult);
            
            if (deleteLikeResult.affectedRows === 1) {
                // 删除消息
                try {
                    await query('DELETE FROM message WHERE kind = "like" AND from_id = ? AND from_post_id = ?', [userId, fromPostId]);
                    console.log('删除点赞消息成功');
                } catch (msgError) {
                    console.log('删除点赞消息失败:', msgError.message);
                }
                return res.json({ success: true, message: '取消成功' });
            } else {
                console.error('删除点赞记录失败，影响行数:', deleteLikeResult.affectedRows);
                return res.json({ success: false, message: '取消失败' });
            }
        } else {
            // 插入点赞记录
            console.log('用户未点赞，执行添加点赞');
            const insertLikeResult = await query('INSERT INTO likes (userid_like, id_from_post) VALUES (?, ?)', [userId, fromPostId]);
            console.log('插入点赞记录结果:', insertLikeResult);
            
            if (insertLikeResult.affectedRows === 1) {
                // 查询帖子作者 ID
                const postResult = await query('SELECT id_user FROM post_infom WHERE id = ?', [fromPostId]);
                console.log('查询帖子作者结果:', postResult);
                
                if (postResult.length === 0) {
                    console.error('帖子不存在，ID:', fromPostId);
                    return res.status(404).json({ success: false, message: '帖子不存在' });
                }
                const targetId = postResult[0].id_user;
                console.log('帖子作者ID:', targetId);
                
                // 检查是否是自己给自己点赞
                if (parseInt(userId) === parseInt(targetId)) {
                    console.log('用户给自己点赞，不发送消息通知');
                    return res.json({ success: true, message: '点赞成功' });
                }
                
                // 检查message表是否存在，如果不存在则创建
                try {
                    await query(`
                        CREATE TABLE IF NOT EXISTS message (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            target_id INT NOT NULL,
                            kind VARCHAR(45) NOT NULL,
                            from_id INT,
                            from_post_id INT,
                            specific VARCHAR(200),
                            isread TINYINT NOT NULL DEFAULT 0,
                            time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    `);
                    console.log('message表检查/创建成功');
                } catch (error) {
                    console.log('message表已存在或创建失败:', error.message);
                }
                
                // 插入消息
                try {
                    await query(
                        'INSERT INTO message (target_id, kind, from_id, from_post_id) VALUES (?, ?, ?, ?)',
                        [targetId, 'like', userId, fromPostId]
                    );
                    console.log('插入点赞消息成功');
                } catch (msgError) {
                    console.error('插入点赞消息失败:', msgError.message);
                    // 即使消息插入失败，也不影响点赞功能
                }
                
                return res.json({ success: true, message: '点赞成功' });
            } else {
                console.error('插入点赞记录失败，影响行数:', insertLikeResult.affectedRows);
                return res.json({ success: false, message: '点赞失败' });
            }
        }
    } catch (error) {
        console.error('点赞操作错误:', error);
        console.error('错误堆栈:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// 删除帖子接口
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id_user;
    
    // 查询该帖子是否属于当前用户
    db.query('SELECT p.*, u.name, u.avatar FROM post_infom p LEFT JOIN user u ON p.id_user = u.id_user WHERE p.id = ?', [postId], (err, rows) => {
        if (err) {
            return res.status(500).json({ code: 1, msg: '数据库查询错误' });
        }
        
        if (!rows.length) {
            return res.status(404).json({ code: 1, msg: '帖子不存在' });
        }
        
        if (rows[0].id_user !== userId) {
            return res.status(403).json({ code: 1, msg: '无权删除他人帖子' });
        }
        
        // 删除帖子
        db.query('DELETE FROM post_infom WHERE id = ?', [postId], (err, result) => {
            if (err) {
                return res.status(500).json({ code: 1, msg: '删除失败' });
            }
            res.json({ code: 0, msg: '删除成功' });
        });
    });
});

// 删除评论接口
router.delete('/comments/:commentId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.user.id_user;

        console.log('删除评论，评论ID:', commentId, '用户ID:', userId);

        // 验证评论是否属于当前用户
        const comment = await query('SELECT * FROM comments WHERE idcomments = ? AND id_user = ?', [commentId, userId]);
        
        if (comment.length === 0) {
            return res.status(404).json({ success: false, message: '评论不存在或无权限删除' });
        }

        // 删除评论
        await query('DELETE FROM comments WHERE idcomments = ?', [commentId]);

        res.json({ success: true, message: '删除成功' });

    } catch (error) {
        console.error('删除评论失败:', error);
        res.status(500).json({ success: false, message: '删除失败' });
    }
});

module.exports = router