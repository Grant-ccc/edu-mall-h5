// 课时状态管理
// 基于 API 调用，本地维护状态用于 UI 响应

import {
  listCategory, createCategory, updateCategory, deleteCategory, updateCategorySort,
  listLesson, getLessonInfo, createLesson, updateLesson, updateLessonStatus, moveLesson
} from '../api/lesson'

// 课时状态枚举
export const LessonStatus = { DISABLED: -1, ENABLED: 1 }
export const LessonStatusText = { [-1]: '禁用', 1: '启用' }
export const LessonStatusColor = { [-1]: 'default', 1: 'success' }

// 状态管理
let categories = []
let lessons = []
const listeners = new Set()

function notify() {
  listeners.forEach(listener => listener({ categories, lessons }))
}

export const lessonStore = {
  getState() {
    return { categories, lessons }
  },

  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  // ========== 分类管理 ==========

  getCategories() { return categories },

  getCategoryTree() {
    const buildTree = (parentId = -1) => {
      return categories
        .filter(c => c.parent_id === parentId)
        .sort((a, b) => a.sort - b.sort)
        .map(c => ({ ...c, children: buildTree(c.id) }))
    }
    return buildTree(-1)
  },

  getCategory(id) { return categories.find(c => c.id === id) },

  async fetchCategories() {
    try {
      const data = await listCategory()
      categories = data?.list || data || []
      notify()
      return categories
    } catch (error) {
      console.error('获取分类列表失败:', error)
      throw error
    }
  },

  async addCategory(data) {
    try {
      await createCategory(data)
      await this.fetchCategories()
      return { success: true }
    } catch (error) {
      console.error('创建分类失败:', error)
      return { success: false, message: '创建失败' }
    }
  },

  async editCategory(data) {
    try {
      await updateCategory(data)
      await this.fetchCategories()
      return { success: true }
    } catch (error) {
      console.error('更新分类失败:', error)
      return { success: false, message: '更新失败' }
    }
  },

  async removeCategory(ids) {
    try {
      await deleteCategory(Array.isArray(ids) ? ids : [ids])
      await this.fetchCategories()
      return { success: true }
    } catch (error) {
      console.error('删除分类失败:', error)
      return { success: false, message: '删除失败' }
    }
  },

  async updateSort(sortList) {
    try {
      await updateCategorySort(sortList)
      await this.fetchCategories()
      return { success: true }
    } catch (error) {
      console.error('更新排序失败:', error)
      return { success: false, message: '更新失败' }
    }
  },

  // 保持旧方法名兼容
  createCategory: async function (data) { return this.addCategory(data) },
  updateCategory: async function (data) { return this.editCategory(data) },
  deleteCategory: async function (ids) { return this.removeCategory(ids) },
  updateCategorySort: async function (data) { return this.updateSort(data) },

  // ========== 课时管理 ==========

  getLessons() { return lessons },

  getLesson(id) { return lessons.find(l => l.id === parseInt(id)) },

  getLessonsByCategory(categoryId) {
    return lessons.filter(l => l.category_id === categoryId)
  },

  async fetchLessons(params = {}) {
    try {
      const data = await listLesson(params)
      lessons = data?.list || data || []
      notify()
      return lessons
    } catch (error) {
      console.error('获取课时列表失败:', error)
      throw error
    }
  },

  async fetchLessonDetail(id) {
    try {
      const data = await getLessonInfo(id)
      const index = lessons.findIndex(l => l.id === parseInt(id))
      if (index !== -1) {
        lessons[index] = { ...lessons[index], ...data }
      } else {
        lessons = [data, ...lessons]
      }
      notify()
      return data
    } catch (error) {
      console.error('获取课时详情失败:', error)
      throw error
    }
  },

  async addLesson(data) {
    try {
      await createLesson(data)
      await this.fetchLessons()
      return { success: true, id: lessons[0]?.id }
    } catch (error) {
      console.error('创建课时失败:', error)
      return { success: false, message: '创建失败' }
    }
  },

  async editLesson(data) {
    try {
      await updateLesson(data)
      await this.fetchLessons()
      return { success: true }
    } catch (error) {
      console.error('更新课时失败:', error)
      return { success: false, message: '更新失败' }
    }
  },

  async removeLesson(id) {
    try {
      // 通过状态更新来"删除"
      await updateLessonStatus(id, LessonStatus.DISABLED)
      await this.fetchLessons()
      return { success: true }
    } catch (error) {
      console.error('删除课时失败:', error)
      return { success: false, message: '删除失败' }
    }
  },

  async removeLessons(ids) {
    try {
      await Promise.all(ids.map(id => updateLessonStatus(id, LessonStatus.DISABLED)))
      await this.fetchLessons()
      return { success: true }
    } catch (error) {
      console.error('批量删除失败:', error)
      return { success: false, message: '删除失败' }
    }
  },

  async moveLessons(lessonIds, targetCategoryId) {
    try {
      await moveLesson(lessonIds, targetCategoryId)
      await this.fetchLessons()
      return { success: true }
    } catch (error) {
      console.error('移动课时失败:', error)
      return { success: false, message: '移动失败' }
    }
  },

  async updateLessonStatus(id, status) {
    try {
      await updateLessonStatus(id, status)
      const lesson = lessons.find(l => l.id === id)
      if (lesson) {
        lesson.status = status
        notify()
      }
      return { success: true }
    } catch (error) {
      console.error('更新状态失败:', error)
      return { success: false, message: '操作失败' }
    }
  },

  // 保持旧方法名兼容
  createLesson: async function (data) { return this.addLesson(data) },
  updateLesson: async function (data) { return this.editLesson(data) },
  deleteLesson: async function (id) { return this.removeLesson(id) },
  deleteLessons: async function (ids) { return this.removeLessons(ids) }
}

export default lessonStore