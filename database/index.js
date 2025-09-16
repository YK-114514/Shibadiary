const mysql = require('mysql')

const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin123',
    database: 'user_db',
    port: 3306,
    // 优化连接池配置
    connectionLimit: 20,           // 增加连接池大小
    acquireTimeout: 60000,         // 获取连接超时时间
    timeout: 60000,                // 查询超时时间
    reconnect: true,               // 自动重连
    // 新增性能优化配置
    queueLimit: 0,                 // 队列限制（0表示无限制）
    waitForConnections: true,      // 等待连接
    // 连接池事件监听
    acquireTimeout: 60000,         // 获取连接超时
    // 查询优化
    multipleStatements: false,     // 禁用多语句查询（安全考虑）
    // 字符集设置
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci'
})

// 连接池事件监听
db.on('connection', (connection) => {
    console.log('[DB] 新数据库连接已建立');
    
    // 设置连接级别的配置
    connection.query('SET SESSION sql_mode = "STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO"');
    connection.query('SET SESSION innodb_lock_wait_timeout = 50');
    connection.query('SET SESSION wait_timeout = 28800');
    connection.query('SET SESSION interactive_timeout = 28800');
});

db.on('error', (err) => {
    console.error('[DB] 数据库连接池错误:', err);
});

// 健康检查函数
function checkDatabaseHealth() {
    db.query('SELECT 1', (err, result) => {
        if (err) {
            console.error('[DB] 数据库健康检查失败:', err);
        } else {
            console.log('[DB] 数据库连接正常');
        }
    });
}

// 定期健康检查（每5分钟）
setInterval(checkDatabaseHealth, 5 * 60 * 1000);

//console.log('[DB]', process.env.DB_HOST || '127.0.0.1', process.env.DB_NAME || 'user_db');

module.exports = db