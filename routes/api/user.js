const express = require('express')
const router = express.Router()
const db = require('../../database/index')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const passport = require('passport')

// 引入multer用于头像上传
const multer = require('multer')
const path = require('path')

// 设置头像上传目录和文件名
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../front-end//images/avatars'))
    },
    filename: function (req, file, cb) {
        // 文件名：用户id+时间戳+后缀
        const ext = path.extname(file.originalname)
        const userId = req.user.id_user || 'unknown'
        cb(null, `avatar_${userId}_${Date.now()}${ext}`)
    }
})
const upload = multer({ storage: storage })

// JWT校验中间件
const requireAuth = passport.authenticate('jwt', { session: false })

/*router.get('/test',(req,res)=>{
    res.json({msg:'test now'})
})*/

// 获取当前用户信息
router.get('/me', requireAuth, (req, res) => {
    const userId = req.user.id_user
    db.query('SELECT id_user, name, avatar, phone FROM user WHERE id_user=?', [userId], (err, results) => {
        if (err) return res.status(500).json({ success: false, msg: '数据库错误' })
        if (results.length === 0) {
            return res.status(404).json({ success: false, msg: '用户不存在' })
        }
        const user = results[0]
        return res.json({ 
            success: true, 
            user: {
                id: user.id_user,
                name: user.name,
                avatar: user.avatar,
                phone: user.phone
            }
        })
    })
})

// 获取指定用户信息
router.get('/:userId', (req, res) => {
    const userId = req.params.userId
    db.query('SELECT id_user, name, avatar FROM user WHERE id_user=?', [userId], (err, results) => {
        if (err) {
            console.error('查询用户信息失败:', err);
            return res.status(500).json({ success: false, msg: '数据库错误' })
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, msg: '用户不存在' })
        }
        const user = results[0]
        return res.json({
            success: true,
            name: user.name,
            avatar: user.avatar
        })
    })
})

//register
router.post('/register',(req,res)=>{
    

    console.log('注册请求数据:', req.body)

    // 先检查昵称是否存在
    db.query('select * from user where name=?',[req.body.name],(errName,resultsName)=>{
        if(errName){
            console.error('昵称查询错误:', errName);
            return res.status(500).json('数据库查询错误')
        }
        if(resultsName.length > 0){
            console.log('昵称已被占用:', req.body.name);
            return res.status(400).json('该昵称已被占用')
        }else{
            console.log('昵称可用，检查手机号...');
            //检查手机号是否存在
            db.query('select * from user where phone=?',[req.body.phone],(err,results)=>{
                if(err){
                    console.error('手机号查询错误:', err);
                    return res.status(500).json('数据库查询错误')
                }
                if(results.length > 0){
                    console.log('手机号已被注册:', req.body.phone);
                    return res.status(400).json('该手机号已被占用')
                }else{
                    console.log('手机号可用，开始注册...');
                    const newUser = {
                        name:req.body.name,
                        phone:req.body.phone,
                        avatar:'//images/default_avatar.jpg',
                        password:req.body.password
                    }
                     //对密码进行加密+insert新用户
                    bcrypt.genSalt(10, function(err, salt) {
                        if(err) {
                            console.error('密码加密错误:', err);
                            return res.status(500).json('密码加密失败')
                        }
                        
                        bcrypt.hash(newUser.password, salt, function(err, hash) {
                            // Store hash in your password DB.
                            if(err) {
                                console.error('密码加密错误:', err);
                                return res.status(500).json('密码加密失败')
                            }
        
                            newUser.password = hash;
        
                            const userInsert = 'insert into user (name,phone,avatar,password) values (?,?,?,?)'
        
                            db.query(userInsert,[newUser.name,newUser.phone,newUser.avatar,newUser.password],(errNew,resultsNew)=>{
                                if(errNew) {
                                    console.error('用户插入错误:', errNew);
                                    return res.status(500).json('用户注册失败')
                                }
                                if(resultsNew.affectedRows === 1){
                                    console.log('用户注册成功:', newUser.name);
                                    return res.json({ msg: '注册成功' })
                                }else{
                                    console.error('用户插入失败，影响行数:', resultsNew.affectedRows);
                                    return res.status(500).json('用户注册失败')
                                }
                            })
                        });
                    });
                }
            })
        }
    })
})


//login

router.post('/login',(req,res)=>{
    //res.sendFile(path.join(__dirname, '../front-end/views/login.html'));
    const phone = req.body.phone
    const password = req.body.password
    db.query('select password from user where phone=?',[phone],(err,results)=>{
        if(err){
            return res.status(500).json({msg:'出错啦'})
        }
        if(results.length == 0){
            return res.status(404).json({msg:'尚未注册！'})
        }else{
            //db.query('select password from user_infom where email=?')

            bcrypt.compare(password, results[0].password,(err,isMatch)=>{
                if(err) {
                    console.log('密码比较失败:', err.message)
                    return res.status(500).json({ error: '密码比较失败' })
                }
                if(isMatch){
                    //token+规则定制
                    db.query('select * from user where phone=?',[phone],(err,resultsjwt)=>{
                        const rule = {id_user:resultsjwt[0].id_user,name:resultsjwt[0].name,avatar:resultsjwt[0].avatar}
                    jwt.sign(rule,'secret',{expiresIn:3600},(err,token)=>{
                        if(err) {
                            console.log('JWT签名失败:', err.message)
                            return res.status(500).json({ error: 'JWT签名失败' })
                        }
                        //console.log('token',token)
                        res.json({
                            success:true,
                            token:"Bearer "+token

                        })
                    })
                    })
                    
                    //res.json({msg:'success!'})
                }else{
                    res.status(400).json('密码错误')
                }
            })
           
        }
    })



})

