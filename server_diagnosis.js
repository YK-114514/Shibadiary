const http = require('http');
const https = require('https');
const dns = require('dns');

console.log('🔍 服务器连接诊断工具\n');

// 1. 基本连接测试
async function testBasicConnection() {
    console.log('📋 1. 基本连接测试');
    
    const testUrls = [
        'http://47.237.143.54',
        'http://47.237.143.54:80',
        'http://47.237.143.54:3000',
        'https://47.237.143.54',
        'https://47.237.143.54:443'
    ];
    
    for (const url of testUrls) {
        try {
            const result = await new Promise((resolve, reject) => {
                const protocol = url.startsWith('https') ? https : http;
                const urlObj = new URL(url);
                
                const req = protocol.request({
                    hostname: urlObj.hostname,
                    port: urlObj.port || (url.startsWith('https') ? 443 : 80),
                    path: urlObj.pathname,
                    method: 'HEAD',
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Cache-Control': 'no-cache'
                    }
                }, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    
                    res.on('end', () => {
                        resolve({
                            url: url,
                            statusCode: res.statusCode,
                            headers: res.headers,
                            contentLength: data.length,
                            server: res.headers.server || 'unknown'
                        });
                    });
                });
                
                req.on('error', (err) => {
                    reject(err);
                });
                
                req.on('timeout', () => {
                    req.destroy();
                    reject(new Error('Timeout'));
                });
                
                req.end();
            });
            
            console.log(`  ✅ ${url}: 状态码 ${result.statusCode}, 服务器 ${result.server}`);
            console.log(`     内容长度: ${result.contentLength} bytes`);
            console.log(`     Content-Type: ${result.headers['content-type'] || 'unknown'}`);
            
        } catch (error) {
            console.log(`  ❌ ${url}: ${error.message}`);
        }
    }
}

// 2. 详细HTTP响应测试
async function testDetailedResponse() {
    console.log('\n📋 2. 详细HTTP响应测试');
    
    try {
        const result = await new Promise((resolve, reject) => {
            const req = http.request({
                hostname: '47.237.143.54',
                port: 80,
                path: '/',
                method: 'GET',
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Cache-Control': 'no-cache'
                }
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        contentLength: data.length,
                        content: data.substring(0, 500) // 前500字符
                    });
                });
            });
            
            req.on('error', (err) => {
                reject(err);
            });
            
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
            
            req.end();
        });
        
        console.log(`  ✅ 状态码: ${result.statusCode}`);
        console.log(`  📦 内容长度: ${result.contentLength} bytes`);
        console.log(`  🖥️  服务器: ${result.headers.server || 'unknown'}`);
        console.log(`  📄 Content-Type: ${result.headers['content-type'] || 'unknown'}`);
        console.log(`  🔄 重定向: ${result.headers.location || '无'}`);
        console.log(`  📋 响应头:`);
        
        Object.entries(result.headers).forEach(([key, value]) => {
            console.log(`     ${key}: ${value}`);
        });
        
        if (result.contentLength > 0) {
            console.log(`  📝 内容预览:`);
            console.log(`     ${result.content.replace(/\n/g, '\\n')}`);
        }
        
    } catch (error) {
        console.error(`  ❌ 测试失败: ${error.message}`);
    }
}

// 3. 端口扫描
async function scanPorts() {
    console.log('\n📋 3. 端口扫描');
    
    const ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 3000, 3306, 5432, 8080, 8443];
    
    for (const port of ports) {
        try {
            const result = await new Promise((resolve, reject) => {
                const req = http.request({
                    hostname: '47.237.143.54',
                    port: port,
                    path: '/',
                    method: 'HEAD',
                    timeout: 3000
                }, (res) => {
                    resolve({ port, status: res.statusCode });
                });
                
                req.on('error', (err) => {
                    reject(err);
                });
                
                req.on('timeout', () => {
                    req.destroy();
                    reject(new Error('Timeout'));
                });
                
                req.end();
            });
            
            console.log(`  ✅ 端口 ${port}: 开放 (状态码: ${result.status})`);
        } catch (error) {
            console.log(`  ❌ 端口 ${port}: 关闭或过滤`);
        }
    }
}

// 4. 问题分析
function analyzeProblems() {
    console.log('\n📋 4. 问题分析');
    console.log('可能的问题:');
    console.log('');
    console.log('🌐 网络问题:');
    console.log('  - 防火墙阻止连接');
    console.log('  - 网络路由问题');
    console.log('  - DNS解析问题');
    console.log('');
    console.log('🖥️ 服务器问题:');
    console.log('  - 服务器宕机');
    console.log('  - 服务未启动');
    console.log('  - 端口配置错误');
    console.log('');
    console.log('⚙️ 配置问题:');
    console.log('  - Nginx配置错误');
    console.log('  - 反向代理配置问题');
    console.log('  - SSL证书问题');
    console.log('');
    console.log('🔒 安全问题:');
    console.log('  - 防火墙规则');
    console.log('  - 安全组设置');
    console.log('  - 访问控制列表');
}

// 5. 解决方案
function provideSolutions() {
    console.log('\n📋 5. 解决方案');
    console.log('');
    console.log('🔧 服务器端检查:');
    console.log('  1. 检查服务器状态: systemctl status nginx');
    console.log('  2. 检查端口监听: netstat -tlnp');
    console.log('  3. 检查防火墙: ufw status');
    console.log('  4. 检查服务日志: journalctl -u nginx');
    console.log('');
    console.log('🌐 网络检查:');
    console.log('  1. 检查DNS: nslookup 47.237.143.54');
    console.log('  2. 检查路由: traceroute 47.237.143.54');
    console.log('  3. 检查连通性: ping 47.237.143.54');
    console.log('');
    console.log('⚙️ 配置检查:');
    console.log('  1. 检查Nginx配置: nginx -t');
    console.log('  2. 检查SSL证书: openssl s_client -connect 47.237.143.54:443');
    console.log('  3. 检查PM2状态: pm2 status');
    console.log('');
    console.log('🔄 重启服务:');
    console.log('  1. 重启Nginx: systemctl restart nginx');
    console.log('  2. 重启PM2: pm2 restart all');
    console.log('  3. 重启服务器: reboot');
}

// 运行诊断
async function runDiagnosis() {
    await testBasicConnection();
    await testDetailedResponse();
    await scanPorts();
    analyzeProblems();
    provideSolutions();
    
    console.log('\n🎯 建议:');
    console.log('1. 首先检查服务器是否正常运行');
    console.log('2. 检查Nginx配置和状态');
    console.log('3. 检查防火墙和安全组设置');
    console.log('4. 检查PM2应用状态');
    console.log('5. 查看服务器日志');
}

// 运行诊断
runDiagnosis().catch(console.error); 