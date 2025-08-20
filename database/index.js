const mysql = require('mysql')

const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin123',
    database: 'user_db',
    port: 3306,
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
})
//console.log('[DB]', process.env.DB_HOST || '127.0.0.1', process.env.DB_NAME || 'user_db');


module.exports = db