// 管理端 - 用户管理 API
import { get, post } from '../../client/api/request'

export function getUserList(params = {}) {
  const query = { page: params.page || 1, limit: params.limit || 10 }
  if (params.nick_name_kw) query.nick_name_kw = params.nick_name_kw
  if (params.mobile) query.mobile = params.mobile
  if (params.status !== undefined && params.status !== null) query.status = params.status
  return get('/admin/v1/user/list', query)
}

export function getUserInfo(user_id) {
  return get('/admin/v1/user/info', { user_id })
}

export function updateUserStatus(user_id, status) {
  return post('/admin/v1/user/update_status', { user_id, status })
}

export default { getUserList, getUserInfo, updateUserStatus }
