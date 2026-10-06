// 引入 Axios 库
import axios from 'axios'

// 创建 axios 实例，统一配置基础路径和超时时间
const service = axios.create({
  // 基础路径：以后发请求就不用写 http://localhost:8080 了
  baseURL: 'http://localhost:8080', 
  // 超时时间：如果请求超过5秒还没响应，就自动断开
  timeout: 5000 
})

// ================= 请求拦截器 =================
// 作用：在发送请求前，自动把 Token 塞进请求头
service.interceptors.request.use(
  config => {
    // 1. 从浏览器的 localStorage 中获取之前存好的 token
    const token = localStorage.getItem('token')
    
    // 2. 如果 token 存在，就添加到请求头 Authorization 字段中
    if (token) {
      // 注意：Bearer 后面必须有一个空格！
      config.headers['Authorization'] = 'Bearer ' + token
    }
    // 3. 必须返回 config，否则请求发不出去
    return config
  },
  error => {
    // 请求发生错误时的处理
    return Promise.reject(error)
  }
)

// ================= 响应拦截器 =================
// 作用：简化后端返回的数据结构，统一处理错误
service.interceptors.response.use(
  response => {
    // 直接返回后端的 Result 对象（包含 code, msg, data）
    // 这样在页面里就不用每次都写 response.data 了
    return response.data
  },
  error => {
    // 响应发生错误时的处理（比如 404, 500, 网络断开）
    console.error('请求失败', error)
    return Promise.reject(error)
  }
)

// 导出封装好的 axios 实例，供其他组件使用
export default service