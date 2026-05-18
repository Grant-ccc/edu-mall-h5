// 课程相关 API
import { get, post } from './request'

// 课程列表
export function getCourseList(params = {}) {
  const queryParams = {
    page: params.page || 1,
    limit: params.limit || 10,
    ...params
  }
  // 过滤掉空值
  Object.keys(queryParams).forEach(key => {
    if (queryParams[key] === null || queryParams[key] === undefined || queryParams[key] === '') {
      delete queryParams[key]
    }
  })
  return get('/customer/v1/course/list', queryParams)
}

// 课程详情
export function getCourseDetail(id) {
  return get('/customer/v1/course/detail', { id })
}

// 课时信息
export function getLessonInfo(lesson_id, user_id = null) {
  return get('/customer/v1/course/lesson/info', { lesson_id, user_id })
}

// 课时学习进度
export function getLessonLearnInfo(course_id, lesson_id) {
  return get('/customer/v1/course/lesson/learn_info', { course_id, lesson_id })
}

// 上报课时学习进度
export function reportLessonLearn(course_id, lesson_id, type, play_position) {
  return post('/customer/v1/course/lesson/learn_report', { course_id, lesson_id, type, play_position })
}

// 已购买课程列表
export function getPurchasedCourseList(params = {}) {
  return get('/customer/v1/course/purchased/list', {
    page: params.page || 1,
    limit: params.limit || 10,
    unlimited: params.unlimited || false
  })
}

// 继续学习课程列表
export function getContinueLearnList(params = {}) {
  return get('/customer/v1/course/continue/list', {
    page: params.page || 1,
    limit: params.limit || 10,
    unlimited: params.unlimited || false
  })
}

export default {
  getCourseList,
  getCourseDetail,
  getLessonInfo,
  getLessonLearnInfo,
  reportLessonLearn,
  getPurchasedCourseList,
  getContinueLearnList
}