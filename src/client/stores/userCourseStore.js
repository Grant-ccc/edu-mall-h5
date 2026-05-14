// 用户已购课程状态管理
// 使用 localStorage 持久化

const USER_COURSE_KEY = 'edu_mall_user_courses'

// 获取初始状态
function getInitialState() {
  const str = localStorage.getItem(USER_COURSE_KEY)
  let courses = []
  try {
    const data = str ? JSON.parse(str) : { courses: [] }
    courses = data.courses || []
  } catch (e) {
    courses = []
  }
  return { courses }
}

// 简单状态管理
let state = getInitialState()
const listeners = new Set()

function notify() {
  listeners.forEach(listener => listener(state))
}

function persist() {
  localStorage.setItem(USER_COURSE_KEY, JSON.stringify({ courses: state.courses }))
}

export const userCourseStore = {
  getState() {
    return state
  },

  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  // 获取已购课程列表
  getCourses() {
    return state.courses
  },

  // 检查是否已购买
  hasCourse(courseId) {
    return state.courses.some(c => c.id === courseId)
  },

  // 添加课程（支付成功后调用）
  addCourses(items) {
    const now = Date.now()
    const newCourses = items.map(item => ({
      id: item.goods_id,
      name: item.name,
      cover_url: item.cover_url || '',
      price: item.price,
      purchase_time: now,
      // 学习有效期：购买后365天
      learn_expire_time: now + 365 * 24 * 60 * 60 * 1000,
      last_lesson_id: null
    }))

    // 过滤掉已存在的课程
    const toAdd = newCourses.filter(c => !this.hasCourse(c.id))

    if (toAdd.length > 0) {
      state = {
        courses: [...toAdd, ...state.courses]
      }
      persist()
      notify()
    }

    return toAdd.length
  },

  // 更新最近学习的课时
  updateLastLesson(courseId, lessonId) {
    const course = state.courses.find(c => c.id === courseId)
    if (course) {
      course.last_lesson_id = lessonId
      persist()
      notify()
    }
  },

  // 移除课程权益（退款时调用）
  removeCourses(goodsIds) {
    state = {
      courses: state.courses.filter(c => !goodsIds.includes(c.id))
    }
    persist()
    notify()
  }
}

export default userCourseStore
