const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const passport = require('passport')
const cors = require('cors')
const path = require('path')

//引入路由
const user = require('./routes/api/user')
const posts = require('./routes/api/posts')
const personal = require('./routes/api/personal')
const viewRouter = require('./routes/viewRouters');
const accounts = require('./routes/api/accounts')

//使用cors做跨域申请
app.use(cors())

//使用bodyparser中间件
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

//passport初始化
app.use(passport.initialize());
require('./config/passport')(passport)

// 注册页面路由（放在静态文件路由之前）
app.use('/', viewRouter);

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'front-end')));

//使用API路由
app.use('/api/user',user)
app.use('/api/posts',posts)
app.use('/api/personal',personal)
app.use('/api/accounts',accounts)

//set port
const port = process.env.PORT || 3000

app.use('/uploads', express.static('uploads'));

app.listen(port,()=>{
    console.log(`server is running on ${port}`)
})

