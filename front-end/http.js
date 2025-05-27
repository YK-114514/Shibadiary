//import axios from 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js'

// 创建遮罩层元素和加载动画
let overlayElement;
let loadingElement;

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
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
                // 按顺序清理存储的数据
                try {
                    localStorage.removeItem('eleToken');
                    console.log('Token已清除');
                    
                    sessionStorage.removeItem('user_data');
                    console.log('用户数据已清除');
                    
                   
                    
                    return Promise.reject('登录已过期，请重新登录');
                } catch (e) {
                    console.error('清理存储时出错:', e);
                }
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

  //export default request