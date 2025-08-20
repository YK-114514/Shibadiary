-- 创建数据库
CREATE DATABASE IF NOT EXISTS user_db;
USE user_db;

-- 创建用户表
CREATE TABLE IF NOT EXISTS user (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) DEFAULT '/front-end/images/avatars/default.jpg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建帖子表
CREATE TABLE IF NOT EXISTS post_infom (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    images JSON,
    type VARCHAR(50) DEFAULT 'normal',
    id_user INT NOT NULL,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES user(id_user) ON DELETE CASCADE
);

-- 创建点赞表
CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES post_infom(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id_user) ON DELETE CASCADE,
    UNIQUE KEY unique_like (post_id, user_id)
);

-- 创建评论表
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES post_infom(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id_user) ON DELETE CASCADE
);

-- 创建关注表
CREATE TABLE IF NOT EXISTS follows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES user(id_user) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES user(id_user) ON DELETE CASCADE,
    UNIQUE KEY unique_follow (follower_id, following_id)
);

-- 创建消息表
CREATE TABLE IF NOT EXISTS message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    type ENUM('like', 'comment', 'follow', 'system') DEFAULT 'system',
    related_post_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES user(id_user) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES user(id_user) ON DELETE CASCADE,
    FOREIGN KEY (related_post_id) REFERENCES post_infom(id) ON DELETE SET NULL
);

-- 插入默认数据（可选）
INSERT INTO user (name, phone, password) VALUES 
('测试用户1', '13800138001', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- 密码: password
('测试用户2', '13800138002', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- 密码: password

-- 显示创建的表
SHOW TABLES; 