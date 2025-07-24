const http = require('http');

console.log('测试API接口...');

const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/posts/12',
    method: 'GET'
}, (res) => {
    console.log('状态码:', res.statusCode);
    console.log('响应头:', res.headers['content-type']);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('✅ API接口正常工作！');
            console.log('响应数据:', data.substring(0, 100) + '...');
        } else {
            console.log('❌ API接口返回错误状态码:', res.statusCode);
            console.log('响应数据:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('请求错误:', e.message);
});

req.end(); 