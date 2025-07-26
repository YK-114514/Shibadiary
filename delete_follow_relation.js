const mysql = require('mysql');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin123',
    database: 'user_db'
});

connection.connect((err) => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    
    console.log('数据库连接成功');
    
    const follower_id = 2;
    const following_id = 3;
    
    // 删除关注关系
    connection.query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [follower_id, following_id], (err, result) => {
        if (err) {
            console.error('删除关注关系失败:', err);
        } else {
            console.log('删除关注关系成功，影响行数:', result.affectedRows);
        }
        
        // 更新用户的following和fans字段
        connection.query(
            "UPDATE user SET following = TRIM(BOTH ',' FROM REPLACE(CONCAT(',', IFNULL(following, ''), ','), CONCAT(',', ?, ','), ',')) WHERE id_user = ?",
            [following_id, follower_id],
            (err1) => {
                if (err1) {
                    console.error('更新following失败:', err1);
                } else {
                    console.log('更新following成功');
                }
                
                connection.query(
                    "UPDATE user SET fans = TRIM(BOTH ',' FROM REPLACE(CONCAT(',', IFNULL(fans, ''), ','), CONCAT(',', ?, ','), ',')) WHERE id_user = ?",
                    [follower_id, following_id],
                    (err2) => {
                        if (err2) {
                            console.error('更新fans失败:', err2);
                        } else {
                            console.log('更新fans成功');
                        }
                        
                        console.log('清理完成！');
                        connection.end();
                    }
                );
            }
        );
    });
}); 