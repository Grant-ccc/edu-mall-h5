// 认证相关 API
import { get, post } from './request'

// 获取滑块验证码
export function getCaptcha(once, ts, sign) {
  return get('/customer/v1/user/verify/captcha', { once, ts, sign }, { skipAuth: true })
}

// 校验滑块验证码
export function checkCaptcha(key, slide_x, slide_y) {
  return post('/customer/v1/user/verify/captcha/check', { key, slide_x, slide_y }, { skipAuth: true })
}

// 发送短信验证码
export function sendSmsCode(scene, mobile, ticket) {
  return post('/customer/v1/user/verify/smscode', { scene, mobile, ticket }, { skipAuth: true })
}

// 小程序登录
export function appletLogin(app_code, code, platform) {
  return post('/customer/v1/user/applet/login', { app_code, code, platform }, { skipAuth: true })
}

// 手机号密码登录
export function passwordLogin(mobile, password, ticket) {
  return post('/customer/v1/user/mobile/password_login', { mobile, password, ticket }, { skipAuth: true })
}

// 手机号验证码登录/注册
export function verifyCodeLogin(mobile, verify_code) {
  return post('/customer/v1/user/mobile/verify_login', { mobile, verify_code }, { skipAuth: true })
}

// 手机号重置密码
export function resetPassword(mobile, password, confirm_pwd, verify_code) {
  return post('/customer/v1/user/mobile/reset_password', { mobile, password, confirm_pwd, verify_code }, { skipAuth: true })
}

// 获取微信扫码登录二维码
export function getWechatQrCode(purpose) {
  return post('/customer/v1/user/wechat/qrcode_login', { purpose }, { skipAuth: true })
}

// 查询微信扫码状态
export function getWechatQrCodeStatus(scene_token) {
  return get('/customer/v1/user/wechat/qrcode_status', { scene_token }, { skipAuth: true })
}

// 微信扫码确认
export function wechatScanConfirm(scene_token, code) {
  return post('/customer/v1/user/wechat/scan_confirm', { scene_token, code }, { skipAuth: true })
}

export default {
  getCaptcha,
  checkCaptcha,
  sendSmsCode,
  appletLogin,
  passwordLogin,
  verifyCodeLogin,
  resetPassword,
  getWechatQrCode,
  getWechatQrCodeStatus,
  wechatScanConfirm
}