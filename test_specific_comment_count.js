const axios = require('axios');

async function testSpecificCommentCount() {
    try {
        console.log('测试详情页评论数量显示功能...');
        
        // 测试获取帖子22的所有评论
        console.log('\n1. 测试获取帖子22的所有评论');
        const response = await axios.get('http://localhost:3000/api/posts/22/comments?limit=1000');
        console.log('响应状态:', response.status);
        
        if (typeof response.data === 'object' && response.data.comments) {
            const comments = response.data.comments;
            const totalCount = comments.length;
            const rootCount = comments.filter(c => !c.parent_id).length;
            const replyCount = comments.filter(c => c.parent_id).length;
            
            console.log('✅ 评论统计:');
            console.log(`总评论数: ${totalCount}`);
            console.log(`根评论数: ${rootCount}`);
            console.log(`回复数: ${replyCount}`);
            console.log(`根评论 + 回复 = ${rootCount + replyCount} (应该等于总评论数)`);
            
            if (totalCount === rootCount + replyCount) {
                console.log('✅ 评论数量计算正确！');
            } else {
                console.log('❌ 评论数量计算有误！');
            }
            
            // 显示评论详情
            console.log('\n评论详情:');
            comments.forEach((comment, index) => {
                const type = comment.parent_id ? '回复' : '根评论';
                console.log(`${index + 1}. ${comment.content} (${type})`);
            });
        }
        
        console.log('\n✅ 详情页评论数量测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testSpecificCommentCount(); 