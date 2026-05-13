// 管理员认证状态管理
// 使用 localStorage 持久化

const ADMIN_AUTH_KEY = 'edu_mall_admin_auth'

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
  } else {
    localStorage.removeItem(ADMIN_AUTH_KEY)
  }
}

// Mock 管理员数据
const mockAdmins = [
  {
    id: 1,
    user_id: 1,
    name: 'admin',
    nick_name: '超级管理员',
    mobile: '13800000000',
    sex: 1,
    status: 1,
    roles: [{ id: 1, name: '超级管理员' }],
    perms: []
  },
  {
    id: 2,
    user_id: 2,
    name: 'operator',
    nick_name: '运营管理员',
    mobile: '13800000001',
    sex: 1,
    status: 1,
    roles: [{ id: 2, name: '运营' }],
    perms: []
  }
]

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
    // 超级管理员有所有权限
    if (state.roles.some(r => r.id === 1)) return true
    return state.perms.some(p => p.code === permCode)
  },

  // Mock 登录
  login(mobile, password) {
    // 演示模式：模拟登录验证
    const admin = mockAdmins.find(a => a.mobile === mobile)

    if (!admin) {
      return { success: false, message: '管理员不存在' }
    }

    if (admin.status !== 1) {
      return { success: false, message: '账号已被禁用' }
    }

    // 演示模式：任意密码都可登录
    state = {
      token: `admin_token_${Date.now()}`,
      user: admin,
      perms: admin.perms,
      roles: admin.roles
    }

    persist()
    notify()
    return { success: true, data: { token: state.token, user: admin } }
  },

  // 验证码登录
  loginWithVerifyCode(mobile, verifyCode) {
    // 演示模式：验证码 123456
    if (verifyCode !== '123456') {
      return { success: false, message: '验证码错误' }
    }

    const admin = mockAdmins.find(a => a.mobile === mobile)
    if (!admin) {
      return { success: false, message: '管理员不存在' }
    }

    if (admin.status !== 1) {
      return { success: false, message: '账号已被禁用' }
    }

    state = {
      token: `admin_token_${Date.now()}`,
      user: admin,
      perms: admin.perms,
      roles: admin.roles
    }

    persist()
    notify()
    return { success: true, data: { token: state.token, user: admin } }
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
