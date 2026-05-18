// 管理端 - 认证相关 API
import { get, post } from '../../client/api/request'

// 获取滑块验证码
export function getCaptcha(once, ts, sign) {
  return get('/admin/v1/user/verify/captcha', { once, ts, sign }, { skipAuth: true })
}

// 校验滑块验证码
export function checkCaptcha(key, slide_x, slide_y) {
  return post('/admin/v1/user/verify/captcha/check', { key, slide_x, slide_y }, { skipAuth: true })
}

// 发送短信验证码
export function sendSmsCode(scene, mobile, ticket) {
  return post('/admin/v1/user/verify/smscode', { scene, mobile, ticket }, { skipAuth: true })
}

// 手机号密码登录
export function passwordLogin(mobile, password) {
  return post('/admin/v1/user/mobile/password_login', { mobile, password }, { skipAuth: true })
}

// 手机号验证码登录
export function verifyCodeLogin(mobile, verify_code) {
  return post('/admin/v1/user/mobile/verify_login', { mobile, verify_code }, { skipAuth: true })
}

// 获取当前管理员信息
export function getAdminUserInfo() {
  return get('/admin/v1/user/info')
}

// 获取权限列表
export function getMyPerms() {
  return get('/admin/v1/perm/my_perms')
}

// 登出
export function logout() {
  return post('/admin/v1/user/logout')
}
