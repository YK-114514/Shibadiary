const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')

// 使用cors做跨域申请
app.use(cors({
    origin: '*',
    credentials: true
}))

// 使用bodyparser中间件
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

// 静态文件服务
app.use('/front-end', express.static(path.join(__dirname, 'front-end')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/images', express.static(path.join(__dirname, 'front-end/images')))
app.use('/css', express.static(path.join(__dirname, 'front-end/css')))
app.use('/js', express.static(path.join(__dirname, 'front-end/js')))

// 简单的测试路由
app.get('/test', (req, res) => {
    res.json({ message: '服务器运行正常！', timestamp: new Date().toISOString() })
})

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'front-end', 'index.html'))
})

// 设置端口
const port = process.env.PORT || 3000

// 启动服务器
app.listen(port, () => {
    console.log(`✅ 服务器运行在端口 ${port}`)
    console.log(`✅ 服务器启动成功！`)
})
