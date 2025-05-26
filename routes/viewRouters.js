const express = require('express');
const path = require('path');

const router = express.Router();

// 注册页面
router.get('/register', (req, res) => {
  const filePath = path.join(__dirname, '../front-end/views/register.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('文件发送错误:', err);
      console.log('尝试访问的文件路径:', filePath);
      res.status(500).send('无法加载注册页面');
    }
  });
});

router.get('/login', (req, res) => {
  const filePath = path.join(__dirname, '../front-end/views/login.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('文件发送错误:', err);
      console.log('尝试访问的文件路径:', filePath);
      res.status(500).send('无法加载登录页面');
    }
  });
});
router.get('/personal', (req, res) => {
  const filePath = path.join(__dirname, '../front-end/views/personal.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('文件发送错误:', err);
      console.log('尝试访问的文件路径:', filePath);
      res.status(500).send('无法加载登录页面');
    }
  });
});
// 主页及其子页面
router.get('/', (req, res) => {
  res.redirect('/index');
});
router.get(['/index', '/index/post', '/index/ask', '/index/friends', '/index/collect'], (req, res) => {
  const filePath = path.join(__dirname, '../front-end/views/index.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('文件发送错误:', err);
      console.log('尝试访问的文件路径:', filePath);
      res.status(500).send('无法加载页面');
    }
  });
});

router.get('/accounts', (req, res) => {
  const filePath = path.join(__dirname, '../front-end/views/accounts.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('文件发送错误:', err);
      console.log('尝试访问的文件路径:', filePath);
      res.status(500).send('无法加载登录页面');
    }
  });
});



module.exports = router;