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
const message = require('./routes/api/message')

//使用cors做跨域申请
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true
}))

//使用bodyparser中间件
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

//passport初始化
app.use(passport.initialize());
require('./config/passport')(passport)

// 设置静态文件目录（放在API路由之前）
app.use('/uploads', express.static('uploads'));

//使用API路由（放在静态文件中间件之后，页面路由之前）
app.use('/api/user',user)
app.use('/api/posts',posts)
app.use('/api/personal',personal)
app.use('/api/accounts',accounts)
app.use('/api/message',message)

// 临时数据库修复路由
app.get('/fix-database', (req, res) => {
    const db = require('./database/index');
    
    console.log('开始修复数据库结构...');
    
    // 删除avatar列
    db.query('ALTER TABLE post_infom DROP COLUMN IF EXISTS avatar', (err, result) => {
        if (err) {
            console.error('删除avatar列失败:', err.message);
        } else {
            console.log('✅ avatar列删除成功');
        }
        
        // 删除name列
        db.query('ALTER TABLE post_infom DROP COLUMN IF EXISTS name', (err2, result2) => {
            if (err2) {
                console.error('删除name列失败:', err2.message);
            } else {
                console.log('✅ name列删除成功');
            }
            
            // 查看修改后的表结构
            db.query('DESCRIBE post_infom', (err3, result3) => {
                if (err3) {
                    console.error('查看表结构失败:', err3.message);
                    res.json({ success: false, error: err3.message });
                } else {
                    console.log('\n修改后的post_infom表结构:');
                    console.log(result3);
                    console.log('\n🎉 数据库结构修复完成！');
                    res.json({ 
                        success: true, 
                        message: '数据库结构修复完成',
                        tableStructure: result3 
                    });
                }
            });
        });
    });
});

// 静态文件中间件（放在API路由之后）
app.use(express.static(path.join(__dirname, 'front-end')));

// 注册页面路由（放在API路由之后）
app.use('/', viewRouter);

//set port
const port = process.env.PORT || 3000

app.listen(port,()=>{
    console.log(`server is running on ${port}`)
})

