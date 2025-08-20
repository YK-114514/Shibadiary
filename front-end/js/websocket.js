// WebSocket 管理器
class WebSocketManager {
    constructor() {
        this.socket = null;
        this.userId = null;
        this.isConnected = false;
        this.eventListeners = {};
    }

    // 连接到 WebSocket 服务器
    connect(userId) {
        if (this.isConnected) {
            console.log('WebSocket 已经连接');
            return;
        }

        this.userId = userId;
        
        // 连接到 Socket.IO 服务器
        this.socket = io();
        
        // 连接成功事件
        this.socket.on('connect', () => {
            console.log('WebSocket 连接成功');
            this.isConnected = true;
            
            // 通知服务器用户已登录
            this.socket.emit('userLogin', userId);
        });

        // 连接断开事件
        this.socket.on('disconnect', () => {
            console.log('WebSocket 连接断开');
            this.isConnected = false;
        });

        // 连接错误事件
        this.socket.on('connect_error', (error) => {
            console.error('WebSocket 连接错误:', error);
            this.isConnected = false;
        });

        // 监听各种实时事件
        this.setupEventListeners();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 监听点赞数变化
        this.socket.on('likeCountChanged', (data) => {
            this.emit('likeCountChanged', data);
        });

        // 监听收到评论通知
        this.socket.on('commentReceived', (data) => {
            this.emit('commentReceived', data);
        });

        // 监听收到点赞通知
        this.socket.on('likeReceived', (data) => {
            this.emit('likeReceived', data);
        });

        // 监听收到关注通知
        this.socket.on('followReceived', (data) => {
            this.emit('followReceived', data);
        });

        // 监听收到新帖子通知
        this.socket.on('postReceived', (data) => {
            this.emit('postReceived', data);
        });

        // 监听用户上线通知
        this.socket.on('userOnline', (data) => {
            this.emit('userOnline', data);
        });

        // 监听消息通知
        this.socket.on('messageReceived', (data) => {
            this.emit('messageReceived', data);
        });
    }

    // 断开连接
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            console.log('WebSocket 已断开连接');
        }
    }

    // 发送消息
    sendMessage(targetUserId, message, type = 'text') {
        if (!this.isConnected) {
            console.error('WebSocket 未连接');
            return;
        }

        this.socket.emit('newMessage', {
            targetUserId,
            message,
            senderId: this.userId,
            type
        });
    }

    // 发送评论通知
    sendCommentNotification(postId, commentId, commenterId, commenterName, postOwnerId) {
        if (!this.isConnected) {
            console.error('WebSocket 未连接');
            return;
        }

        this.socket.emit('newComment', {
            postId,
            commentId,
            commenterId,
            commenterName,
            postOwnerId
        });
    }

    // 发送点赞通知
    sendLikeNotification(postId, likerId, likerName, postOwnerId, action) {
        if (!this.isConnected) {
            console.error('WebSocket 未连接');
            return;
        }

        this.socket.emit('newLike', {
            postId,
            likerId,
            likerName,
            postOwnerId,
            action
        });
    }

    // 发送关注通知
    sendFollowNotification(followerId, followerName, followingId, action) {
        if (!this.isConnected) {
            console.error('WebSocket 未连接');
            return;
        }

        this.socket.emit('newFollow', {
            followerId,
            followerName,
            followingId,
            action
        });
    }

    // 更新点赞数
    updateLikeCount(postId, likeCount, isLiked) {
        if (!this.isConnected) {
            console.error('WebSocket 未连接');
            return;
        }

        this.socket.emit('likeCountUpdate', {
            postId,
            likeCount,
            isLiked
        });
    }

    // 事件监听器管理
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    // 移除事件监听器
    off(event, callback) {
        if (this.eventListeners[event]) {
            const index = this.eventListeners[event].indexOf(callback);
            if (index > -1) {
                this.eventListeners[event].splice(index, 1);
            }
        }
    }

    // 触发事件
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`事件 ${event} 处理错误:`, error);
                }
            });
        }
    }

    // 获取连接状态
    getConnectionStatus() {
        return this.isConnected;
    }

    // 获取用户ID
    getUserId() {
        return this.userId;
    }
}

// 创建全局 WebSocket 管理器实例
const wsManager = new WebSocketManager();

// 导出到全局作用域
window.wsManager = wsManager; 