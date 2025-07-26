const axios = require('axios');

async function testHotSort() {
    try {
        console.log('开始测试最热模式下的排序修复...');
        
        // 测试API调用
        console.log('\n=== 测试最热排序API ===');
        const response = await axios.get('/api/posts/indexLike?page=1&limit=10');
        
        if (response.data && response.data.posts) {
            const posts = response.data.posts;
            console.log(`获取到 ${posts.length} 个帖子`);
            
            // 检查排序逻辑
            console.log('\n=== 检查排序逻辑 ===');
            for (let i = 0; i < posts.length; i++) {
                const post = posts[i];
                console.log(`帖子 ${i + 1}:`);
                console.log(`  - ID: ${post.id}`);
                console.log(`  - 点赞数: ${post.likeCount}`);
                console.log(`  - 发布时间: ${post.time}`);
                console.log(`  - 内容: ${post.content.substring(0, 50)}...`);
                
                // 检查与前一个帖子的排序关系
                if (i > 0) {
                    const prevPost = posts[i - 1];
                    const prevLikeCount = prevPost.likeCount;
                    const currentLikeCount = post.likeCount;
                    
                    if (prevLikeCount === currentLikeCount) {
                        console.log(`  ✅ 点赞数相同(${currentLikeCount})，检查时间排序...`);
                        const prevTime = new Date(prevPost.time).getTime();
                        const currentTime = new Date(post.time).getTime();
                        
                        if (prevTime >= currentTime) {
                            console.log(`  ✅ 时间排序正确：前一个帖子时间(${prevPost.time}) >= 当前帖子时间(${post.time})`);
                        } else {
                            console.log(`  ❌ 时间排序错误：前一个帖子时间(${prevPost.time}) < 当前帖子时间(${post.time})`);
                        }
                    } else {
                        console.log(`  ✅ 点赞数排序正确：前一个(${prevLikeCount}) > 当前(${currentLikeCount})`);
                    }
                }
                console.log('');
            }
            
            // 验证排序规则
            console.log('\n=== 验证排序规则 ===');
            let isValid = true;
            for (let i = 1; i < posts.length; i++) {
                const prevPost = posts[i - 1];
                const currentPost = posts[i];
                
                const prevLikeCount = prevPost.likeCount;
                const currentLikeCount = currentPost.likeCount;
                
                if (prevLikeCount < currentLikeCount) {
                    console.log(`❌ 排序错误：帖子${prevPost.id}点赞数(${prevLikeCount}) < 帖子${currentPost.id}点赞数(${currentLikeCount})`);
                    isValid = false;
                } else if (prevLikeCount === currentLikeCount) {
                    // 点赞数相同时，检查时间排序
                    const prevTime = new Date(prevPost.time).getTime();
                    const currentTime = new Date(currentPost.time).getTime();
                    
                    if (prevTime < currentTime) {
                        console.log(`❌ 时间排序错误：帖子${prevPost.id}时间(${prevPost.time}) < 帖子${currentPost.id}时间(${currentPost.time})`);
                        isValid = false;
                    }
                }
            }
            
            if (isValid) {
                console.log('✅ 排序规则验证通过！');
            } else {
                console.log('❌ 排序规则验证失败！');
            }
            
        } else {
            console.log('❌ API响应格式错误');
        }
        
    } catch (error) {
        console.error('测试失败:', error.message);
    }
}

testHotSort(); 