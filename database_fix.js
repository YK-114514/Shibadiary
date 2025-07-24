const mysql = require('mysql');

// 数据库配置
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: 'admin123',
    database: 'user_db',
    port: 3306
};

// 创建连接
const connection = mysql.createConnection(dbConfig);

console.log('开始修复数据库结构...');

// 连接数据库
connection.connect((err) => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    console.log('数据库连接成功');
    
    // 删除avatar列
    connection.query('ALTER TABLE post_infom DROP COLUMN IF EXISTS avatar', (err, result) => {
        if (err) {
            console.error('删除avatar列失败:', err.message);
        } else {
            console.log('✅ avatar列删除成功');
        }
        
        // 删除name列
        connection.query('ALTER TABLE post_infom DROP COLUMN IF EXISTS name', (err2, result2) => {
            if (err2) {
                console.error('删除name列失败:', err2.message);
            } else {
                console.log('✅ name列删除成功');
            }
            
            // 查看修改后的表结构
            connection.query('DESCRIBE post_infom', (err3, result3) => {
                if (err3) {
                    console.error('查看表结构失败:', err3.message);
                } else {
                    console.log('\n修改后的post_infom表结构:');
                    console.log(result3);
                }
                
                console.log('\n🎉 数据库结构修复完成！');
                connection.end();
                process.exit(0);
            });
        });
    });
}); 