// 1. 更改昵称
router.post('/nickname', requireAuth, (req, res) => {
    const userId = req.user.id_user
    const { nickname } = req.body
    if (!nickname || nickname.trim() === '') {
        return res.status(400).json({ success: false, msg: '昵称不能为空' })
    }
    db.query('UPDATE user SET name=? WHERE id_user=?', [nickname, userId], (err, result) => {
        if (err) return res.status(500).json({ success: false, msg: '数据库错误' })
        if (result.affectedRows === 1) {
            return res.json({ success: true, msg: '昵称修改成功', nickname })
        } else {
            return res.status(400).json({ success: false, msg: '昵称修改失败' })
        }
    })
})

// 2. 更改头像
router.post('/avatar', requireAuth, upload.single('avatar'), (req, res) => {
    const userId = req.user.id_user
    console.log('头像上传请求 - 用户ID:', userId)
    
    if (!req.file) {
        return res.status(400).json({ success: false, msg: '请上传头像文件' })
    }
    
    console.log('上传的文件信息:', req.file)
    
    // 头像URL（静态资源路径）
    const avatarUrl = `//images/avatars/${req.file.filename}`
    console.log('头像URL:', avatarUrl)
    
    // 先查询用户当前信息
    db.query('SELECT name FROM user WHERE id_user=?', [userId], (err, userResults) => {
        if (err) return res.status(500).json({ success: false, msg: '数据库错误' })
        if (userResults.length === 0) {
            return res.status(404).json({ success: false, msg: '用户不存在' })
        }
        
        const userName = userResults[0].name
        
        // 更新头像
        db.query('UPDATE user SET avatar=? WHERE id_user=?', [avatarUrl, userId], (err, result) => {
            if (err) return res.status(500).json({ success: false, msg: '数据库错误' })
            if (result.affectedRows === 1) {
                console.log('用户头像更新成功，开始更新用户的所有帖子头像')
                
                // 更新用户发布的所有帖子的头像
                db.query('UPDATE post_infom SET avatar=? WHERE id_user=?', [avatarUrl, userId], (err2, result2) => {
                    if (err2) {
                        console.error('更新帖子头像失败:', err2)
                        // 即使更新帖子失败，也不影响用户头像更新
                    } else {
                        console.log(`成功更新了 ${result2.affectedRows} 个帖子的头像`)
                    }
                    
                    // 生成新的JWT token，包含更新后的头像信息
                    const newRule = {
                        id_user: userId,
                        name: userName,
                        avatar: avatarUrl
                    }
                    console.log('新token规则:', newRule)
                    
                    jwt.sign(newRule, 'secret', { expiresIn: 3600 }, (err, newToken) => {
                        if (err) return res.status(500).json({ success: false, msg: '生成新token失败' })
                        console.log('新token生成成功')
                        return res.json({ 
                            success: true, 
                            msg: '头像修改成功', 
                            avatar: avatarUrl,
                            newToken: "Bearer " + newToken
                        })
                    })
                })
            } else {
                return res.status(400).json({ success: false, msg: '头像修改失败' })
            }
        })
    })
})

// 3. 更改密码
router.post('/password', requireAuth, async (req, res) => {
    const userId = req.user.id_user
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, msg: '参数不完整' })
    }
    // 查询原密码hash
    db.query('SELECT password FROM user WHERE id_user=?', [userId], async (err, results) => {
        if (err) return res.status(500).json({ success: false, msg: '数据库错误' })
        if (results.length === 0) {
            return res.status(404).json({ success: false, msg: '用户不存在' })
        }
        const hash = results[0].password
        const isMatch = await bcrypt.compare(oldPassword, hash)
        if (!isMatch) {
            return res.status(400).json({ success: false, msg: '原密码错误' })
        }
        // 加密新密码
        bcrypt.hash(newPassword, 10, (err, newHash) => {
            if (err) return res.status(500).json({ success: false, msg: '加密失败' })
            db.query('UPDATE user SET password=? WHERE id_user=?', [newHash, userId], (err2, result2) => {
                if (err2) return res.status(500).json({ success: false, msg: '数据库错误' })
                if (result2.affectedRows === 1) {
                    return res.json({ success: true, msg: '密码修改成功' })
                } else {
                    return res.status(400).json({ success: false, msg: '密码修改失败' })
                }
            })
        })
    })
})


module.exports = router