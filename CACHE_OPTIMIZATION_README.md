# 缓存优化说明文档

## 问题描述
您的网页存在更新延迟问题：
- 发布新帖子后，网页需要5分钟才能显示
- 删除帖子后，网页需要5分钟才能更新
- 其他操作（评论、点赞等）也存在类似延迟

## 根本原因
1. **缺少缓存失效机制**：数据变更后，相关缓存没有被清理
2. **缓存时间过长**：首页帖子列表缓存时间过长
3. **没有主动缓存管理**：POST/DELETE操作后没有清理相关缓存

## 解决方案

### 1. 新增缓存管理器 (`cache-manager.js`)
- 提供智能缓存清理功能
- 支持按模式清理缓存
- 支持清理特定用户缓存

### 2. 优化缓存配置 (`cache-config.js`)
- 首页帖子列表：从30秒减少到10秒
- 热门帖子列表：从60秒减少到30秒
- 帖子详情：从10分钟减少到5分钟
- 评论和点赞：大幅减少缓存时间

### 3. 在数据变更后自动清理缓存
- **发布新帖子**：自动清理所有帖子相关缓存
- **删除帖子**：自动清理所有帖子相关缓存
- **添加评论**：自动清理所有帖子相关缓存
- **删除评论**：自动清理所有帖子相关缓存
- **点赞操作**：自动清理所有帖子相关缓存

### 4. 新增缓存管理API

#### 清理缓存
```http
POST /api/posts/cache/clear
Authorization: Bearer <token>
Content-Type: application/json

{
    "pattern": "posts"  // 可选值: "all", "posts", "user"
}
```

#### 获取缓存统计
```http
GET /api/posts/cache/stats
Authorization: Bearer <token>
```

## 使用方法

### 自动缓存清理
现在您不需要手动操作，系统会在以下操作后自动清理相关缓存：
- 发布帖子
- 删除帖子
- 添加评论
- 删除评论
- 点赞/取消点赞

### 手动缓存清理（调试用）
如果需要手动清理缓存，可以使用以下API：

```javascript
// 清理所有缓存
fetch('/api/posts/cache/clear', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pattern: 'all' })
});

// 清理帖子相关缓存
fetch('/api/posts/cache/clear', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pattern: 'posts' })
});

// 清理当前用户缓存
fetch('/api/posts/cache/clear', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pattern: 'user' })
});
```

## 预期效果
- **发布新帖子**：网页将在10-30秒内更新
- **删除帖子**：网页将在10-30秒内更新
- **添加评论**：网页将在1分钟内更新
- **点赞操作**：网页将在30秒内更新

## 注意事项
1. 缓存时间减少会增加数据库查询频率
2. 如果服务器负载较高，可以适当增加缓存时间
3. 缓存清理操作会记录在服务器日志中
4. 建议在生产环境中监控缓存命中率

## 监控和调试
可以通过以下方式监控缓存状态：

```javascript
// 获取缓存统计信息
fetch('/api/posts/cache/stats', {
    headers: {
        'Authorization': 'Bearer ' + token
    }
});
```

响应示例：
```json
{
    "success": true,
    "data": {
        "totalEntries": 25,
        "memoryUsage": {
            "rss": 12345678,
            "heapTotal": 9876543,
            "heapUsed": 5432109
        },
        "timestamp": "2024-01-01T12:00:00.000Z"
    }
}
```

## 故障排除
如果缓存清理不生效：
1. 检查服务器日志中的缓存清理记录
2. 确认用户权限和token有效性
3. 检查缓存管理器是否正确导入
4. 重启服务器以清除内存缓存
