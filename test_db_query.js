const db = require('./database/index');

console.log('直接测试数据库查询...');

const searchKeyword = '%test%';
const sqlStr = `
    SELECT p.*, u.name, u.avatar 
    FROM post_infom p
    LEFT JOIN user u ON p.id_user = u.id_user
    WHERE (p.content LIKE ?) 
    ORDER BY p.time DESC
`;

console.log('SQL查询:', sqlStr);
console.log('查询参数:', [searchKeyword]);

db.query(sqlStr, [searchKeyword], (err, results) => {
    if (err) {
        console.error('❌ 数据库查询失败:', err.message);
        console.error('错误详情:', err);
    } else {
        console.log('✅ 数据库查询成功');
        console.log('结果数量:', results.length);
        console.log('结果:', results);
    }
    
    process.exit(0);
}); 