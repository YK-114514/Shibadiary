const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken');
const db = require('../../database/index')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // 保存到本地 uploads 目录

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

//获取全部帖子信息
router.get('/index',(req,res)=>{
    db.query('select * from post_infom ORDER BY time DESC',(err,results)=>{
        if(err) throw err
        if(results.length === 0){
            return res.status(404).json('暂无数据')
        }else{
            return res.json(results)
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
    const name = req.body?.name;
    const content = req.body?.content;
    const type = req.body?.type;

    if (!name || !content || !type) {
        return res.status(400).json('缺少必要字段');
    }

    const imagePaths = req.files.map(file => '/uploads/' + file.filename);
    const imagesJson = JSON.stringify(imagePaths);

    const avatar = req.user.avatar || '/images/default_avatar.jpg';
    const time = req.body?.time ? toMysqlDatetime(req.body.time) : toMysqlDatetime(new Date());
    const sqlInsert = 'insert into post_infom (name,content,images,type,id_user,avatar,time) values (?,?,?,?,?,?,?)'
    db.query(sqlInsert,[name,content,imagesJson,type,req.user.id_user,avatar,time],(err,result)=>{
        if(err) {
            console.log('数据库插入错误:', err.message)
            return res.status(500).json(err.message)
        }
        if(result.affectedRows === 1){
            return res.json('添加成功')
        }
    })
})

//获取评论区的信息
router.get('/:postId/comments',(req,res)=>{
    const postId = req.params.postId

    const sqlStr = 'select * from comments where id_from_post=?'
    db.query(sqlStr,[postId],(err,results)=>{
        if(err){
            console.log(err.message)
            return res.status(500).json(err.message)
        }
        return res.json(results)
    })
})

//发布评论
router.post('/comments',passport.authenticate('jwt',{session:false}),(req,res)=>{
    const addComment={}
    if(req.body.name) addComment.name = req.body.name
    if(req.body.content) addComment.content = req.body.content
    if(req.body.avatar) addComment.avatar = req.body.avatar
    if(req.body.id_from_post) addComment.id_from_post = req.body.id_from_post
    if(req.body.id_user) addComment.id_user = req.body.id_user

    const sqlInsert = 'insert into comments (name,content,avatar,id_from_post,id_user) values (?,?,?,?,?)'
    db.query(sqlInsert,[addComment.name,addComment.content,addComment.avatar,addComment.id_from_post,addComment.id_user],(err,result)=>{
        if(err) {
            console.log(err.message)
            return res.status(500).json(err.message)
        }
        if(result.affectedRows === 1){
            return res.json({
                success: true,
                message: '添加成功'
            })
        }
    })

})

//收藏
router.post('/addCollect',passport.authenticate('jwt',{session:false}),(req,res)=>{
   
    db.query('select * from collect where userid_collect=? and id_from_post=?',[req.body.userid_collect,req.body.id_from_post],(err,result)=>{
        if(result.length > 0){
            db.query('delete from collect where userid_collect=? and id_from_post=?',[req.body.userid_collect,req.body.id_from_post],(errD,resultD)=>{
                if(errD){
                    console.log(errD.message)
                    return res.status(500).json(errD.message)
                } if(resultD.affectedRows === 1){
                    return res.json({
                        success: true,
                        message: '删除成功'
                    })
                }
            })
        }else{

            db.query('insert into collect (userid_collect,id_from_post) values (?,?)',[req.body.userid_collect,req.body.id_from_post],(errI,resultI)=>{
                if(errI){
                    console.log(errI.message)
                    return res.status(500).json(errI.message)
                }
                if(resultI.affectedRows === 1){
                    return res.json({
                        success: true,
                        message: '收藏成功'
                    })
                }
            
               })

        }
    })
   

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

//点赞
router.post('/addLike',passport.authenticate('jwt',{session:false}),(req,res)=>{
    db.query('select * from likes where userid_like=? and id_from_post=?',[req.body.userid_like,req.body.id_from_post],(err,result)=>{
        if(result.length > 0){
            db.query('delete from likes where userid_like=? and id_from_post=?',[req.body.userid_like,req.body.id_from_post],(errD,resultD)=>{
                if(errD){
                    console.log(errD.message)
                    return res.status(500).json(errD.message)
                } if(resultD.affectedRows === 1){
                    return res.json({
                        success: true,
                        message: '取消成功'
                    })
                }
            })
        }else{

            db.query('insert into likes (userid_like,id_from_post) values (?,?)',[req.body.userid_like,req.body.id_from_post],(errI,resultI)=>{
                if(errI){
                    console.log(errI.message)
                    return res.status(500).json(errI.message)
                }
                if(resultI.affectedRows === 1){
                    return res.json({
                        success: true,
                        message: '点赞成功'
                    })
                }
            
               })

        }
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

//根据点赞数显示帖子顺序
router.get('/indexLike',(req,res)=>{
    db.query('select post_infom.*,(select count(*) from likes where likes.id_from_post=post_infom.id) as likeCount from post_infom order by likeCount DESC',(err,result)=>{
        if(err) throw err
        if(result.length === 0){
            return res.status(404).json('暂无数据')
        }else{
            return res.json(result)
        }
    })
})

// 删除帖子接口
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id_user;
    
    // 查询该帖子是否属于当前用户
    db.query('SELECT * FROM post_infom WHERE id = ?', [postId], (err, rows) => {
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

module.exports = router