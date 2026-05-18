// 管理端 - 课时管理 API
import { get, post } from '../../client/api/request'

// ========== 分类管理 ==========

// 分类列表
export function listCategory() {
  return get('/admin/v1/lesson/category/list')
}

// 创建分类
export function createCategory(data) {
  return post('/admin/v1/lesson/category/create', data)
}

// 更新分类
export function updateCategory(data) {
  return post('/admin/v1/lesson/category/update', data)
}

// 删除分类
export function deleteCategory(ids) {
  return post('/admin/v1/lesson/category/delete', { ids })
}

// 更新分类排序
export function updateCategorySort(data) {
  return post('/admin/v1/lesson/category/update_sort', data)
}

// ========== 课时管理 ==========

// 课时列表 (POST)
export function listLesson(params = {}) {
  return post('/admin/v1/lesson/list', params)
}

// 课时详情
export function getLessonInfo(lesson_id) {
  return get('/admin/v1/lesson/info', { lesson_id })
}

// 创建课时
export function createLesson(data) {
  return post('/admin/v1/lesson/create', data)
}

// 更新课时
export function updateLesson(data) {
  return post('/admin/v1/lesson/update', data)
}

// 更新课时状态
export function updateLessonStatus(id, status) {
  return post('/admin/v1/lesson/update_status', { id, status })
}

// 移动课时
export function moveLesson(ids, category_id) {
  return post('/admin/v1/lesson/move', { ids, category_id })
}
