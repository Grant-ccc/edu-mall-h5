// 认证状态管理
// 演示版本 - 使用 localStorage 持久化

const TOKEN_KEY = 'edu_mall_token'
const USER_KEY = 'edu_mall_user'

// 获取初始状态
function getInitialState() {
  const token = localStorage.getItem(TOKEN_KEY)
  const userStr = localStorage.getItem(USER_KEY)
  let user = null
  try {
    user = userStr ? JSON.parse(userStr) : null
  } catch (e) {
    user = null
  }
  return {
    token,
    user,
    isLogin: !!token
  }
}

// 简单状态管理
let state = getInitialState()
const listeners = new Set()

function notify() {
  listeners.forEach(listener => listener(state))
}

export const authStore = {
  getState() {
    return state
  },

  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  // 登录
  login(token, user) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    state = { token, user, isLogin: true }
    notify()
  },

  // 登出
  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    state = { token: null, user: null, isLogin: false }
    notify()
  },

  // 获取 token
  getToken() {
    return state.token
  },

  // 是否已登录
  isLogin() {
    return state.isLogin
  }
}

export default authStore
