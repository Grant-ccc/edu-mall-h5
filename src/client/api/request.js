// API 请求基础封装
// 基于 fetch，自动添加 token、处理响应、错误提示
// 支持 mock 模式（VITE_USE_MOCK=true 时启用）

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/mall'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// 获取存储的 token
function getToken() {
  return localStorage.getItem('edu_mall_token')
}

// 统一请求封装
async function request(url, options = {}) {
  const {
    method = 'GET',
    data = null,
    headers = {},
    showErrorMessage = true,
    skipAuth = false
  } = options

  // 构建完整 URL
  const fullUrl = `${API_BASE_URL}${url}`

  // 构建请求配置
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  }

  // 添加 token（白名单接口除外）
  if (!skipAuth) {
    const token = getToken()
    if (token) {
      config.headers['token'] = token
    }
  }

  // 构建最终请求 URL
  let requestUrl = fullUrl

  // GET 请求参数拼接到 URL
  if (method === 'GET' && data) {
    const params = new URLSearchParams()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value)
      }
    })
    const queryString = params.toString()
    if (queryString) {
      requestUrl = `${fullUrl}?${queryString}`
    }
  } else if (data) {
    config.body = JSON.stringify(data)
  }

  // === Mock 模式 ===
  if (USE_MOCK) {
    const { mockRequest } = await import('./mock')
    const result = await mockRequest(requestUrl, { method, body: config.body })
    return processResponse(result, showErrorMessage)
  }

  try {
    if (import.meta.env.DEV) {
      console.log(`[API] ${method} ${requestUrl}`, data || '')
    }

    const response = await fetch(requestUrl, config)
    const result = await response.json()

    if (import.meta.env.DEV) {
      console.log(`[API] Response:`, result)
    }

    return processResponse(result, showErrorMessage)
  } catch (error) {
    if (showErrorMessage && !error.code) {
      import('antd').then(({ message }) => {
        message.error('网络请求失败，请检查网络连接')
      })
    }
    throw error
  }
}

// 处理响应
function processResponse(result, showErrorMessage) {
  if (result.code !== 0 && result.code !== 200) {
    const error = new Error(result.msg || result.err_msg || '请求失败')
    error.code = result.code
    error.data = result

    if (showErrorMessage) {
      import('antd').then(({ message }) => {
        message.error(result.msg || result.err_msg || '请求失败')
      })
    }

    throw error
  }

  return result.data
}

// GET 请求
export function get(url, params = null, options = {}) {
  return request(url, {
    method: 'GET',
    data: params,
    ...options
  })
}

// POST 请求
export function post(url, data = null, options = {}) {
  return request(url, {
    method: 'POST',
    data,
    ...options
  })
}

// 导出基础方法
export { request, API_BASE_URL }

export default { get, post, request }
