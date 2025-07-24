const mysql = require('mysql');
const fs = require('fs');

// 数据库配置
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: 'admin123',
    database: 'user_db'
};

// 创建连接
const connection = mysql.createConnection(dbConfig);

// 执行SQL命令
async function executeSQL() {
    try {
        console.log('正在连接数据库...');
        await new Promise((resolve, reject) => {
            connection.connect((err) => {
                if (err) {
                    console.error('数据库连接失败:', err);
                    reject(err);
                } else {
                    console.log('数据库连接成功');
                    resolve();
                }
            });
        });

        // 检查当前表结构
        console.log('\n检查当前post_infom表结构...');
        const structure = await new Promise((resolve, reject) => {
            connection.query('DESCRIBE post_infom', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('当前表结构:', structure);

        // 检查是否存在avatar和name列
        const hasAvatar = structure.some(col => col.Field === 'avatar');
        const hasName = structure.some(col => col.Field === 'name');

        console.log(`\n检查结果:`);
        console.log(`- avatar列存在: ${hasAvatar}`);
        console.log(`- name列存在: ${hasName}`);

        if (!hasAvatar && !hasName) {
            console.log('\navatar和name列都不存在，无需删除');
            return;
        }

        // 删除avatar列
        if (hasAvatar) {
            console.log('\n删除avatar列...');
            try {
                await new Promise((resolve, reject) => {
                    connection.query('ALTER TABLE post_infom DROP COLUMN avatar', (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                console.log('✅ avatar列删除成功');
            } catch (error) {
                console.error('❌ 删除avatar列失败:', error.message);
            }
        }

        // 删除name列
        if (hasName) {
            console.log('\n删除name列...');
            try {
                await new Promise((resolve, reject) => {
                    connection.query('ALTER TABLE post_infom DROP COLUMN name', (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                console.log('✅ name列删除成功');
            } catch (error) {
                console.error('❌ 删除name列失败:', error.message);
            }
        }

        // 再次检查表结构
        console.log('\n删除后的post_infom表结构:');
        const newStructure = await new Promise((resolve, reject) => {
            connection.query('DESCRIBE post_infom', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log(newStructure);

        console.log('\n🎉 列删除完成！');

    } catch (error) {
        console.error('操作失败:', error.message);
    } finally {
        connection.end();
    }
}

// 执行删除操作
executeSQL(); 