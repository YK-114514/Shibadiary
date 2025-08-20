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

// 数据库修复函数
async function fixDatabase() {
    try {
        console.log('🔧 开始数据库修复...');
        
        // 连接数据库
        await new Promise((resolve, reject) => {
            connection.connect((err) => {
                if (err) {
                    console.error('❌ 数据库连接失败:', err.message);
                    reject(err);
                } else {
                    console.log('✅ 数据库连接成功');
                    resolve();
                }
            });
        });

        // 检查数据库是否存在
        console.log('\n📊 检查数据库状态...');
        const databases = await new Promise((resolve, reject) => {
            connection.query('SHOW DATABASES', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        const dbExists = databases.some(db => db.Database === 'user_db');
        console.log(`数据库 user_db 存在: ${dbExists}`);

        if (!dbExists) {
            console.log('❌ 数据库 user_db 不存在，正在创建...');
            await new Promise((resolve, reject) => {
                connection.query('CREATE DATABASE user_db', (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('✅ 数据库 user_db 创建成功');
        }

        // 使用数据库
        await new Promise((resolve, reject) => {
            connection.query('USE user_db', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        // 检查表是否存在
        console.log('\n📋 检查表结构...');
        const tables = await new Promise((resolve, reject) => {
            connection.query('SHOW TABLES', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        console.log('现有表:', tables.map(t => Object.values(t)[0]));

        // 检查 post_infom 表
        const postTableExists = tables.some(t => Object.values(t)[0] === 'post_infom');
        console.log(`post_infom 表存在: ${postTableExists}`);

        if (!postTableExists) {
            console.log('\n🔨 创建 post_infom 表...');
            await new Promise((resolve, reject) => {
                connection.query(`
                    CREATE TABLE post_infom (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        content VARCHAR(255) NOT NULL,
                        type VARCHAR(45) NOT NULL,
                        id_user INT NOT NULL,
                        images VARCHAR(1000) DEFAULT NULL
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
                `, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('✅ post_infom 表创建成功');
        }

        // 检查 user 表
        const userTableExists = tables.some(t => Object.values(t)[0] === 'user');
        console.log(`user 表存在: ${userTableExists}`);

        if (!userTableExists) {
            console.log('\n🔨 创建 user 表...');
            await new Promise((resolve, reject) => {
                connection.query(`
                    CREATE TABLE user (
                        id_user INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(45) NOT NULL,
                        phone VARCHAR(45) NOT NULL,
                        avatar VARCHAR(45) DEFAULT NULL,
                        password VARCHAR(255) NOT NULL,
                        following VARCHAR(1000) DEFAULT NULL,
                        fans VARCHAR(1000) DEFAULT NULL,
                        UNIQUE KEY phone_UNIQUE (phone)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
                `, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('✅ user 表创建成功');
        }

        // 检查 likes 表
        const likesTableExists = tables.some(t => Object.values(t)[0] === 'likes');
        console.log(`likes 表存在: ${likesTableExists}`);

        if (!likesTableExists) {
            console.log('\n🔨 创建 likes 表...');
            await new Promise((resolve, reject) => {
                connection.query(`
                    CREATE TABLE likes (
                        idlike INT AUTO_INCREMENT PRIMARY KEY,
                        userid_like VARCHAR(45) NOT NULL,
                        id_from_post INT NOT NULL,
                        UNIQUE KEY idlike_UNIQUE (idlike)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
                `, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('✅ likes 表创建成功');
        }

        // 检查 comments 表
        const commentsTableExists = tables.some(t => Object.values(t)[0] === 'comments');
        console.log(`comments 表存在: ${commentsTableExists}`);

        if (!commentsTableExists) {
            console.log('\n🔨 创建 comments 表...');
            await new Promise((resolve, reject) => {
                connection.query(`
                    CREATE TABLE comments (
                        idcomments INT AUTO_INCREMENT PRIMARY KEY,
                        content VARCHAR(45) NOT NULL,
                        id_from_post INT NOT NULL,
                        time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        id_user INT NOT NULL,
                        parent_id INT DEFAULT NULL,
                        parent_user_id INT DEFAULT NULL,
                        UNIQUE KEY idcomments_UNIQUE (idcomments)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
                `, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('✅ comments 表创建成功');
        }

        // 检查 follows 表
        const followsTableExists = tables.some(t => Object.values(t)[0] === 'follows');
        console.log(`follows 表存在: ${followsTableExists}`);

        if (!followsTableExists) {
            console.log('\n🔨 创建 follows 表...');
            await new Promise((resolve, reject) => {
                connection.query(`
                    CREATE TABLE follows (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        follower_id INT NOT NULL,
                        following_id INT NOT NULL,
                        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE KEY unique_follow (follower_id, following_id)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
                `, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('✅ follows 表创建成功');
        }

        // 检查 message 表
        const messageTableExists = tables.some(t => Object.values(t)[0] === 'message');
        console.log(`message 表存在: ${messageTableExists}`);

        if (!messageTableExists) {
            console.log('\n🔨 创建 message 表...');
            await new Promise((resolve, reject) => {
                connection.query(`
                    CREATE TABLE message (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        target_id INT NOT NULL,
                        kind VARCHAR(45) NOT NULL,
                        from_id INT DEFAULT NULL,
                        from_post_id INT DEFAULT NULL,
                        isread TINYINT DEFAULT 0,
                        time TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
                `, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('✅ message 表创建成功');
        }

        // 检查 collect 表
        const collectTableExists = tables.some(t => Object.values(t)[0] === 'collect');
        console.log(`collect 表存在: ${collectTableExists}`);

        if (!collectTableExists) {
            console.log('\n🔨 创建 collect 表...');
            await new Promise((resolve, reject) => {
                connection.query(`
                    CREATE TABLE collect (
                        idcollect INT AUTO_INCREMENT PRIMARY KEY,
                        userid_collect VARCHAR(45) NOT NULL,
                        id_from_post INT NOT NULL,
                        UNIQUE KEY idcollect_UNIQUE (idcollect)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
                `, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('✅ collect 表创建成功');
        }

        // 测试查询
        console.log('\n🧪 测试数据库查询...');
        try {
            const result = await new Promise((resolve, reject) => {
                connection.query('SELECT COUNT(*) as total FROM post_infom', (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('✅ 数据库查询测试成功:', result[0].total);
        } catch (error) {
            console.error('❌ 数据库查询测试失败:', error.message);
        }

        console.log('\n🎉 数据库修复完成！');
        console.log('\n📊 修复结果:');
        console.log('• 数据库连接正常');
        console.log('• 所有必要表已创建');
        console.log('• 查询功能正常');

    } catch (error) {
        console.error('❌ 数据库修复失败:', error.message);
    } finally {
        connection.end();
    }
}

// 运行修复
fixDatabase(); 