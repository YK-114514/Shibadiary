const mysql = require('mysql');

// 数据库连接配置
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'xiaochai'
});

async function testDatabaseSort() {
    try {
        console.log('开始测试数据库排序...');
        
        // 测试查询
        const sqlStr = `
            SELECT p.*, u.name, u.avatar,
                   (SELECT COUNT(*) FROM likes WHERE likes.id_from_post = p.id) as likeCount 
            FROM post_infom p
            LEFT JOIN user u ON p.id_user = u.id_user
            ORDER BY likeCount DESC, p.time DESC 
            LIMIT 10
        `;
        
        connection.query(sqlStr, (err, results) => {
            if (err) {
                console.error('查询失败:', err);
                return;
            }
            
            console.log(`查询到 ${results.length} 个帖子`);
            console.log('\n=== 排序结果 ===');
            
            results.forEach((post, index) => {
                console.log(`${index + 1}. ID: ${post.id}, 点赞数: ${post.likeCount}, 时间: ${post.time}, 内容: ${post.content.substring(0, 20)}...`);
            });
            
            // 验证排序
            console.log('\n=== 验证排序 ===');
            let isValid = true;
            for (let i = 1; i < results.length; i++) {
                const prevPost = results[i - 1];
                const currentPost = results[i];
                
                if (prevPost.likeCount < currentPost.likeCount) {
                    console.log(`❌ 点赞数排序错误: ${prevPost.likeCount} < ${currentPost.likeCount}`);
                    isValid = false;
                } else if (prevPost.likeCount === currentPost.likeCount) {
                    const prevTime = new Date(prevPost.time).getTime();
                    const currentTime = new Date(currentPost.time).getTime();
                    
                    if (prevTime < currentTime) {
                        console.log(`❌ 时间排序错误: ${prevPost.time} < ${currentPost.time}`);
                        isValid = false;
                    } else {
                        console.log(`✅ 点赞数相同(${currentPost.likeCount})，时间排序正确`);
                    }
                } else {
                    console.log(`✅ 点赞数排序正确: ${prevPost.likeCount} > ${currentPost.likeCount}`);
                }
            }
            
            if (isValid) {
                console.log('\n✅ 数据库排序验证通过！');
            } else {
                console.log('\n❌ 数据库排序验证失败！');
            }
            
            connection.end();
        });
        
    } catch (error) {
        console.error('测试失败:', error);
        connection.end();
    }
}

testDatabaseSort(); 