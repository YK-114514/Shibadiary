// 测试排序方向

function testSortDirection() {
    console.log('开始测试排序方向...');
    
    // 模拟帖子数据
    const mockPosts = [
        { id: 1, likeCount: 5, time: '2024-01-15 10:00:00', content: '帖子1' },
        { id: 2, likeCount: 5, time: '2024-01-15 09:00:00', content: '帖子2' },
        { id: 3, likeCount: 3, time: '2024-01-15 11:00:00', content: '帖子3' },
        { id: 4, likeCount: 7, time: '2024-01-15 08:00:00', content: '帖子4' },
        { id: 5, likeCount: 7, time: '2024-01-15 12:00:00', content: '帖子5' }
    ];
    
    console.log('\n=== 原始数据 ===');
    mockPosts.forEach((post, index) => {
        console.log(`帖子${index + 1}: ID=${post.id}, 点赞数=${post.likeCount}, 时间=${post.time}`);
    });
    
    // 当前排序（降序）
    console.log('\n=== 当前排序（点赞数降序，时间降序） ===');
    const currentSort = [...mockPosts].sort((a, b) => {
        if (b.likeCount !== a.likeCount) {
            return b.likeCount - a.likeCount;
        }
        return new Date(b.time) - new Date(a.time);
    });
    
    currentSort.forEach((post, index) => {
        console.log(`第${index + 1}名: ID=${post.id}, 点赞数=${post.likeCount}, 时间=${post.time}`);
    });
    
    // 时间升序排序
    console.log('\n=== 时间升序排序（点赞数相同时，旧帖子在前） ===');
    const timeAscSort = [...mockPosts].sort((a, b) => {
        if (b.likeCount !== a.likeCount) {
            return b.likeCount - a.likeCount;
        }
        return new Date(a.time) - new Date(b.time); // 升序
    });
    
    timeAscSort.forEach((post, index) => {
        console.log(`第${index + 1}名: ID=${post.id}, 点赞数=${post.likeCount}, 时间=${post.time}`);
    });
    
    console.log('\n=== 排序对比 ===');
    console.log('当前排序（时间降序）：点赞数相同时，新帖子排在前面');
    console.log('时间升序排序：点赞数相同时，旧帖子排在前面');
    
    console.log('\n请确认您希望的是哪种排序方式：');
    console.log('1. 时间降序（新帖子在前）- 当前实现');
    console.log('2. 时间升序（旧帖子在前）- 需要修改');
}

testSortDirection(); 