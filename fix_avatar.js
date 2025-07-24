const mysql = require('mysql');

const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin123',
    database: 'user_db'
});

console.log('修复niconico用户的头像...');

// 使用Niconiconi用户的头像路径
const newAvatarUrl = '/images/avatars/avatar_2_1753361592843.webp';

db.query('UPDATE user SET avatar=? WHERE name=?', [newAvatarUrl, 'niconico'], (err, result) => {
    if (err) {
        console.error('更新失败:', err);
        return;
    }
    
    if (result.affectedRows === 1) {
        console.log('niconico用户头像更新成功！');
        
        // 同时更新该用户的所有帖子头像
        db.query('UPDATE post_infom SET avatar=? WHERE id_user=1', [newAvatarUrl], (err2, result2) => {
            if (err2) {
                console.error('更新帖子头像失败:', err2);
            } else {
                console.log(`成功更新了 ${result2.affectedRows} 个帖子的头像`);
            }
            
            // 同时更新该用户的所有评论头像
            db.query('UPDATE comments SET avatar=? WHERE id_user=1', [newAvatarUrl], (err3, result3) => {
                if (err3) {
                    console.error('更新评论头像失败:', err3);
                } else {
                    console.log(`成功更新了 ${result3.affectedRows} 个评论的头像`);
                }
                
                console.log('所有更新完成！');
                process.exit(0);
            });
        });
    } else {
        console.log('更新失败，未找到niconico用户');
        process.exit(1);
    }
}); 