/**
 * 性能监控脚本
 * 实时监控应用性能和数据库状态
 */

const http = require('http');
const mysql = require('mysql');
const os = require('os');

class PerformanceMonitor {
    constructor() {
        this.config = {
            appPort: 3000,
            dbConfig: {
                host: '127.0.0.1',
                user: 'root',
                password: 'admin123',
                database: 'user_db',
                port: 3306
            },
            monitoringInterval: 10000, // 10秒
            alertThresholds: {
                responseTime: 1000,    // 1秒
                memoryUsage: 80,       // 80%
                cpuUsage: 80,          // 80%
                dbConnections: 15      // 15个连接
            }
        };
        
        this.stats = {
            startTime: Date.now(),
            requests: 0,
            errors: 0,
            avgResponseTime: 0,
            memoryUsage: [],
            cpuUsage: [],
            dbConnections: []
        };
        
        this.init();
    }

    init() {
        console.log('🚀 性能监控器启动中...');
        
        // 启动监控
        this.startMonitoring();
        
        // 启动HTTP服务器用于查看监控数据
        this.startMonitoringServer();
        
        console.log('✅ 性能监控器启动完成');
        console.log(`📊 监控数据访问地址: http://localhost:3001/monitor`);
    }

    /**
     * 开始监控
     */
    startMonitoring() {
        setInterval(() => {
            this.collectSystemMetrics();
            this.checkDatabaseHealth();
            this.checkApplicationHealth();
            this.generateReport();
        }, this.config.monitoringInterval);
    }

    /**
     * 收集系统指标
     */
    collectSystemMetrics() {
        const now = Date.now();
        
        // 内存使用率
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const memoryUsage = ((totalMem - freeMem) / totalMem * 100).toFixed(2);
        this.stats.memoryUsage.push({ timestamp: now, value: parseFloat(memoryUsage) });
        
        // 保持最近100个数据点
        if (this.stats.memoryUsage.length > 100) {
            this.stats.memoryUsage.shift();
        }
        
        // CPU使用率（简化计算）
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;
        
        cpus.forEach(cpu => {
            for (let type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });
        
        const idle = totalIdle / cpus.length;
        const total = totalTick / cpus.length;
        const cpuUsage = (100 - (100 * idle / total)).toFixed(2);
        this.stats.cpuUsage.push({ timestamp: now, value: parseFloat(cpuUsage) });
        
        if (this.stats.cpuUsage.length > 100) {
            this.stats.cpuUsage.shift();
        }
        
        // 检查阈值并发出警告
        this.checkThresholds('memory', memoryUsage);
        this.checkThresholds('cpu', cpuUsage);
    }

    /**
     * 检查数据库健康状态
     */
    async checkDatabaseHealth() {
        try {
            const connection = mysql.createConnection(this.config.dbConfig);
            
            // 检查连接数
            const [connectionsResult] = await this.query(connection, 'SHOW STATUS LIKE "Threads_connected"');
            const activeConnections = parseInt(connectionsResult.Value);
            this.stats.dbConnections.push({ 
                timestamp: Date.now(), 
                value: activeConnections 
            });
            
            if (this.stats.dbConnections.length > 100) {
                this.stats.dbConnections.shift();
            }
            
            // 检查慢查询
            const [slowQueriesResult] = await this.query(connection, 'SHOW STATUS LIKE "Slow_queries"');
            const slowQueries = parseInt(slowQueriesResult.Value);
            
            // 检查查询缓存命中率
            const [qcacheHitsResult] = await this.query(connection, 'SHOW STATUS LIKE "Qcache_hits"');
            const [qcacheInsertsResult] = await this.query(connection, 'SHOW STATUS LIKE "Qcache_inserts"');
            
            const hits = parseInt(qcacheHitsResult.Value);
            const inserts = parseInt(qcacheInsertsResult.Value);
            const hitRate = inserts > 0 ? (hits / (hits + inserts) * 100).toFixed(2) : 0;
            
            // 检查阈值
            this.checkThresholds('dbConnections', activeConnections);
            
            if (slowQueries > 0) {
                console.warn(`⚠️ 数据库慢查询警告: ${slowQueries} 个慢查询`);
            }
            
            if (hitRate < 50) {
                console.warn(`⚠️ 数据库查询缓存命中率过低: ${hitRate}%`);
            }
            
            connection.end();
            
        } catch (error) {
            console.error('❌ 数据库健康检查失败:', error.message);
        }
    }

    /**
     * 检查应用健康状态
     */
    checkApplicationHealth() {
        const startTime = Date.now();
        
        const options = {
            hostname: 'localhost',
            port: this.config.appPort,
            path: '/',
            method: 'GET',
            timeout: 5000
        };
        
        const req = http.request(options, (res) => {
            const responseTime = Date.now() - startTime;
            this.stats.requests++;
            this.stats.avgResponseTime = (
                (this.stats.avgResponseTime * (this.stats.requests - 1) + responseTime) / 
                this.stats.requests
            );
            
            // 检查响应时间阈值
            this.checkThresholds('responseTime', responseTime);
            
            if (res.statusCode !== 200) {
                this.stats.errors++;
                console.warn(`⚠️ 应用响应异常: HTTP ${res.statusCode}`);
            }
        });
        
        req.on('error', (error) => {
            this.stats.errors++;
            console.error('❌ 应用健康检查失败:', error.message);
        });
        
        req.on('timeout', () => {
            req.destroy();
            this.stats.errors++;
            console.error('❌ 应用健康检查超时');
        });
        
        req.end();
    }

    /**
     * 检查阈值并发出警告
     */
    checkThresholds(type, value) {
        const threshold = this.config.alertThresholds[type];
        if (threshold && value > threshold) {
            console.warn(`⚠️ ${type} 超过阈值: ${value} > ${threshold}`);
        }
    }

    /**
     * 生成监控报告
     */
    generateReport() {
        const uptime = Date.now() - this.stats.startTime;
        const uptimeHours = (uptime / (1000 * 60 * 60)).toFixed(2);
        
        console.log('\n📊 性能监控报告');
        console.log(`⏰ 运行时间: ${uptimeHours} 小时`);
        console.log(`📈 总请求数: ${this.stats.requests}`);
        console.log(`❌ 错误数: ${this.stats.errors}`);
        console.log(`⚡ 平均响应时间: ${this.stats.avgResponseTime.toFixed(2)}ms`);
        
        if (this.stats.memoryUsage.length > 0) {
            const latestMemory = this.stats.memoryUsage[this.stats.memoryUsage.length - 1];
            console.log(`💾 内存使用率: ${latestMemory.value}%`);
        }
        
        if (this.stats.cpuUsage.length > 0) {
            const latestCPU = this.stats.cpuUsage[this.stats.cpuUsage.length - 1];
            console.log(`🖥️ CPU使用率: ${latestCPU.value}%`);
        }
        
        if (this.stats.dbConnections.length > 0) {
            const latestConnections = this.stats.dbConnections[this.stats.dbConnections.length - 1];
            console.log(`🗄️ 数据库连接数: ${latestConnections.value}`);
        }
        
        console.log('─'.repeat(50));
    }

    /**
     * 启动监控服务器
     */
    startMonitoringServer() {
        const server = http.createServer((req, res) => {
            if (req.url === '/monitor') {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(this.generateHTMLReport());
            } else if (req.url === '/api/stats') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(this.stats, null, 2));
            } else {
                res.writeHead(404);
                res.end('Not Found');
            }
        });
        
