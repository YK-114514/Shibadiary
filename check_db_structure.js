const db = require('./database/index');

console.log('检查数据库结构和连接...');

// 检查post_infom表结构
db.query('DESCRIBE post_infom', (err, results) => {
    if (err) {
        console.error('检查post_infom表结构失败:', err);
        return;
    }
    
    console.log('\npost_infom表结构:');
    results.forEach(field => {
        console.log(`- ${field.Field}: ${field.Type} ${field.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 检查user表结构
    db.query('DESCRIBE user', (err2, userResults) => {
        if (err2) {
            console.error('检查user表结构失败:', err2);
            return;
        }
        
        console.log('\nuser表结构:');
        userResults.forEach(field => {
            console.log(`- ${field.Field}: ${field.Type} ${field.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // 检查是否有数据
        db.query('SELECT COUNT(*) as count FROM post_infom', (err3, countResult) => {
            if (err3) {
                console.error('检查post_infom数据失败:', err3);
                return;
            }
            
            console.log(`\npost_infom表数据量: ${countResult[0].count}`);
            
            // 测试JOIN查询
            db.query(`
                SELECT p.*, u.name, u.avatar 
                FROM post_infom p
                LEFT JOIN user u ON p.id_user = u.id_user
                LIMIT 3
            `, (err4, joinResults) => {
                if (err4) {
                    console.error('测试JOIN查询失败:', err4);
                    return;
                }
                
                console.log('\nJOIN查询结果:');
                joinResults.forEach((row, index) => {
                    console.log(`${index + 1}. ID: ${row.id}, 用户ID: ${row.id_user}, 用户名: ${row.name || 'NULL'}, 头像: ${row.avatar || 'NULL'}`);
                });
                
                process.exit(0);
            });
        });
    });
}); 