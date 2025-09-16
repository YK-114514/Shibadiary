-- 数据库性能优化脚本
-- 执行前请备份数据库

-- 1. 为帖子表添加索引
ALTER TABLE post_infom ADD INDEX idx_user_time (id_user, time DESC);
ALTER TABLE post_infom ADD INDEX idx_time (time DESC);
ALTER TABLE post_infom ADD INDEX idx_content (content(100));

-- 2. 为用户表添加索引
ALTER TABLE user ADD INDEX idx_name (name);
ALTER TABLE user ADD INDEX idx_following (following(100));

-- 3. 为评论表添加索引（如果存在）
-- ALTER TABLE comments ADD INDEX idx_post_time (post_id, time DESC);
-- ALTER TABLE comments ADD INDEX idx_user_time (user_id, time DESC);

-- 4. 为点赞表添加索引（如果存在）
-- ALTER TABLE likes ADD INDEX idx_post_user (post_id, user_id);
-- ALTER TABLE likes ADD INDEX idx_user_time (user_id, time DESC);

-- 5. 为消息表添加索引（如果存在）
-- ALTER TABLE messages ADD INDEX idx_sender_receiver (sender_id, receiver_id);
-- ALTER TABLE messages ADD INDEX idx_receiver_time (receiver_id, time DESC);

-- 6. 优化表结构
OPTIMIZE TABLE post_infom;
OPTIMIZE TABLE user;

-- 7. 分析表统计信息
ANALYZE TABLE post_infom;
ANALYZE TABLE user;

-- 8. 查看索引使用情况
SHOW INDEX FROM post_infom;
SHOW INDEX FROM user;

-- 9. 查看表状态
SHOW TABLE STATUS LIKE 'post_infom';
SHOW TABLE STATUS LIKE 'user'; 