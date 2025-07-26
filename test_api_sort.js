const axios = require('axios');

async function testApiSort() {
    try {
        console.log('开始测试API排序...');
        
        // 测试最热模式API
        console.log('\n=== 测试最热模式API ===');
        const response = await axios.get('http://localhost:3000/api/posts/indexLike?page=1&limit=10');
        
        if (response.data && response.data.posts) {
            const posts = response.data.posts;
            console.log(`获取到 ${posts.length} 个帖子`);
            
            console.log('\n=== 排序结果 ===');
            posts.forEach((post, index) => {
                console.log(`${index + 1}. ID: ${post.id}, 点赞数: ${post.likeCount}, 时间: ${post.time}, 内容: ${post.content.substring(0, 20)}...`);
            });
            
            // 验证排序
            console.log('\n=== 验证排序 ===');
            let isValid = true;
            for (let i = 1; i < posts.length; i++) {
                const prevPost = posts[i - 1];
                const currentPost = posts[i];
                
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
                console.log('\n✅ API排序验证通过！');
            } else {
                console.log('\n❌ API排序验证失败！');
            }
            
            // 检查是否有相同点赞数的帖子
            const sameLikePosts = posts.filter((post, index) => {
                if (index === 0) return false;
                return post.likeCount === posts[index - 1].likeCount;
            });
            
            if (sameLikePosts.length > 0) {
                console.log('\n=== 相同点赞数的帖子 ===');
                sameLikePosts.forEach(post => {
                    console.log(`ID: ${post.id}, 点赞数: ${post.likeCount}, 时间: ${post.time}`);
                });
            }
            
        } else {
            console.log('❌ API响应格式错误');
        }
        
    } catch (error) {
        console.error('测试失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testApiSort(); 