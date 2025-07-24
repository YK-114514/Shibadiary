const db = require('./database/index');

console.log('开始检查数据库...');

// 检查用户ID为2的帖子
db.query('SELECT id, id_user, avatar, name, content FROM post_infom WHERE id_user = 2', (err, results) => {
    if (err) {
        console.error('查询帖子失败:', err);
        return;
    }
    
    console.log('用户ID为2的帖子:');
    console.log('总数:', results.length);
    results.forEach((post, index) => {
        console.log(`${index + 1}. ID: ${post.id}, 用户ID: ${post.id_user}, 头像: ${post.avatar}, 用户名: ${post.name}`);
    });
    
    // 检查用户表
    db.query('SELECT id_user, name, avatar FROM user WHERE id_user = 2', (err2, userResults) => {
        if (err2) {
            console.error('查询用户失败:', err2);
            return;
        }
        
        console.log('\n用户信息:');
        userResults.forEach(user => {
            console.log(`用户ID: ${user.id_user}, 用户名: ${user.name}, 头像: ${user.avatar}`);
        });
        
        // 检查所有帖子
        db.query('SELECT id, id_user, avatar, name FROM post_infom LIMIT 10', (err3, allPosts) => {
            if (err3) {
                console.error('查询所有帖子失败:', err3);
                return;
            }
            
            console.log('\n所有帖子 (前10条):');
            allPosts.forEach((post, index) => {
                console.log(`${index + 1}. ID: ${post.id}, 用户ID: ${post.id_user}, 头像: ${post.avatar}, 用户名: ${post.name}`);
            });
            
            process.exit(0);
        });
    });
}); 