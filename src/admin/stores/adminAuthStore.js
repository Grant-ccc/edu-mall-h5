// 管理员认证状态管理
// 使用 localStorage 持久化，支持真实 API 调用

import { passwordLogin, verifyCodeLogin, getAdminUserInfo, getMyPerms } from '../api/auth'

const ADMIN_AUTH_KEY = 'edu_mall_admin_auth'
const TOKEN_KEY = 'edu_mall_token'

// 获取初始状态
function getInitialState() {
  const authStr = localStorage.getItem(ADMIN_AUTH_KEY)
  try {
    const data = authStr ? JSON.parse(authStr) : null
    if (data && data.token && data.user) {
      return {
        token: data.token,
        user: data.user,
        perms: data.perms || [],
        roles: data.roles || []
      }
    }
  } catch (e) {
    // ignore
  }
  return {
    token: null,
    user: null,
    perms: [],
    roles: []
  }
}

let state = getInitialState()
const listeners = new Set()

function notify() {
  listeners.forEach(listener => listener(state))
}

function persist() {
  if (state.token && state.user) {
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(state))
    // 同时写入 C端 token key，供 request.js 读取
    localStorage.setItem(TOKEN_KEY, state.token)
  } else {
    localStorage.removeItem(ADMIN_AUTH_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }
}

export const adminAuthStore = {
  getState() {
    return state
  },

  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  // 是否已登录
  isLogin() {
    return !!state.token && !!state.user
  },

  // 获取当前管理员
  getUser() {
    return state.user
  },

  // 获取权限列表
  getPerms() {
    return state.perms
  },

  // 检查是否有某个权限
  hasPerm(permCode) {
    if (!this.isLogin()) return false
    if (state.roles.some(r => r.id === 1)) return true
    return state.perms.some(p => p.code === permCode)
  },

  // 密码登录
  async login(mobile, password) {
    try {
      const data = await passwordLogin(mobile, password)
      const adminUser = data.user_info?.user || data.user || data
      // 获取权限和角色信息
      let perms = []
      let roles = []
      try {
        const permData = await getMyPerms()
        perms = permData?.perms || permData?.list || []
        roles = permData?.roles || permData?.role_list || []
      } catch (e) {
        // 权限接口可能不存在
      }

      state = {
        token: data.token,
        user: adminUser,
        perms,
        roles
      }

      persist()
      notify()
      return { success: true, data: { token: data.token, user: adminUser } }
    } catch (error) {
      return { success: false, message: error.code ? (error.message || '登录失败') : '网络请求失败' }
    }
  },

  // 验证码登录
  async loginWithVerifyCode(mobile, verifyCode) {
    try {
      const data = await verifyCodeLogin(mobile, verifyCode)
      const adminUser = data.user_info?.user || data.user || data
      // 获取权限和角色信息
      let perms = []
      let roles = []
      try {
        const permData = await getMyPerms()
        perms = permData?.perms || permData?.list || []
        roles = permData?.roles || permData?.role_list || []
      } catch (e) {
        // 权限接口可能不存在
      }

      state = {
        token: data.token,
        user: adminUser,
        perms,
        roles
      }

      persist()
      notify()
      return { success: true, data: { token: data.token, user: adminUser } }
    } catch (error) {
      return { success: false, message: error.code ? (error.message || '登录失败') : '网络请求失败' }
    }
  },

  // 异步加载用户信息
  async fetchUserInfo() {
    try {
      const data = await getAdminUserInfo()
      if (data) {
        state = {
          ...state,
          user: data.user_info?.user || data.user || data
        }
        persist()
        notify()
      }
      return data
    } catch (error) {
      console.error('获取管理员信息失败:', error)
      return null
    }
  },

  // 登出
  logout() {
    state = {
      token: null,
      user: null,
      perms: [],
      roles: []
    }
    persist()
    notify()
  },

  // 更新管理员信息
  updateUser(userInfo) {
    state = {
      ...state,
      user: { ...state.user, ...userInfo }
    }
    persist()
    notify()
  }
}

export default adminAuthStore
