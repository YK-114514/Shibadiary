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
router.get(['/index', '/index/post', '/index/ask', '/index/friend', '/index/collect'], (req, res) => {
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

router.get('/message', (req, res) => {
  const filePath = path.join(__dirname, '../front-end/views/message.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('文件发送错误:', err);
      console.log('尝试访问的文件路径:', filePath);
      res.status(500).send('无法加载消息中心页面');
    }
  });
});

// 设置页面路由
router.get('/setting', (req, res) => {
  const filePath = path.join(__dirname, '../front-end/views/setting.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('文件发送错误:', err);
      console.log('尝试访问的文件路径:', filePath);
      res.status(500).send('无法加载设置页面');
    }
  });
});

// 帖子详情页路由 - 修改路径避免与API路由冲突
router.get('/post-detail/:id', (req, res) => {
  const filePath = path.join(__dirname, '../front-end/views/specific.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('文件发送错误:', err);
      console.log('尝试访问的文件路径:', filePath);
      res.status(500).send('无法加载帖子详情页');
    }
  });
});

module.exports = router;