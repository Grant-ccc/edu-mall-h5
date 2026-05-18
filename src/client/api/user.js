// 用户中心相关 API
import { get, post } from './request'

// 获取当前用户信息
export function getUserInfo() {
  return get('/customer/v1/user/info')
}

// 修改密码
export function changePassword(old_password, new_password, confirm_password, verify_code) {
  return post('/customer/v1/user/change_password', { old_password, new_password, confirm_password, verify_code })
}

// 发送修改密码短信验证码
export function changePasswordSmsCode(ticket) {
  return post('/customer/v1/user/change_password/smscode', { ticket })
}

// 获取微信绑定二维码
export function getWechatBindQrCode(purpose = 'bind') {
  return post('/customer/v1/user/wechat/qrcode_bind', { purpose })
}

// 解绑微信
export function unbindWechat() {
  return post('/customer/v1/user/wechat/unbind')
}

export default {
  getUserInfo,
  changePassword,
  changePasswordSmsCode,
  getWechatBindQrCode,
  unbindWechat
}