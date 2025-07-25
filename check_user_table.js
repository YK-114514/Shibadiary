const db = require('./database/index');

console.log('详细检查user表结构...');

db.query('DESCRIBE user', (err, results) => {
    if (err) {
        console.error('检查user表结构失败:', err);
        return;
    }
    
    console.log('\nuser表完整结构:');
    results.forEach(field => {
        console.log(`- ${field.Field}: ${field.Type} ${field.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${field.Key || ''} ${field.Default || ''}`);
    });
    
    // 检查user表数据
    db.query('SELECT id_user, name FROM user LIMIT 5', (err2, userData) => {
        if (err2) {
            console.error('检查user数据失败:', err2);
            return;
        }
        
        console.log('\nuser表数据:');
        userData.forEach(user => {
            console.log(`- 用户ID: ${user.id_user}, 用户名: ${user.name}`);
        });
        
        process.exit(0);
    });
}); 