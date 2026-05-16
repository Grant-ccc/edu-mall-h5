// 课程状态管理
// �示示版本 -使用 localStorage �持久化

const COURSE_KEY = 'edu_mall_admin_courses'
const CATALOG_KEY = 'edu_mall_admin_catalogs'

// 课程状态枚举
export const CourseStatus = {
  OFFLINE: -1,  // 下架
  ONLINE: 1     // 上架
}

export const CourseStatusText = {
  [-1]: '下架',
  1: '上架'
}

export const CourseStatusColor = {
  [-1]: 'default',
  1: 'success'
}

// 课程更新状态枚举
export const CourseUpdateStatus = {
  UPDATING: 1,   // 更新中
  COMPLETED: 2   // 已完结
}

export const CourseUpdateStatusText = {
  1: '更新中',
  2: '已完结'
}

// 生成课程 ID
function generateId() {
  return Date.now()
}

// 获取初始课程列表
function getInitialCourses() {
  const str = localStorage.getItem(COURSE_KEY)
  try {
    return str ? JSON.parse(str) : []
  } catch (e) {
    return []
  }
}

// 获取初始目录数据
function getInitialCatalogs() {
  const str = localStorage.getItem(CATALOG_KEY)
  try {
    return str ? JSON.parse(str) : {}
  } catch (e) {
    return {}
  }
}

// 简单状态管理
let courses = getInitialCourses()
let catalogs = getInitialCatalogs()
const listeners = new Set()

function notify() {
  listeners.forEach(listener => listener({ courses, catalogs }))
}

function persistCourses() {
  localStorage.setItem(COURSE_KEY, JSON.stringify(courses))
}

function persistCatalogs() {
  localStorage.setItem(CATALOG_KEY, JSON.stringify(catalogs))
}

// Mock 初始课程数据
const mockCourses = [
  {
    id: 1,
    name: 'Go语言在线教育商城实战',
    course_price: 9900,
    service_time: 365,
    learn_time: 30,
    sort: 1,
    status: 1,
    features: ['录播', '实战', '答疑', '源码'],
    update_status: 1,
    cover_url: '',
    detail_cover_url: '',
    detail: '<p>本课程带你从零开始，使用 Go 语言构建一个完整的在线教育商城系统。</p>',
    create_at: Date.now() - 86400000 * 7,
    update_at: Date.now() - 86400000
  },
  {
    id: 2,
    name: 'React前端工程化实战',
    course_price: 7900,
    service_time: 180,
    learn_time: 20,
    sort: 2,
    status: 1,
    features: ['录播', '源码'],
    update_status: 2,
    cover_url: '',
    detail_cover_url: '',
    detail: '<p>React 前端工程化实战课程</p>',
    create_at: Date.now() - 86400000 * 5,
    update_at: Date.now() - 86400000 * 2
  },
  {
    id: 3,
    name: 'TypeScript深入浅出',
    course_price: 5900,
    service_time: 90,
    learn_time: 15,
    sort: 3,
    status: -1,
    features: ['录播', '练习'],
    update_status: 2,
    cover_url: '',
    detail_cover_url: '',
    detail: '<p>TypeScript 深入浅出课程</p>',
    create_at: Date.now() - 86400000 * 3,
    update_at: Date.now() - 86400000
  }
]

// 初始化 mock 数据
if (courses.length === 0) {
  courses = mockCourses
  persistCourses()
}

export const courseStore = {
  getState() {
    return { courses, catalogs }
  },

  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  // 获取课程列表
  getCourses() {
    return courses
  },

  // 获取单个课程
  getCourse(id) {
    return courses.find(c => c.id === parseInt(id))
  },

  // 创建课程
  createCourse(courseData) {
    const newCourse = {
      ...courseData,
      id: generateId(),
      create_at: Date.now(),
      update_at: Date.now()
    }
    courses = [newCourse, ...courses]
    persistCourses()
    notify()
    return newCourse
  },

  // 更新课程
  updateCourse(courseData) {
    const index = courses.findIndex(c => c.id === courseData.id)
    if (index === -1) {
      return { success: false, message: '课程不存在' }
    }
    courses[index] = {
      ...courses[index],
      ...courseData,
      update_at: Date.now()
    }
    persistCourses()
    notify()
    return { success: true }
  },

  // 删除课程
  deleteCourse(id) {
    const index = courses.findIndex(c => c.id === id)
    if (index === -1) {
      return { success: false, message: '课程不存在' }
    }
    courses.splice(index, 1)
    // 同时删除目录数据
    delete catalogs[id]
    persistCourses()
    persistCatalogs()
    notify()
    return { success: true }
  },

  // 更新课程状态（上下架）
  updateStatus(id, status) {
    const course = courses.find(c => c.id === id)
    if (!course) {
      return { success: false, message: '课程不存在' }
    }
    course.status = status
    course.update_at = Date.now()
    persistCourses()
    notify()
    return { success: true }
  },

  // 获取课程目录
  getCatalog(courseId) {
    return catalogs[courseId] || { catalogs: [], total_duration: 0, lesson_count: 0 }
  },

  // 设置课程目录
  setCatalog(courseId, catalogData) {
    catalogs[courseId] = catalogData
    persistCatalogs()
    notify()
  },

  // 添加目录
  addCatalog(courseId, catalog) {
    if (!catalogs[courseId]) {
      catalogs[courseId] = { catalogs: [], total_duration: 0, lesson_count: 0 }
    }
    const newCatalog = {
      ...catalog,
      id: generateId(),
      lessons: [],
      lesson_count: 0
    }
    catalogs[courseId].catalogs.push(newCatalog)
    persistCatalogs()
    notify()
    return newCatalog
  },

  // 更新目录
  updateCatalog(courseId, catalogId, data) {
    const catalogList = catalogs[courseId]?.catalogs
    if (!catalogList) return { success: false, message: '目录不存在' }

    const index = catalogList.findIndex(c => c.id === catalogId)
    if (index === -1) return { success: false, message: '目录不存在' }

    catalogList[index] = { ...catalogList[index], ...data }
    persistCatalogs()
    notify()
    return { success: true }
  },

  // 删除目录
  deleteCatalog(courseId, catalogId) {
    const catalogList = catalogs[courseId]?.catalogs
    if (!catalogList) return { success: false, message: '目录不存在' }

    const index = catalogList.findIndex(c => c.id === catalogId)
    if (index === -1) return { success: false, message: '目录不存在' }

    catalogList.splice(index, 1)
    persistCatalogs()
    notify()
    return { success: true }
  },

  // 更新目录排序
  updateCatalogSort(courseId, sortList) {
    if (!catalogs[courseId]) {
      catalogs[courseId] = { catalogs: [], total_duration: 0, lesson_count: 0 }
    }
    // 按 sortList 重新排序 catalogs
    const catalogMap = new Map(catalogs[courseId].catalogs.map(c => [c.id, c]))
    catalogs[courseId].catalogs = sortList
      .map(s => catalogMap.get(s.id))
      .filter(Boolean)
      .map((c, i) => ({ ...c, sort: i + 1 }))
    persistCatalogs()
    notify()
    return { success: true }
  }
}

export default courseStore
