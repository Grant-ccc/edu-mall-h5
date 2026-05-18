// 课程状态管理
// 基于 API 调用，本地维护状态用于 UI 响应

import { listCourse, getCourseInfo, createCourse, updateCourse, updateCourseStatus } from '../api/course'

// 课程状态枚举
export const CourseStatus = { OFFLINE: -1, ONLINE: 1 }
export const CourseStatusText = { [-1]: '下架', 1: '上架' }
export const CourseStatusColor = { [-1]: 'default', 1: 'success' }

// 课程更新状态枚举
export const CourseUpdateStatus = { UPDATING: 1, COMPLETED: 2 }
export const CourseUpdateStatusText = { 1: '更新中', 2: '已完结' }

// 状态管理
let courses = []
let catalogs = {} // 课程目录数据（暂时保持 mock，后续对接）
const listeners = new Set()

function notify() {
  listeners.forEach(listener => listener({ courses, catalogs }))
}

export const courseStore = {
  getState() {
    return { courses, catalogs }
  },

  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  // 获取课程列表（从本地状态）
  getCourses() { return courses },

  // 获取单个课程
  getCourse(id) { return courses.find(c => c.id === parseInt(id)) },

  // 从 API 加载课程列表
  async fetchCourses(params = {}) {
    try {
      const data = await listCourse(params)
      courses = data.list || []
      notify()
      return courses
    } catch (error) {
      console.error('获取课程列表失败:', error)
      throw error
    }
  },

  // 从 API 加载课程详情
  async fetchCourseDetail(id) {
    try {
      const data = await getCourseInfo(id)
      // 更新本地列表中的该课程
      const index = courses.findIndex(c => c.id === parseInt(id))
      if (index !== -1) {
        courses[index] = { ...courses[index], ...data }
      } else {
        courses = [data, ...courses]
      }
      notify()
      return data
    } catch (error) {
      console.error('获取课程详情失败:', error)
      throw error
    }
  },

  // 创建课程
  async createCourse(courseData) {
    try {
      const result = await createCourse(courseData)
      await this.fetchCourses()
      return { success: true, ...result }
    } catch (error) {
      console.error('创建课程失败:', error)
      return { success: false, message: '创建失败' }
    }
  },

  // 更新课程
  async updateCourse(courseData) {
    try {
      const result = await updateCourse(courseData)
      await this.fetchCourses()
      return { success: true, ...result }
    } catch (error) {
      console.error('更新课程失败:', error)
      return { success: false, message: '更新失败' }
    }
  },

  // 更新课程状态
  async updateStatus(id, status) {
    try {
      await updateCourseStatus(id, status)
      const course = courses.find(c => c.id === id)
      if (course) {
        course.status = status
        notify()
      }
      return { success: true }
    } catch (error) {
      console.error('更新状态失败:', error)
      return { success: false, message: '操作失败' }
    }
  },

  // 删除课程
  async deleteCourse(id) {
    return this.updateStatus(id, CourseStatus.OFFLINE)
  },

  // ========== 目录管理（待后端对接） ==========
  getCatalog(courseId) {
    return catalogs[courseId] || { catalogs: [], total_duration: 0, lesson_count: 0 }
  },

  setCatalog(courseId, catalogData) {
    catalogs[courseId] = catalogData
    notify()
  },

  addCatalog(courseId, catalog) {
    if (!catalogs[courseId]) catalogs[courseId] = { catalogs: [], total_duration: 0, lesson_count: 0 }
    const newCatalog = {
      ...catalog,
      id: Date.now(),
      lessons: [],
      lesson_count: 0
    }
    catalogs[courseId].catalogs.push(newCatalog)
    notify()
    return newCatalog
  },

  updateCatalog(courseId, catalogId, data) {
    const catalogList = catalogs[courseId]?.catalogs
    if (!catalogList) return { success: false }
    const index = catalogList.findIndex(c => c.id === catalogId)
    if (index === -1) return { success: false }
    catalogList[index] = { ...catalogList[index], ...data }
    notify()
    return { success: true }
  },

  deleteCatalog(courseId, catalogId) {
    const catalogList = catalogs[courseId]?.catalogs
    if (!catalogList) return { success: false }
    catalogs[courseId].catalogs = catalogList.filter(c => c.id !== catalogId)
    notify()
    return { success: true }
  },

  updateCatalogSort(courseId, sortList) {
    if (!catalogs[courseId]) catalogs[courseId] = { catalogs: [], total_duration: 0, lesson_count: 0 }
    const catalogMap = new Map(catalogs[courseId].catalogs.map(c => [c.id, c]))
    catalogs[courseId].catalogs = sortList
      .map(s => catalogMap.get(s.id))
      .filter(Boolean)
      .map((c, i) => ({ ...c, sort: i + 1 }))
    notify()
    return { success: true }
  }
}

export default courseStore