const express = require('express')
const router = express.Router()
const db = require('../../database/index')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const passport = require('passport')

/*router.get('/test',(req,res)=>{
    res.json({msg:'test now'})
})*/

//register
router.post('/register',(req,res)=>{
    

    console.log(req.body)

    //检查手机号是否存在
    db.query('select * from user where phone=?',[req.body.phone],(err,results)=>{
        if(err){
            return res.status(500).json(err.message)
        }
        if(results.length > 0){
            return res.status(400).json('手机号已被注册')
        }else{
            const newUser = {
                name:req.body.name,
                phone:req.body.phone,
                avatar:'/images/default_avatar.jpg',
                password:req.body.password
            }
             //对密码进行加密+insert新用户
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(newUser.password, salt, function(err, hash) {
                    // Store hash in your password DB.
                    if(err) console.log(err.message);
    
                    newUser.password = hash;
    
                    const userInsert = 'insert into user (name,phone,avatar,password) values (?,?,?,?)'
    
                    db.query(userInsert,[newUser.name,newUser.phone,newUser.avatar,newUser.password],(errNew,resultsNew)=>{
                        if(errNew) return console.log(errNew.message)
                        if(resultsNew.affectedRows === 1){console.log('插入成功') 
                            return res.json({ msg: '注册成功' })}
                        
                    })
                });
            });
    
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
                if(err) throw err;
                if(isMatch){
                    //token+规则定制
                    db.query('select * from user where phone=?',[phone],(err,resultsjwt)=>{
                        const rule = {id_user:resultsjwt[0].id_user,name:resultsjwt[0].name,avatar:resultsjwt[0].avatar}
                    jwt.sign(rule,'secret',{expiresIn:3600},(err,token)=>{
                        if(err) throw err;
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




module.exports = router