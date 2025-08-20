/**
 * 缓存配置文件
 * 可以根据需要调整缓存策略
 */

module.exports = {
    // 缓存策略配置
    strategies: {
        // 帖子相关接口
        posts: {
            // 首页帖子列表 - 频繁更新，短缓存
            '/api/posts/index': { 
                maxAge: 300,           // 5分钟缓存
                staleWhileRevalidate: 600,  // 10分钟stale
                description: '首页帖子列表'
            },
            
            // 热门帖子列表 - 相对稳定，中等缓存
            '/api/posts/indexLike': { 
                maxAge: 600,           // 10分钟缓存
                staleWhileRevalidate: 1200, // 20分钟stale
                description: '热门帖子列表'
            },
            
            // 搜索接口 - 查询频繁，短缓存
            '/api/posts/search': { 
                maxAge: 180,           // 3分钟缓存
                staleWhileRevalidate: 300,  // 5分钟stale
                description: '帖子搜索'
            },
            
            // 单个帖子详情 - 相对稳定，长缓存
            '/api/posts/:postId': { 
                maxAge: 600,           // 10分钟缓存
                staleWhileRevalidate: 1200, // 20分钟stale
                description: '帖子详情'
            },
            
            // 帖子评论 - 频繁更新，短缓存
            '/api/posts/:postId/comments': { 
                maxAge: 180,           // 3分钟缓存
                staleWhileRevalidate: 300,  // 5分钟stale
                description: '帖子评论'
            },
            
            // 点赞状态 - 频繁更新，很短缓存
            '/api/posts/like/:postId': { 
                maxAge: 60,            // 1分钟缓存
                staleWhileRevalidate: 120,  // 2分钟stale
                description: '点赞状态'
            }
        },
        
        // 用户相关接口
        accounts: {
            // 用户基本信息 - 相对稳定，长缓存
            '/api/accounts/:userId/accounts': { 
                maxAge: 600,           // 10分钟缓存
                staleWhileRevalidate: 1200, // 20分钟stale
                description: '用户基本信息'
            },
            
            // 关注状态检查 - 中等更新频率
            '/api/accounts/check-follow': { 
                maxAge: 300,           // 5分钟缓存
                staleWhileRevalidate: 600,  // 10分钟stale
                description: '关注状态检查'
            },
            
            // 关注列表 - 相对稳定，长缓存
            '/api/accounts/following/:userId': { 
                maxAge: 600,           // 10分钟缓存
                staleWhileRevalidate: 1200, // 20分钟stale
                description: '关注列表'
            }
        },
        
        // 个人资料接口
        personal: {
            '/api/personal/personal': { 
                maxAge: 300,           // 5分钟缓存
                staleWhileRevalidate: 600,  // 10分钟stale
                description: '个人资料'
            }
        },
        
        // 消息接口
        message: {
            '/api/message': { 
                maxAge: 60,            // 1分钟缓存
                staleWhileRevalidate: 120,  // 2分钟stale
                description: '消息列表'
            }
        }
    },
    
    // 全局缓存配置
    global: {
        // 默认缓存策略
        default: { 
            maxAge: 300,              // 5分钟缓存
            staleWhileRevalidate: 600,      // 10分钟stale
            description: '默认缓存策略'
        },
        
        // 缓存清理间隔（毫秒）
        cleanupInterval: 60000,       // 1分钟
        
        // 最大缓存条目数
        maxEntries: 1000,
        
        // 是否启用调试日志
        debug: process.env.NODE_ENV === 'development',
        
        // 缓存键前缀
        keyPrefix: 'swr_cache:',
        
        // 是否启用压缩
        enableCompression: true
    },
    
    // 环境特定配置
    environments: {
        development: {
            debug: true,
            maxAge: 60,               // 开发环境使用更短的缓存时间
            staleWhileRevalidate: 120
        },
        
        production: {
            debug: false,
            maxAge: 300,              // 生产环境使用标准缓存时间
            staleWhileRevalidate: 600
        },
        
        test: {
            debug: true,
            maxAge: 10,               // 测试环境使用最短缓存时间
            staleWhileRevalidate: 20
        }
    }
}; 