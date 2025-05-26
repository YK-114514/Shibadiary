const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken');
const db = require('../../database/index')


//获取全部帖子信息
router.get('/personal',passport.authenticate('jwt',{session:false}),(req,res)=>{
    console.log(req.user)
    db.query('select * from post_infom where id_user=?',[req.user.id_user],(err,results)=>{
        if(err) throw err
        
        return res.json(results)
        
    })
})




module.exports = router