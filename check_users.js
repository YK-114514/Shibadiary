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
    
    // 查询所有用户
    connection.query('SELECT id_user, name, phone FROM user', (err, result) => {
        if (err) {
            console.error('查询失败:', err);
        } else {
            console.log('用户列表:');
            result.forEach(user => {
                console.log(`ID: ${user.id_user}, 姓名: ${user.name}, 手机: ${user.phone}`);
            });
        }
        
        connection.end();
    });
}); 