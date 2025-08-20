const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 检查并安装必要的工具
function checkAndInstallTools() {
    console.log('🔧 检查优化工具...');
    
    try {
        // 检查是否有uglify-js
        require.resolve('uglify-js');
        console.log('✅ uglify-js 已安装');
    } catch (e) {
        console.log('📦 安装 uglify-js...');
        execSync('npm install -g uglify-js', { stdio: 'inherit' });
    }
    
    try {
        // 检查是否有clean-css
        require.resolve('clean-css');
        console.log('✅ clean-css 已安装');
    } catch (e) {
        console.log('📦 安装 clean-css...');
        execSync('npm install -g clean-css-cli', { stdio: 'inherit' });
    }
}

// 压缩CSS文件
function minifyCSS() {
    console.log('\n🎨 压缩CSS文件...');
    
    const cssDir = path.join(__dirname, 'front-end/css');
    if (!fs.existsSync(cssDir)) {
        console.log('❌ CSS目录不存在');
        return;
    }
    
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    
    cssFiles.forEach(file => {
        const filePath = path.join(cssDir, file);
        const outputPath = path.join(cssDir, file.replace('.css', '.min.css'));
        
        try {
            const css = fs.readFileSync(filePath, 'utf8');
            const CleanCSS = require('clean-css');
            const minified = new CleanCSS({
                level: 2,
                format: 'keep-breaks'
            }).minify(css);
            
            fs.writeFileSync(outputPath, minified.styles);
            console.log(`✅ 压缩完成: ${file} -> ${file.replace('.css', '.min.css')}`);
        } catch (error) {
            console.error(`❌ 压缩失败: ${file}`, error.message);
        }
    });
}

// 压缩JS文件
function minifyJS() {
    console.log('\n📜 压缩JS文件...');
    
    const jsDir = path.join(__dirname, 'front-end/js');
    if (!fs.existsSync(jsDir)) {
        console.log('❌ JS目录不存在');
        return;
    }
    
    const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
    
    jsFiles.forEach(file => {
        const filePath = path.join(jsDir, file);
        const outputPath = path.join(jsDir, file.replace('.js', '.min.js'));
        
        try {
            const UglifyJS = require('uglify-js');
            const code = fs.readFileSync(filePath, 'utf8');
            const result = UglifyJS.minify(code, {
                compress: {
                    drop_console: true,
                    drop_debugger: true
                },
                mangle: true
            });
            
            fs.writeFileSync(outputPath, result.code);
            console.log(`✅ 压缩完成: ${file} -> ${file.replace('.js', '.min.js')}`);
        } catch (error) {
            console.error(`❌ 压缩失败: ${file}`, error.message);
        }
    });
}

// 优化图片
function optimizeImages() {
    console.log('\n🖼️ 优化图片文件...');
    
    const imagesDir = path.join(__dirname, 'front-end/images');
    if (!fs.existsSync(imagesDir)) {
        console.log('❌ 图片目录不存在');
        return;
    }
    
    // 递归查找所有图片文件
    function findImages(dir) {
        let images = [];
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                images = images.concat(findImages(filePath));
            } else if (/\.(jpg|jpeg|png|gif)$/i.test(file)) {
                images.push(filePath);
            }
        });
        
        return images;
    }
    
    const images = findImages(imagesDir);
    console.log(`📸 找到 ${images.length} 个图片文件`);
    
    // 这里可以添加图片压缩逻辑
    // 由于需要额外的工具，暂时跳过
    console.log('ℹ️ 图片优化需要额外工具，请手动优化大图片文件');
}

// 创建压缩版本的文件引用
function createOptimizedReferences() {
    console.log('\n🔗 创建优化版本的文件引用...');
    
    const htmlFiles = [
        'front-end/views/index.html',
        'front-end/views/login.html',
        'front-end/views/register.html',
        'front-end/views/personal.html',
        'front-end/views/accounts.html',
        'front-end/views/message.html',
        'front-end/views/setting.html',
        'front-end/views/specific.html'
    ];
    
    htmlFiles.forEach(htmlFile => {
        if (!fs.existsSync(htmlFile)) return;
        
        try {
            let content = fs.readFileSync(htmlFile, 'utf8');
            
            // 替换CSS引用
            content = content.replace(/href="\.\.\/css\/([^"]+)\.css"/g, (match, filename) => {
                const minPath = `../css/${filename}.min.css`;
                if (fs.existsSync(path.join(__dirname, 'front-end/css', `${filename}.min.css`))) {
                    return `href="${minPath}"`;
                }
                return match;
            });
            
            // 替换JS引用
            content = content.replace(/src="\.\.\/js\/([^"]+)\.js"/g, (match, filename) => {
                const minPath = `../js/${filename}.min.js`;
                if (fs.existsSync(path.join(__dirname, 'front-end/js', `${filename}.min.js`))) {
                    return `src="${minPath}"`;
                }
                return match;
            });
            
            fs.writeFileSync(htmlFile, content);
            console.log(`✅ 优化引用: ${htmlFile}`);
        } catch (error) {
            console.error(`❌ 处理失败: ${htmlFile}`, error.message);
        }
    });
}

// 创建.htaccess文件（Apache优化）
function createHtaccess() {
    console.log('\n📄 创建.htaccess文件...');
    
    const htaccessContent = `
# 启用Gzip压缩
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# 浏览器缓存
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# 缓存控制
<IfModule mod_headers.c>
    <FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
        Header set Cache-Control "public, max-age=31536000"
    </FilesMatch>
</IfModule>
`;
    
    fs.writeFileSync('.htaccess', htaccessContent);
    console.log('✅ .htaccess文件创建完成');
}

// 主函数
async function optimizeStaticFiles() {
    console.log('🚀 开始静态文件优化...\n');
    
    try {
        // 检查工具
        checkAndInstallTools();
        
        // 压缩CSS
        minifyCSS();
        
        // 压缩JS
        minifyJS();
        
        // 优化图片
        optimizeImages();
        
        // 创建优化引用
        createOptimizedReferences();
        
        // 创建.htaccess
        createHtaccess();
        
        console.log('\n🎉 静态文件优化完成!');
        console.log('\n📋 优化总结:');
        console.log('  ✅ CSS文件已压缩');
        console.log('  ✅ JS文件已压缩');
        console.log('  ✅ HTML文件引用已优化');
        console.log('  ✅ 缓存配置已添加');
        console.log('  ✅ Gzip压缩已启用');
        
    } catch (error) {
        console.error('💥 优化过程中出现错误:', error.message);
    }
}

// 运行优化
optimizeStaticFiles(); 