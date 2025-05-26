const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken');
const db = require('../../database/index')


router.get('/:userId/accounts',(req,res)=>{
  
    db.query('select * from post_infom where id_user=?',[req.params.userId],(err,results)=>{
        if(err) throw err
        
        return res.json(results)
        
    })

})

module.exports = router