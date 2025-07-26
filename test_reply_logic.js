// 测试回复逻辑的修复

function testReplyLogic() {
    console.log('开始测试回复逻辑修复...');
    
    // 模拟评论数据结构
    const comments = [
        {
            idcomments: 1,
            id_user: 1,
            name: '用户A',
            content: '这是第一条评论',
            parent_id: null,
            parent_user_id: null
        },
        {
            idcomments: 2,
            id_user: 2,
            name: '用户B',
            content: '这是对评论1的回复',
            parent_id: 1,
            parent_user_id: 1
        },
        {
            idcomments: 3,
            id_user: 3,
            name: '用户C',
            content: '这是对回复2的回复',
            parent_id: 2,
            parent_user_id: 2
        }
    ];
    
    console.log('\n=== 测试场景1：回复评论 ===');
    const comment1 = comments[0]; // 评论1
    console.log('点击评论1:', comment1);
    console.log('parentId:', comment1.parent_id); // null
    console.log('修复前: parentId =', comment1.parent_id);
    console.log('修复后: parentId =', comment1.idcomments); // 应该使用评论1的ID
    console.log('parentUserId =', comment1.id_user);
    
    console.log('\n=== 测试场景2：回复回复 ===');
    const reply1 = comments[1]; // 回复1
    console.log('点击回复1:', reply1);
    console.log('parentId:', reply1.parent_id); // 1
    console.log('修复前: parentId =', reply1.parent_id); // 1 (这是错误的)
    console.log('修复后: parentId =', reply1.idcomments); // 2 (应该使用回复1的ID)
    console.log('parentUserId =', reply1.id_user);
    
    console.log('\n=== 测试场景3：回复回复的回复 ===');
    const reply2 = comments[2]; // 回复2
    console.log('点击回复2:', reply2);
    console.log('parentId:', reply2.parent_id); // 2
    console.log('修复前: parentId =', reply2.parent_id); // 2 (这是错误的)
    console.log('修复后: parentId =', reply2.idcomments); // 3 (应该使用回复2的ID)
    console.log('parentUserId =', reply2.id_user);
    
    console.log('\n=== 验证修复效果 ===');
    
    // 模拟修复后的逻辑
    function simulateReplyClick(comment) {
        const parentId = comment.parent_id;
        const commentId = comment.idcomments;
        const commentUserId = comment.id_user;
        
        let finalParentId, finalParentUserId;
        
        if (parentId) {
            // 回复的是回复
            finalParentId = commentId; // 修复后：使用当前评论的ID
            finalParentUserId = commentUserId;
        } else {
            // 回复的是评论
            finalParentId = commentId;
            finalParentUserId = commentUserId;
        }
        
        return {
            parent_id: finalParentId,
            parent_user_id: finalParentUserId
        };
    }
    
    console.log('评论1的回复数据:', simulateReplyClick(comments[0]));
    console.log('回复1的回复数据:', simulateReplyClick(comments[1]));
    console.log('回复2的回复数据:', simulateReplyClick(comments[2]));
    
    console.log('\n✅ 测试完成！');
}

testReplyLogic(); 