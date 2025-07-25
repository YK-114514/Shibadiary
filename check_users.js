const db = require('./database/index');

console.log('检查数据库中的用户...');

db.query('SELECT id_user, name, phone FROM user LIMIT 10', (err, results) => {
    if (err) {
        console.error('查询用户失败:', err);
        return;
    }
    
    console.log('数据库中的用户:');
    results.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id_user}, 用户名: ${user.name}, 手机: ${user.phone}`);
    });
    
    if (results.length === 0) {
        console.log('数据库中没有用户数据');
    }
    
    process.exit(0);
}); 