        server.listen(3001, () => {
            console.log('📡 监控服务器运行在端口 3001');
        });
    }

    /**
     * 生成HTML报告
     */
    generateHTMLReport() {
        const uptime = Date.now() - this.stats.startTime;
        const uptimeHours = (uptime / (1000 * 60 * 60)).toFixed(2);
        
        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>小柴日记 - 性能监控</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .stat-card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2em; font-weight: bold; color: #2196F3; }
        .stat-label { color: #666; margin-top: 5px; }
        .chart-container { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .refresh-btn { background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        .refresh-btn:hover { background: #1976D2; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 小柴日记性能监控</h1>
            <p>实时监控应用性能和系统资源使用情况</p>
            <button class="refresh-btn" onclick="location.reload()">🔄 刷新数据</button>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${uptimeHours}h</div>
                <div class="stat-label">运行时间</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${this.stats.requests}</div>
                <div class="stat-label">总请求数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${this.stats.errors}</div>
                <div class="stat-label">错误数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${this.stats.avgResponseTime.toFixed(2)}ms</div>
                <div class="stat-label">平均响应时间</div>
            </div>
        </div>
        
        <div class="chart-container">
            <h3>📊 实时监控数据</h3>
            <p>数据每10秒自动更新一次</p>
            <div id="charts"></div>
        </div>
    </div>
    
    <script>
        // 自动刷新数据
        setInterval(() => {
            fetch('/api/stats')
                .then(response => response.json())
                .then(data => {
                    console.log('监控数据已更新:', data);
                })
                .catch(error => console.error('获取监控数据失败:', error));
        }, 10000);
    </script>
</body>
</html>
        `;
    }

    /**
     * 执行数据库查询
     */
    query(connection, sql) {
        return new Promise((resolve, reject) => {
            connection.query(sql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }
}

// 启动监控器
const monitor = new PerformanceMonitor();

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭性能监控器...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 正在关闭性能监控器...');
    process.exit(0);
});
