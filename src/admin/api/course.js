// 管理端 - 课程管理 API
import { get, post } from '../../client/api/request'

// 课程列表
export function listCourse(params = {}) {
  const query = {
    page: params.page || 1,
    limit: params.limit || 10
  }
  if (params.name_kw) query.name_kw = params.name_kw
  if (params.status !== undefined && params.status !== null) query.status = params.status
  return get('/admin/v1/course/list', query)
}

// 课程详情
export function getCourseInfo(id) {
  return get('/admin/v1/course/info', { id })
}

// 创建课程
export function createCourse(data) {
  return post('/admin/v1/course/create', data)
}

// 更新课程
export function updateCourse(data) {
  return post('/admin/v1/course/update', data)
}

// 更新课程状态
export function updateCourseStatus(id, status) {
  return post('/admin/v1/course/update_status', { id, status })
}
