const mysql = require('mysql');

const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin123',
    database: 'user_db'
});

console.log('检查Niconico用户的数据...');

db.query('SELECT id_user, name, avatar FROM user WHERE name = ?', ['Niconico'], (err, results) => {
    if (err) {
        console.error('查询失败:', err);
        return;
    }
    
    if (results.length === 0) {
        console.log('未找到Niconico用户');
    } else {
        console.log('找到用户:', results[0]);
    }
    
    // 检查所有用户
    db.query('SELECT id_user, name, avatar FROM user', (err, allUsers) => {
        if (err) {
            console.error('查询所有用户失败:', err);
            return;
        }
        
        console.log('\n所有用户信息:');
        allUsers.forEach(user => {
            console.log(`ID: ${user.id_user}, 名称: ${user.name}, 头像: ${user.avatar}`);
        });
        
        process.exit(0);
    });
}); 