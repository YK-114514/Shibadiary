//import axios from 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js'

// 全局变量：记录上一次登录状态
let lastLoginStatus = false;
let hasShownTokenExpiredAlert = false; // 防止重复弹窗

// 创建遮罩层元素和加载动画
let overlayElement;
let loadingElement;

// 检查是否已登录
function isLoggedIn() {
    return !!localStorage.getItem('eleToken');
}

// 初始化登录状态
function initializeLoginStatus() {
    lastLoginStatus = isLoggedIn();
    hasShownTokenExpiredAlert = false;
}

// 处理token失效
function handleTokenExpired() {
    // 只有在"刚刚失效"时才弹窗
    if (lastLoginStatus && !hasShownTokenExpiredAlert) {
        alert('token已失效，请重新登录');
        hasShownTokenExpiredAlert = true;
    }
    
    // 清理存储
    try {
        localStorage.removeItem('eleToken');
        console.log('Token已清除');
        
        sessionStorage.removeItem('user_data');
        localStorage.removeItem('user_data');
        console.log('用户数据已清除');
        
        // 更新登录状态
        lastLoginStatus = false;
        
        // 立即刷新页面，让所有地方都恢复到未登录状态
        window.location.reload();
    } catch (e) {
        console.error('清理存储时出错:', e);
        // 即使出错也要刷新页面
        window.location.reload();
    }
}

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 初始化登录状态
    initializeLoginStatus();
    
    // 创建遮罩层元素
    overlayElement = document.createElement('div');
    overlayElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    document.body.appendChild(overlayElement);

    // 创建加载动画元素
    loadingElement = document.createElement('div');
    loadingElement.className = 'spinner-border text-light';
    loadingElement.setAttribute('role', 'status');
    loadingElement.style.cssText = `
        width: 3rem;
        height: 3rem;
    `;
    loadingElement.innerHTML = '<span class="visually-hidden">Loading...</span>';

    // 将加载动画添加到遮罩层中
    overlayElement.appendChild(loadingElement);
});

// 加载动画控制
function startLoading() {
    if (overlayElement) {
        overlayElement.style.display = 'flex';
    }
}

function endLoading() {
    if (overlayElement) {
        overlayElement.style.display = 'none';
    }
}

// 请求拦截器
axios.interceptors.request.use(
    config => {
        startLoading();
        // 封装token
        if (localStorage.eleToken) {
            config.headers["Authorization"] = localStorage.eleToken;
        }
        return config;
    },
    error => {
        endLoading();
        return Promise.reject(error);
    }
);

// 响应拦截器
axios.interceptors.response.use(
    response => {
        endLoading();
        return response;
    },
    error => {
        endLoading();
        console.log('响应错误:', error);
        
        if (error.response) {
            const { status } = error.response;
            console.log('错误状态码:', status);
            
            // 处理401未授权错误
            if (status === 401) {
                console.log('Token失效，清理存储');
                handleTokenExpired();
                return Promise.reject('登录已过期，请重新登录');
            }
            
            // 处理其他错误
            return Promise.reject(error.response.data || '请求失败');
        }
        
        return Promise.reject(error);
    }
);

// 封装request主体
function request(config) {
    return axios(config);
  }
  
  // 封装request.post方法
  request.post = function(url, data = {}, config = {}) {
    return request({
      url,
      method: 'post',
      data,
      ...config
    });
  };
  
  // 封装request.get方法
  request.get = function(url, params = {}, config = {}) {
    return request({
      url,
      method: 'get',
      params,
      ...config
    });
  };

  // 登录成功时调用
  function loginSuccess() {
    lastLoginStatus = true;
    hasShownTokenExpiredAlert = false;
  }

  // 主动退出登录时调用
  function logout() {
    if (lastLoginStatus) {
      alert('token已失效，请重新登录');
    }
    handleTokenExpired();
  }

  // 暴露给全局使用
  window.loginSuccess = loginSuccess;
  window.logout = logout;
  window.handleTokenExpired = handleTokenExpired;

  //export default request