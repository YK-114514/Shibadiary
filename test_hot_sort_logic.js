// 测试最热模式下的排序逻辑

function testHotSortLogic() {
    console.log('开始测试最热模式下的排序逻辑...');
    
    // 模拟帖子数据
    const mockPosts = [
        { id: 1, likeCount: 5, time: '2024-01-15 10:00:00', content: '帖子1' },
        { id: 2, likeCount: 5, time: '2024-01-15 09:00:00', content: '帖子2' },
        { id: 3, likeCount: 3, time: '2024-01-15 11:00:00', content: '帖子3' },
        { id: 4, likeCount: 7, time: '2024-01-15 08:00:00', content: '帖子4' },
        { id: 5, likeCount: 7, time: '2024-01-15 12:00:00', content: '帖子5' },
        { id: 6, likeCount: 2, time: '2024-01-15 13:00:00', content: '帖子6' }
    ];
    
    console.log('\n=== 原始数据 ===');
    mockPosts.forEach((post, index) => {
        console.log(`帖子${index + 1}: ID=${post.id}, 点赞数=${post.likeCount}, 时间=${post.time}`);
    });
    
    // 模拟修复前的排序（只按点赞数排序）
    console.log('\n=== 修复前排序（只按点赞数） ===');
    const beforeSort = [...mockPosts].sort((a, b) => b.likeCount - a.likeCount);
    beforeSort.forEach((post, index) => {
        console.log(`第${index + 1}名: ID=${post.id}, 点赞数=${post.likeCount}, 时间=${post.time}`);
    });
    
    // 模拟修复后的排序（按点赞数排序，相同时按时间降序）
    console.log('\n=== 修复后排序（点赞数相同时按时间降序） ===');
    const afterSort = [...mockPosts].sort((a, b) => {
        // 首先按点赞数降序排序
        if (b.likeCount !== a.likeCount) {
            return b.likeCount - a.likeCount;
        }
        // 点赞数相同时，按时间降序排序
        return new Date(b.time) - new Date(a.time);
    });
    
    afterSort.forEach((post, index) => {
        console.log(`第${index + 1}名: ID=${post.id}, 点赞数=${post.likeCount}, 时间=${post.time}`);
    });
    
    // 验证排序规则
    console.log('\n=== 验证排序规则 ===');
    let isValid = true;
    for (let i = 1; i < afterSort.length; i++) {
        const prevPost = afterSort[i - 1];
        const currentPost = afterSort[i];
        
        if (prevPost.likeCount < currentPost.likeCount) {
            console.log(`❌ 排序错误：帖子${prevPost.id}点赞数(${prevPost.likeCount}) < 帖子${currentPost.id}点赞数(${currentPost.likeCount})`);
            isValid = false;
        } else if (prevPost.likeCount === currentPost.likeCount) {
            // 点赞数相同时，检查时间排序
            const prevTime = new Date(prevPost.time).getTime();
            const currentTime = new Date(currentPost.time).getTime();
            
            if (prevTime < currentTime) {
                console.log(`❌ 时间排序错误：帖子${prevPost.id}时间(${prevPost.time}) < 帖子${currentPost.id}时间(${currentPost.time})`);
                isValid = false;
            } else {
                console.log(`✅ 点赞数相同(${currentPost.likeCount})，时间排序正确`);
            }
        } else {
            console.log(`✅ 点赞数排序正确：前一个(${prevPost.likeCount}) > 当前(${currentPost.likeCount})`);
        }
    }
    
    if (isValid) {
        console.log('\n✅ 排序规则验证通过！');
    } else {
        console.log('\n❌ 排序规则验证失败！');
    }
    
    // 显示修复效果对比
    console.log('\n=== 修复效果对比 ===');
    console.log('修复前：点赞数相同时，排序可能不稳定');
    console.log('修复后：点赞数相同时，按时间降序排序，确保排序稳定性');
    
    // 具体例子
    console.log('\n具体例子：');
    console.log('- 帖子4和帖子5都有7个点赞');
    console.log('- 帖子4时间：2024-01-15 08:00:00');
    console.log('- 帖子5时间：2024-01-15 12:00:00');
    console.log('- 修复后：帖子5（更新的）排在帖子4前面');
    
    console.log('\n✅ 测试完成！');
}

testHotSortLogic(); 