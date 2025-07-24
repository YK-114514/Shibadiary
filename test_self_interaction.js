const axios = require('axios');
const jwt = require('jsonwebtoken');

// 测试用户给自己点赞、收藏、评论时不会发送消息通知
async function testSelfInteraction() {
    try {
        console.log('开始测试用户给自己互动时不会发送消息通知...');
        
        // 首先登录获取token
        const loginResponse = await axios.post('http://localhost:3000/api/user/login', {
            phone: '19999999999', // 使用testAccount用户
            password: '12345678' // 正确的密码
        });
        
        console.log('登录成功:', loginResponse.data);
        const token = loginResponse.data.token;
        
        // 从JWT token中解析用户信息
        const tokenWithoutBearer = token.replace('Bearer ', '');
        const decoded = jwt.decode(tokenWithoutBearer);
        console.log('从token解析的用户信息:', decoded);
        
        const userData = {
            id_user: decoded.id_user,
            name: decoded.name,
            avatar: decoded.avatar
        };
        
        // 查找该用户发布的帖子
        console.log('\n查找用户发布的帖子...');
        const postsResponse = await axios.get('http://localhost:3000/api/posts/index');
        const posts = postsResponse.data;
        
        // 找到该用户发布的第一个帖子
        const userPost = posts.find(post => post.id_user === userData.id_user);
        
        if (!userPost) {
            console.log('该用户没有发布过帖子，无法测试');
            return;
        }
        
        console.log('找到用户帖子:', userPost);
        
        // 测试1：用户给自己点赞
        console.log('\n测试1：用户给自己点赞...');
        try {
            const likeResponse = await axios.post('http://localhost:3000/api/posts/addLike', {
                userid_like: userData.id_user,
                id_from_post: userPost.id
            }, {
                headers: {
                    'Authorization': token
                }
            });
            
            console.log('点赞响应:', likeResponse.data);
            
            // 检查是否发送了消息通知
            const messagesResponse = await axios.get('http://localhost:3000/api/message', {
                headers: {
                    'Authorization': token
                }
            });
            
            console.log('消息列表:', messagesResponse.data);
            
            // 查找是否有自己给自己点赞的消息
            const selfLikeMessage = messagesResponse.data.messages.find(msg => 
                msg.kind === 'like' && 
                msg.from_id === userData.id_user && 
                msg.from_post_id === userPost.id
            );
            
            if (selfLikeMessage) {
                console.log('❌ 发现用户给自己点赞的消息通知，这不应该发生');
            } else {
                console.log('✅ 用户给自己点赞时没有发送消息通知，符合预期');
            }
            
        } catch (error) {
            console.error('点赞测试失败:', error.response?.data || error.message);
        }
        
        // 测试2：用户给自己收藏
        console.log('\n测试2：用户给自己收藏...');
        try {
            const collectResponse = await axios.post('http://localhost:3000/api/posts/addCollect', {
                userid_collect: userData.id_user,
                id_from_post: userPost.id
            }, {
                headers: {
                    'Authorization': token
                }
            });
            
            console.log('收藏响应:', collectResponse.data);
            
            // 检查是否发送了消息通知
            const messagesResponse2 = await axios.get('http://localhost:3000/api/message', {
                headers: {
                    'Authorization': token
                }
            });
            
            console.log('消息列表:', messagesResponse2.data);
            
            // 查找是否有自己给自己收藏的消息
            const selfCollectMessage = messagesResponse2.data.messages.find(msg => 
                msg.kind === 'collect' && 
                msg.from_id === userData.id_user && 
                msg.from_post_id === userPost.id
            );
            
            if (selfCollectMessage) {
                console.log('❌ 发现用户给自己收藏的消息通知，这不应该发生');
            } else {
                console.log('✅ 用户给自己收藏时没有发送消息通知，符合预期');
            }
            
        } catch (error) {
            console.error('收藏测试失败:', error.response?.data || error.message);
        }
        
        // 测试3：用户给自己评论
        console.log('\n测试3：用户给自己评论...');
        try {
            const commentResponse = await axios.post('http://localhost:3000/api/posts/comments', {
                name: userData.name,
                content: '这是给自己的评论测试',
                avatar: userData.avatar,
                id_user: userData.id_user,
                id_from_post: userPost.id
            }, {
                headers: {
                    'Authorization': token
                }
            });
            
            console.log('评论响应:', commentResponse.data);
            
            // 检查是否发送了消息通知
            const messagesResponse3 = await axios.get('http://localhost:3000/api/message', {
                headers: {
                    'Authorization': token
                }
            });
            
            console.log('消息列表:', messagesResponse3.data);
            
            // 查找是否有自己给自己评论的消息
            const selfCommentMessage = messagesResponse3.data.messages.find(msg => 
                msg.kind === 'comment' && 
                msg.from_id === userData.id_user && 
                msg.from_post_id === userPost.id
            );
            
            if (selfCommentMessage) {
                console.log('❌ 发现用户给自己评论的消息通知，这不应该发生');
            } else {
                console.log('✅ 用户给自己评论时没有发送消息通知，符合预期');
            }
            
        } catch (error) {
            console.error('评论测试失败:', error.response?.data || error.message);
        }
        
        console.log('\n测试完成！');
        
    } catch (error) {
        console.error('测试失败:', error.response?.data || error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应头:', error.response.headers);
        }
    }
}

// 运行测试
testSelfInteraction(); 