const mysql = require('mysql');

const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin123',
    database: 'user_db'
});

console.log('检查所有用户信息...');

db.query('SELECT id_user, name, phone, avatar FROM user ORDER BY id_user', (err, results) => {
    if (err) {
        console.error('查询失败:', err);
        return;
    }
    
    console.log('\n所有用户信息:');
    results.forEach(user => {
        console.log(`ID: ${user.id_user}, 名称: ${user.name}, 手机: ${user.phone}, 头像: ${user.avatar}`);
    });
    
    // 检查哪个用户有更新后的头像
    const updatedUser = results.find(user => user.avatar.includes('avatar_2_1753361592843.webp'));
    if (updatedUser) {
        console.log(`\n找到更新头像的用户: ID=${updatedUser.id_user}, 名称=${updatedUser.name}`);
    }
    
    process.exit(0);
}); 