// 管理端 - 系统设置 API
import { get, post } from '../../client/api/request'

export function getSettings() {
  return get('/admin/v1/setting/list')
}

export function updateSettings(data) {
  return post('/admin/v1/setting/update', data)
}

export default { getSettings, updateSettings }
