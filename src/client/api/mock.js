/**
 * C端 Mock API 数据层
 * 所有数据结构和响应格式严格按照 customer.yaml 定义
 */

// ========== 统一响应包装 ==========
function resp(data) {
  return { code: 0, msg: 'ok', err_msg: '', is_aes: false, data }
}

// ========== Mock 数据生成 ==========
const now = Date.now()
const day = 86400000

// 课程列表 mock
const mockCourses = [
  {
    id: 1, name: 'Go语言在线教育商城实战', course_price: 9900, service_time: 365,
    learn_time: 30, sort: 1, status: 1, features: ['录播', '实战', '答疑', '源码'],
    update_status: 1, has_purchased: false, cover_url: '', detail_cover_url: '',
    detail: '<p>从零开始，使用 Go 语言构建完整的在线教育商城系统。</p>',
    create_at: now - day * 10, update_at: now - day * 2,
    create_name: '管理员', update_name: '管理员'
  },
  {
    id: 2, name: 'React前端工程化实战', course_price: 7900, service_time: 180,
    learn_time: 20, sort: 2, status: 1, features: ['录播', '源码'],
    update_status: 2, has_purchased: false, cover_url: '', detail_cover_url: '',
    detail: '<p>React 前端工程化实战课程</p>',
    create_at: now - day * 8, update_at: now - day * 1,
    create_name: '管理员', update_name: '管理员'
  },
  {
    id: 3, name: 'TypeScript深入浅出', course_price: 5900, service_time: 90,
    learn_time: 15, sort: 3, status: 1, features: ['录播', '练习'],
    update_status: 2, has_purchased: true, cover_url: '', detail_cover_url: '',
    detail: '<p>TypeScript 深入浅出课程</p>',
    create_at: now - day * 6, update_at: now - day * 1,
    create_name: '管理员', update_name: '管理员'
  },
  {
    id: 4, name: 'Node.js服务端开发', course_price: 8900, service_time: 365,
    learn_time: 25, sort: 4, status: 1, features: ['录播', '实战'],
    update_status: 1, has_purchased: false, cover_url: '', detail_cover_url: '',
    detail: '<p>Node.js 服务端开发课程</p>',
    create_at: now - day * 5, update_at: now - day * 1,
    create_name: '管理员', update_name: '管理员'
  },
  {
    id: 5, name: 'Vue3全家桶实战', course_price: 6900, service_time: 180,
    learn_time: 18, sort: 5, status: 1, features: ['录播', '源码', '答疑'],
    update_status: 2, has_purchased: false, cover_url: '', detail_cover_url: '',
    detail: '<p>Vue3 全家桶实战课程</p>',
    create_at: now - day * 4, update_at: now - day * 1,
    create_name: '管理员', update_name: '管理员'
  },
  {
    id: 6, name: 'MySQL数据库设计与优化', course_price: 4900, service_time: 90,
    learn_time: 12, sort: 6, status: 1, features: ['录播'],
    update_status: 2, has_purchased: false, cover_url: '', detail_cover_url: '',
    detail: '<p>MySQL 数据库设计与优化课程</p>',
    create_at: now - day * 3, update_at: now - day * 1,
    create_name: '管理员', update_name: '管理员'
  },
  {
    id: 7, name: 'Redis缓存实战应用', course_price: 3900, service_time: 60,
    learn_time: 8, sort: 7, status: 1, features: ['录播', '实战'],
    update_status: 2, has_purchased: true, cover_url: '', detail_cover_url: '',
    detail: '<p>Redis 缓存实战应用课程</p>',
    create_at: now - day * 2, update_at: now - day * 1,
    create_name: '管理员', update_name: '管理员'
  },
  {
    id: 8, name: 'Docker容器化部署', course_price: 2900, service_time: 30,
    learn_time: 6, sort: 8, status: 1, features: ['录播'],
    update_status: 2, has_purchased: false, cover_url: '', detail_cover_url: '',
    detail: '<p>Docker 容器化部署课程</p>',
    create_at: now - day * 1, update_at: now - day * 1,
    create_name: '管理员', update_name: '管理员'
  }
]

// 用户信息 mock
const mockUserInfo = {
  user: {
    user_id: 1001, nick_name: '测试用户', icon_url: '', sex: 1, status: 1,
    last_login_at: now - 60000, update_at: now, wechat_bind: false,
    can_unbind_wechat: true, has_password: true, create_at: now - day * 30
  },
  mobile_user: { mobile: '13800001111', user_id: 1001 },
  wechat_user: null,
  app_users: []
}

// 登录响应 mock
const mockLoginResp = {
  token: 'mock_customer_token_' + now,
  user_info: mockUserInfo
}

// 验证码 mock
// 生成 mock 验证码图片
function genMockCaptchaImages() {
  const CW = 300, CH = 220, tw = 48, th = 48
  const tx = 40 + Math.floor(Math.random() * (CW - tw - 80))
  const ty = 40 + Math.floor(Math.random() * (CH - th - 80))

  const canvas = document.createElement('canvas')
  canvas.width = CW; canvas.height = CH
  const ctx = canvas.getContext('2d')
  const h1 = Math.floor(Math.random() * 360), h2 = (h1 + 80 + Math.floor(Math.random() * 120)) % 360
  const grad = ctx.createLinearGradient(0, 0, CW, CH)
  grad.addColorStop(0, `hsl(${h1}, 50%, 50%)`)
  grad.addColorStop(1, `hsl(${h2}, 50%, 45%)`)
  ctx.fillStyle = grad; ctx.fillRect(0, 0, CW, CH)
  for (let i = 0; i < 6; i++) {
    ctx.beginPath(); ctx.arc(Math.random() * CW, Math.random() * CH, 15 + Math.random() * 25, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.15})`; ctx.fill()
  }
  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(tx, ty); ctx.lineTo(tx + 15, ty)
  ctx.quadraticCurveTo(tx + 20, ty - 6, tx + 25, ty); ctx.quadraticCurveTo(tx + 30, ty - 6, tx + 35, ty)
  ctx.lineTo(tx + tw, ty); ctx.lineTo(tx + tw, ty + 15)
  ctx.quadraticCurveTo(tx + tw + 6, ty + 20, tx + tw, ty + 25); ctx.quadraticCurveTo(tx + tw + 6, ty + 30, tx + tw, ty + 35)
  ctx.lineTo(tx + tw, ty + th); ctx.lineTo(tx + 35, ty + th)
  ctx.quadraticCurveTo(tx + 30, ty + th + 6, tx + 25, ty + th); ctx.quadraticCurveTo(tx + 20, ty + th + 6, tx + 15, ty + th)
  ctx.lineTo(tx, ty + th); ctx.lineTo(tx, ty + 35)
  ctx.quadraticCurveTo(tx - 6, ty + 30, tx, ty + 25); ctx.quadraticCurveTo(tx - 6, ty + 20, tx, ty + 15)
  ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore()
  const image = canvas.toDataURL('image/png')

  const tc = document.createElement('canvas'); tc.width = tw + 20; tc.height = th + 20
  const tctx = tc.getContext('2d')
  tctx.save(); tctx.beginPath()
  tctx.moveTo(10, 10); tctx.lineTo(25, 10)
  tctx.quadraticCurveTo(30, 4, 35, 10); tctx.quadraticCurveTo(40, 4, 45, 10)
  tctx.lineTo(10 + tw, 10); tctx.lineTo(10 + tw, 25)
  tctx.quadraticCurveTo(10 + tw + 6, 30, 10 + tw, 35); tctx.quadraticCurveTo(10 + tw + 6, 40, 10 + tw, 45)
  tctx.lineTo(10 + tw, 10 + th); tctx.lineTo(45, 10 + th)
  tctx.quadraticCurveTo(40, 10 + th + 6, 35, 10 + th); tctx.quadraticCurveTo(30, 10 + th + 6, 25, 10 + th)
  tctx.lineTo(10, 10 + th); tctx.lineTo(10, 45)
  tctx.quadraticCurveTo(4, 40, 10, 35); tctx.quadraticCurveTo(4, 30, 10, 25)
  tctx.closePath(); tctx.clip()
  tctx.drawImage(canvas, tx - 10, ty - 10, tw + 20, th + 20, 0, 0, tw + 20, th + 20)
  tctx.restore()
  tctx.strokeStyle = 'rgba(255,255,255,0.8)'; tctx.lineWidth = 2; tctx.stroke()
  const thumb = tc.toDataURL('image/png')

  return { image, thumb, tx, ty, tw, th }
}

let _mockCaptchaCache = null
function getMockCaptcha() {
  const imgs = genMockCaptchaImages()
  return {
    key: 'mock_captcha_key_' + Date.now(),
    image_base64: imgs.image,
    title_image_base64: imgs.thumb,
    title_height: imgs.th, title_width: imgs.tw,
    title_x: imgs.tx, title_y: imgs.ty,
    expire: Date.now() + 300000
  }
}

// 已购课程 mock
const mockPurchasedCourses = [
  {
    id: 3, name: 'TypeScript深入浅出', service_expire_time: now + day * 90,
    learn_expire_time: now + day * 365, features: ['录播', '练习'],
    update_status: 2, has_purchased: true, cover_url: '',
    detail_cover_url: '', detail: '<p>TypeScript 深入浅出课程</p>'
  },
  {
    id: 7, name: 'Redis缓存实战应用', service_expire_time: now + day * 60,
    learn_expire_time: now + day * 180, features: ['录播', '实战'],
    update_status: 2, has_purchased: true, cover_url: '',
    detail_cover_url: '', detail: '<p>Redis 缓存实战应用课程</p>'
  }
]

// 继续学习 mock
const mockContinueLearn = [
  {
    course_id: 3, course_name: 'TypeScript深入浅出', course_cover_key: '', course_cover_url: '',
    lesson_id: 102, lesson_name: 'TypeScript类型系统', lesson_index: 2, lesson_count: 30,
    play_position: 320, learn_status: 1, last_learn_time: now - 60000
  }
]

// ==================== 管理端 Mock 数据 ====================

// 课时分类
let mockAdminCategories = [
  { id: 1, name: 'Go语言开发', parent_id: -1, level: 1, sort: 1, status: 1, create_at: now - day * 30, update_at: now },
  { id: 2, name: '前端开发', parent_id: -1, level: 1, sort: 2, status: 1, create_at: now - day * 28, update_at: now },
  { id: 3, name: '数据库', parent_id: -1, level: 1, sort: 3, status: 1, create_at: now - day * 26, update_at: now },
  { id: 4, name: 'Go基础语法', parent_id: 1, level: 2, sort: 1, status: 1, create_at: now - day * 25, update_at: now },
  { id: 5, name: 'Go Web框架', parent_id: 1, level: 2, sort: 2, status: 1, create_at: now - day * 24, update_at: now }
]

// 课时
let mockAdminLessons = [
  { id: 1, name: 'Go语言环境搭建', category_id: 4, category_name: 'Go基础语法', detail: '安装Go SDK，配置开发环境', duration: 600, status: 1, create_at: now - day * 20, update_at: now },
  { id: 2, name: '变量与数据类型', category_id: 4, category_name: 'Go基础语法', detail: 'Go语言的基本数据类型', duration: 480, status: 1, create_at: now - day * 19, update_at: now },
  { id: 3, name: '控制流程', category_id: 4, category_name: 'Go基础语法', detail: 'if/for/switch等控制语句', duration: 520, status: 1, create_at: now - day * 18, update_at: now },
  { id: 4, name: 'Gin框架入门', category_id: 5, category_name: 'Go Web框架', detail: 'Gin框架基础使用', duration: 720, status: 1, create_at: now - day * 17, update_at: now },
  { id: 5, name: 'React组件化开发', category_id: 2, category_name: '前端开发', detail: 'React组件化开发思想', duration: 900, status: 1, create_at: now - day * 16, update_at: now },
  { id: 6, name: 'MySQL表设计', category_id: 3, category_name: '数据库', detail: '数据库表设计规范', duration: 580, status: 1, create_at: now - day * 15, update_at: now }
]

// 订单
let mockAdminOrders = [
  { id: 20260510001, user_id: 1001, user_mobile: '13800001111', user_nickname: '测试用户', status: 2, payment_amount: 9900, order_amount: 9900, discount_amount: 0, trade_no: 'MOCK_TRADE_001', create_at: now - day * 3, payment_at: now - day * 3 + 600000, items: [{ goods_id: 1, goods_name: 'Go语言在线教育商城实战', payment_amount: 9900, goods_snap: { name: 'Go语言在线教育商城实战' } }] },
  { id: 20260510002, user_id: 1002, user_mobile: '13900002222', user_nickname: '张三', status: 1, payment_amount: 7900, order_amount: 7900, discount_amount: 0, trade_no: '', create_at: now - day * 1, payment_at: null, items: [{ goods_id: 2, goods_name: 'React前端工程化实战', payment_amount: 7900, goods_snap: { name: 'React前端工程化实战' } }] },
  { id: 20260509003, user_id: 1003, user_mobile: '13700003333', user_nickname: '李四', status: 2, payment_amount: 5900, order_amount: 5900, discount_amount: 0, trade_no: 'MOCK_TRADE_003', create_at: now - day * 5, payment_at: now - day * 5 + 1200000, items: [{ goods_id: 3, goods_name: 'TypeScript深入浅出', payment_amount: 5900, goods_snap: { name: 'TypeScript深入浅出' } }] },
  { id: 20260508004, user_id: 1004, user_mobile: '13600004444', user_nickname: '王五', status: 3, payment_amount: 8900, order_amount: 8900, discount_amount: 0, trade_no: 'MOCK_TRADE_004', create_at: now - day * 8, payment_at: now - day * 8 + 300000, items: [{ goods_id: 4, goods_name: 'Node.js服务端开发', payment_amount: 8900, goods_snap: { name: 'Node.js服务端开发' } }] },
  { id: 20260507005, user_id: 1005, user_mobile: '13500005555', user_nickname: '赵六', status: -1, payment_amount: 6900, order_amount: 6900, discount_amount: 0, trade_no: '', create_at: now - day * 10, payment_at: null, items: [{ goods_id: 5, goods_name: 'Vue3全家桶实战', payment_amount: 6900, goods_snap: { name: 'Vue3全家桶实战' } }] }
]

// C端用户
let mockAdminUsers = [
  { user_id: 1001, nick_name: '测试用户', mobile: '13800001111', sex: 1, status: 1, wechat_bind: false, create_at: now - day * 30, last_login_at: now - 60000 },
  { user_id: 1002, nick_name: '张三', mobile: '13900002222', sex: 1, status: 1, wechat_bind: true, create_at: now - day * 25, last_login_at: now - day * 2 },
  { user_id: 1003, nick_name: '李四', mobile: '13700003333', sex: 2, status: 1, wechat_bind: false, create_at: now - day * 20, last_login_at: now - day * 5 },
  { user_id: 1004, nick_name: '王五', mobile: '13600004444', sex: 1, status: -1, wechat_bind: false, create_at: now - day * 15, last_login_at: now - day * 10 },
  { user_id: 1005, nick_name: '赵六', mobile: '13500005555', sex: 2, status: 1, wechat_bind: true, create_at: now - day * 10, last_login_at: now - day * 1 },
  { user_id: 1006, nick_name: '孙七', mobile: '13400006666', sex: 1, status: -1, wechat_bind: false, create_at: now - day * 5, last_login_at: now - day * 3 }
]

// 系统设置
let mockAdminSettings = [
  { key: 'site_name', value: '在线教育商城', label: '站点名称' },
  { key: 'service_phone', value: '400-123-4567', label: '客服电话' },
  { key: 'announcement', value: '欢迎来到在线教育商城！', label: '站点公告' }
]

// 购物车 mock
let mockCartGoods = [
  // 初始为空，通过添加操作动态填充
]

// 订单 mock
let mockOrders = []
let mockFeeMap = {} // fee_uuid → course_ids 映射
let mockUserCourseGoods = [] // 已购课程

// 课时/目录 mock (课程详情用)
const mockCatalogs = [
  {
    course_id: 1, id: 1, name: '第一章：项目初始化', sort: 1, parent_id: -1, level: 1,
    lesson_count: 3,
    lessons: [
      { id: 1, lesson_id: 101, index: 1, name: '1-1 项目介绍', lesson_name: '项目介绍与环境搭建',
        detail: '介绍项目背景和环境配置', video_url: '', video_file_name: '', duration: 600,
        status: 1, show_time: 0, enable_trial: 1 },
      { id: 2, lesson_id: 102, index: 2, name: '1-2 Go Module', lesson_name: 'Go Module初始化',
        detail: 'Go Module 管理依赖', video_url: '', video_file_name: '', duration: 480,
        status: 1, show_time: 0, enable_trial: 0 },
      { id: 3, lesson_id: 103, index: 3, name: '1-3 目录结构', lesson_name: '项目目录结构设计',
        detail: '设计项目目录结构', video_url: '', video_file_name: '', duration: 520,
        status: 1, show_time: 0, enable_trial: 0 }
    ]
  },
  {
    course_id: 1, id: 2, name: '第二章：数据库设计', sort: 2, parent_id: -1, level: 1,
    lesson_count: 2,
    lessons: [
      { id: 4, lesson_id: 201, index: 1, name: '2-1 用户表', lesson_name: '用户表设计',
        detail: '用户相关表结构', video_url: '', video_file_name: '', duration: 580,
        status: 1, show_time: 0, enable_trial: 0 },
      { id: 5, lesson_id: 202, index: 2, name: '2-2 课程表', lesson_name: '课程表设计',
        detail: '课程相关表结构', video_url: '', video_file_name: '', duration: 620,
        status: 1, show_time: 0, enable_trial: 0 }
    ]
  },
  {
    course_id: 1, id: 3, name: '第三章：用户认证', sort: 3, parent_id: -1, level: 1,
    lesson_count: 2,
    lessons: [
      { id: 6, lesson_id: 301, index: 1, name: '3-1 手机登录', lesson_name: '手机号登录实现',
        detail: '手机号登录完整流程', video_url: '', video_file_name: '', duration: 800,
        status: 1, show_time: 0, enable_trial: 0 },
      { id: 7, lesson_id: 302, index: 2, name: '3-2 JWT Token', lesson_name: 'JWT Token生成与验证',
        detail: 'JWT 认证机制', video_url: '', video_file_name: '', duration: 650,
        status: 1, show_time: 0, enable_trial: 0 }
    ]
  }
]

const mockLessonInfo = {
  create_name: '管理员', update_name: '管理员',
  id: 101, name: '项目介绍与环境搭建',
  detail: '介绍项目背景和开发环境配置',
  category_id: 1, category_name: 'Go语言开发',
  video_key: '', video_url: '', video_file_name: '',
  attachments: [],
  duration: 600,
  chapters: [
    { id: 'ch1', name: '环境准备', begin_position: 0, end_position: 120 },
    { id: 'ch2', name: '项目初始化', begin_position: 120, end_position: 300 },
    { id: 'ch3', name: '第一行代码', begin_position: 300, end_position: 600 }
  ],
  status: 1,
  create_by: 1, update_by: 1,
  create_at: now - day * 10, update_at: now
}

const mockLearnInfo = {
  course_id: 1, lesson_id: 101,
  play_position: 150, learn_status: 1, last_type: 1,
  entry_time: now - 60000, last_report_time: now - 10000,
  in_learning: true
}

// ========== Mock API 处理器 ==========
const handlers = {
  // === 认证 ===
  'GET:/customer/v1/user/verify/captcha': () => resp(getMockCaptcha()),
  'POST:/customer/v1/user/verify/captcha/check': () => resp({ ticket: 'mock_ticket_' + Date.now(), expire: Date.now() + 300000 }),
  'POST:/customer/v1/user/verify/smscode': () => resp({ debug_verify_code: '123456' }),
  'POST:/customer/v1/user/mobile/password_login': () => resp(mockLoginResp),
  'POST:/customer/v1/user/mobile/verify_login': () => resp(mockLoginResp),
  'POST:/customer/v1/user/applet/login': () => resp(mockLoginResp),
  'POST:/customer/v1/user/mobile/reset_password': () => resp(null),
  'POST:/customer/v1/user/wechat/qrcode_login': () => resp({
    expire_in: 120, scene_token: 'mock_scene_' + Date.now(),
    qrcode_url: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#fff" width="200" height="200"/><text x="100" y="100" text-anchor="middle" fill="#333" font-size="14">微信登录(演示)</text></svg>')
  }),
  'GET:/customer/v1/user/wechat/qrcode_status': () => resp({ state: 'waiting', purpose: 'login', message: '等待扫码' }),
  'POST:/customer/v1/user/wechat/scan_confirm': () => resp({ state: 'confirmed', purpose: 'login', message: '已确认', token: 'mock_wechat_token_' + Date.now(), user_info: mockUserInfo }),

  // === 用户 ===
  'GET:/customer/v1/user/info': () => resp(mockUserInfo),
  'POST:/customer/v1/user/change_password': () => resp({ relogin_required: true }),
  'POST:/customer/v1/user/change_password/smscode': () => resp({ debug_verify_code: '123456' }),
  'POST:/customer/v1/user/wechat/qrcode_bind': () => resp({ expire_in: 120, scene_token: 'mock_bind_' + Date.now(), qrcode_url: '' }),
  'POST:/customer/v1/user/wechat/unbind': () => resp(null),

  // === 课程 ===
  'GET:/customer/v1/course/list': (params) => {
    let list = [...mockCourses]
    if (params.name_kw) list = list.filter(c => c.name.toLowerCase().includes(params.name_kw.toLowerCase()))
    if (params.status !== undefined && params.status !== null) list = list.filter(c => c.status === parseInt(params.status))
    if (params.update_status !== undefined && params.update_status !== null) list = list.filter(c => c.update_status === parseInt(params.update_status))
    if (params.is_recommend === 'true' || params.is_recommend === true) list = list.slice(0, 4)
    const page = parseInt(params.page) || 1
    const limit = parseInt(params.limit) || 10
    const start = (page - 1) * limit
    return resp({ page, limit, unlimited: false, list: list.slice(start, start + limit), total: list.length })
  },

  'GET:/customer/v1/course/detail': (params) => {
    const course = mockCourses.find(c => c.id === parseInt(params.id)) || mockCourses[0]
    return resp({
      ...course,
      total_duration: 7200, lesson_count: 48,
      catalogs: mockCatalogs
    })
  },

  'GET:/customer/v1/course/lesson/info': () => resp(mockLessonInfo),
  'GET:/customer/v1/course/lesson/learn_info': () => resp(mockLearnInfo),
  'POST:/customer/v1/course/lesson/learn_report': () => resp(null),
  'GET:/customer/v1/course/purchased/list': (params) => {
    const page = parseInt(params.page) || 1
    const limit = parseInt(params.limit) || 10
    const start = (page - 1) * limit
    return resp({ page, limit, unlimited: params.unlimited === 'true', list: mockUserCourseGoods.slice(start, start + limit), total: mockUserCourseGoods.length })
  },
  'GET:/customer/v1/course/continue/list': (params) => {
    const page = parseInt(params.page) || 1
    const limit = parseInt(params.limit) || 10
    return resp({ page, limit, unlimited: false, list: mockContinueLearn, total: mockContinueLearn.length })
  },

  // === 购物车 ===
  'POST:/customer/v1/cart/add_goods': (body) => {
    const course = mockCourses.find(c => c.id === body.goods_id)
    if (!course) return { code: 1, msg: '课程不存在', data: null }
    const exists = mockCartGoods.find(g => g.goods_id === body.goods_id)
    if (exists) return { code: 1, msg: '已在购物车中', data: null }
    const cartId = Date.now()
    mockCartGoods.push({
      cart_id: cartId, goods_id: course.id, quantity: 1,
      ...course
    })
    return resp({ id: cartId })
  },
  'POST:/customer/v1/cart/remove_goods': (body) => {
    mockCartGoods = mockCartGoods.filter(g => g.cart_id !== body.id)
    return resp(null)
  },
  'GET:/customer/v1/cart/list_goods': (params) => {
    const page = parseInt(params.page) || 1
    const limit = parseInt(params.limit) || 100
    return resp({ page, limit, unlimited: true, total: mockCartGoods.length, list: mockCartGoods })
  },

  // === 订单 ===
  'POST:/customer/v1/order/calc_fee': (body) => {
    const courseIds = body.course_ids || []
    const feeUuid = 'mock_fee_' + Date.now()
    const courseFees = courseIds.map(id => {
      const course = mockCourses.find(c => c.id === id)
      return {
        course_id: id, price: course?.course_price || 0,
        discount_fee: 0, pay_fee: course?.course_price || 0,
        goods_snap: course || {}
      }
    })
    const total = courseFees.reduce((s, f) => s + f.pay_fee, 0)
    // 保存 fee → courses 映射，payNow 时候用到
    mockFeeMap[feeUuid] = courseFees
    return resp({
      fee_uuid: feeUuid,
      total_fee: total, total_discount_fee: 0, total_pay_fee: total,
      expire_time: Date.now() + 600000,
      course_fees: courseFees
    })
  },
  'POST:/customer/v1/order/pay_now': (body) => {
    const orderId = Date.now()
    const now = Date.now()
    const courseFees = mockFeeMap[body.fee_uuid] || []

    // 写入已购课程
    courseFees.forEach(fee => {
      if (!mockUserCourseGoods.find(c => c.id === fee.course_id)) {
        const course = mockCourses.find(c => c.id === fee.course_id)
        if (course) {
          mockUserCourseGoods.unshift({
            ...course,
            has_purchased: true,
            service_expire_time: now + course.service_time * 86400000,
            learn_expire_time: now + course.learn_time * 86400000,
            purchase_time: now
          })
        }
      }
    })

    const order = {
      id: orderId, status: 2, order_amount: courseFees.reduce((s, f) => s + f.price, 0),
      discount_amount: 0, payment_amount: courseFees.reduce((s, f) => s + f.pay_fee, 0),
      order_source: 1, trade_no: 'mock_trade_' + orderId,
      inner_trade_no: 'mock_inner_' + orderId,
      order_desc: '', payment_at: now, user_remark: body.remark || '',
      create_at: now, items: courseFees.map(f => ({ goods_id: f.course_id, payment_amount: f.pay_fee, goods_snap: f.goods_snap })), refunds: []
    }
    mockOrders.unshift(order)
    return resp({
      order_id: orderId,
      appId: '', timeStamp: '', nonceStr: '', package: '', signType: '', paySign: '',
      code_url: '', trade_type: 'NATIVE'
    })
  },
  'POST:/customer/v1/order/pay_later': (body) => {
    const order = mockOrders.find(o => o.id === body.order_id)
    if (order) {
      order.status = 2
      order.payment_at = Date.now()
      // 写入已购课程
      const now = Date.now();
      (order.items || []).forEach(item => {
        const courseId = item.goods_id
        if (courseId && !mockUserCourseGoods.find(c => c.id === courseId)) {
          const course = mockCourses.find(c => c.id === courseId)
          if (course) {
            mockUserCourseGoods.unshift({
              ...course,
              has_purchased: true,
              service_expire_time: now + course.service_time * 86400000,
              learn_expire_time: now + course.learn_time * 86400000
            })
          }
        }
      })
    }
    return resp({
      order_id: body.order_id,
      appId: '', timeStamp: '', nonceStr: '', package: '', signType: '', paySign: '',
      code_url: '', trade_type: 'NATIVE'
    })
  },
  'POST:/customer/v1/order/cancel': (body) => {
    const order = mockOrders.find(o => o.id === body.order_id)
    if (order) order.status = -1
    return resp(null)
  },
  'GET:/customer/v1/order/list': (params) => {
    let list = [...mockOrders]
    if (params.status !== undefined && params.status !== null) {
      list = list.filter(o => o.status === parseInt(params.status))
    }
    if (params.status_list) {
      const statuses = params.status_list.split(',').map(Number)
      list = list.filter(o => statuses.includes(o.status))
    }
    const page = parseInt(params.page) || 1
    const limit = parseInt(params.limit) || 10
    return resp({ page, limit, unlimited: false, total: list.length, list })
  },
  'GET:/customer/v1/order/info': (params) => {
    const order = mockOrders.find(o => o.id === parseInt(params.order_id))
    return resp(order || mockOrders[0] || null)
  },

  // ==================== 管理端 Mock ====================

  // === 认证 ===
  'GET:/admin/v1/user/verify/captcha': () => resp(getMockCaptcha()),
  'POST:/admin/v1/user/verify/captcha/check': () => resp({ ticket: 'mock_admin_ticket_' + Date.now(), expire: Date.now() + 300000 }),
  'POST:/admin/v1/user/verify/smscode': () => resp({ debug_verify_code: '123456' }),
  'POST:/admin/v1/user/mobile/password_login': () => resp({
    token: 'mock_admin_token_' + Date.now(),
    user_info: { user: { user_id: 1, nick_name: '超级管理员', icon_url: '', sex: 1, status: 1, last_login_at: Date.now(), update_at: Date.now(), wechat_bind: false, can_unbind_wechat: false, has_password: true, create_at: Date.now() - 86400000 * 30 }, mobile_user: { mobile: '13800000000', user_id: 1 }, wechat_user: null, app_users: [] }
  }),
  'POST:/admin/v1/user/mobile/verify_login': (body) => {
    if (body.verify_code !== '123456') return { code: 1, msg: '验证码错误', data: null }
    return resp({ token: 'mock_admin_token_' + Date.now(), user_info: { user: { user_id: 1, nick_name: '超级管理员', icon_url: '', sex: 1, status: 1, last_login_at: Date.now(), update_at: Date.now(), wechat_bind: false, can_unbind_wechat: false, has_password: true, create_at: Date.now() - 86400000 * 30 }, mobile_user: { mobile: body.mobile, user_id: 1 }, wechat_user: null, app_users: [] } })
  },
  'GET:/admin/v1/user/info': () => resp({ user_info: { user: { user_id: 1, nick_name: '超级管理员', icon_url: '', sex: 1, status: 1, last_login_at: Date.now(), update_at: Date.now(), wechat_bind: false, can_unbind_wechat: false, has_password: true, create_at: Date.now() - 86400000 * 30 }, mobile_user: { mobile: '13800000000', user_id: 1 }, wechat_user: null, app_users: [] } }),
  'GET:/admin/v1/perm/my_perms': () => resp({ perms: [{ id: 1, code: 'dashboard', name: '工作台' }, { id: 2, code: 'course', name: '课程管理' }, { id: 3, code: 'lesson', name: '课时管理' }, { id: 4, code: 'order', name: '订单管理' }, { id: 5, code: 'user', name: '用户管理' }], roles: [{ id: 1, name: '超级管理员' }] }),
  'POST:/admin/v1/user/logout': () => resp(null),

  // === 课程管理 ===
  'GET:/admin/v1/course/list': (params) => {
    let list = [...mockCourses]
    if (params.name_kw) list = list.filter(c => c.name.toLowerCase().includes(params.name_kw.toLowerCase()))
    if (params.status !== undefined && params.status !== null) list = list.filter(c => c.status === parseInt(params.status))
    const page = parseInt(params.page) || 1; const limit = parseInt(params.limit) || 10
    return resp({ page, limit, total: list.length, list: list.slice((page - 1) * limit, page * limit) })
  },
  'GET:/admin/v1/course/info': (params) => {
    const c = mockCourses.find(c => c.id === parseInt(params.id))
    return c ? resp({ ...c, total_duration: 7200, lesson_count: 48, catalogs: mockCatalogs }) : { code: 1, msg: '课程不存在', data: null }
  },
  'POST:/admin/v1/course/create': (body) => {
    const nc = { id: Math.max(...mockCourses.map(c => c.id)) + 1, name: body.name, course_price: body.course_price || 0, service_time: body.service_time || 365, learn_time: body.learn_time || 30, sort: mockCourses.length + 1, status: body.status || 1, features: body.features || [], update_status: body.update_status || 1, cover_url: body.cover_url || '', detail_cover_url: body.detail_cover_url || '', detail: body.detail || '', create_at: Date.now(), update_at: Date.now(), create_name: '管理员', update_name: '管理员', has_purchased: false }
    mockCourses.unshift(nc); return resp({ id: nc.id })
  },
  'POST:/admin/v1/course/update': (body) => {
    const i = mockCourses.findIndex(c => c.id === body.id)
    if (i === -1) return { code: 1, msg: '课程不存在', data: null }
    mockCourses[i] = { ...mockCourses[i], ...body, update_at: Date.now() }; return resp(null)
  },
  'POST:/admin/v1/course/update_status': (body) => {
    const c = mockCourses.find(c => c.id === body.id)
    if (c) c.status = body.status; return resp(null)
  },

  // === 课时分类 ===
  'GET:/admin/v1/lesson/category/list': () => resp({ list: mockAdminCategories, total: mockAdminCategories.length }),
  'POST:/admin/v1/lesson/category/create': (body) => {
    const nc = { id: Math.max(...mockAdminCategories.map(c => c.id)) + 1, name: body.name, parent_id: body.parent_id ?? -1, level: body.level ?? 1, sort: mockAdminCategories.length + 1, status: 1, create_at: Date.now(), update_at: Date.now() }
    mockAdminCategories.push(nc); return resp({ id: nc.id })
  },
  'POST:/admin/v1/lesson/category/update': (body) => { const c = mockAdminCategories.find(c => c.id === body.id); if (c) Object.assign(c, body); return resp(null) },
  'POST:/admin/v1/lesson/category/delete': (body) => { const ids = body.ids || []; mockAdminCategories = mockAdminCategories.filter(c => !ids.includes(c.id)); return resp(null) },
  'POST:/admin/v1/lesson/category/update_sort': () => resp(null),

  // === 课时 ===
  'POST:/admin/v1/lesson/list': (params) => {
    let list = [...mockAdminLessons]
    if (params.category_id) list = list.filter(l => l.category_id === params.category_id)
    if (params.name_kw) list = list.filter(l => l.name.includes(params.name_kw))
    if (params.status !== undefined && params.status !== null) list = list.filter(l => l.status === params.status)
    const page = parseInt(params.page) || 1; const limit = parseInt(params.limit) || 10
    return resp({ page, limit, total: list.length, list: list.slice((page - 1) * limit, page * limit) })
  },
  'GET:/admin/v1/lesson/info': (params) => {
    const l = mockAdminLessons.find(l => l.id === parseInt(params.lesson_id))
    return l ? resp({ ...l, chapters: [], attachments: [] }) : { code: 1, msg: '课时不存在', data: null }
  },
  'POST:/admin/v1/lesson/create': (body) => {
    const nl = { id: Math.max(...mockAdminLessons.map(l => l.id)) + 1, name: body.name, detail: body.detail || '', category_id: body.category_id || -1, category_name: mockAdminCategories.find(c => c.id === body.category_id)?.name || '未分类', duration: body.duration || 0, status: 1, create_at: Date.now(), update_at: Date.now() }
    mockAdminLessons.unshift(nl); return resp({ id: nl.id })
  },
  'POST:/admin/v1/lesson/update': (body) => { const i = mockAdminLessons.findIndex(l => l.id === body.id); if (i !== -1) mockAdminLessons[i] = { ...mockAdminLessons[i], ...body, update_at: Date.now() }; return resp(null) },
  'POST:/admin/v1/lesson/update_status': (body) => { const l = mockAdminLessons.find(l => l.id === body.id); if (l) l.status = body.status; return resp(null) },
  'POST:/admin/v1/lesson/move': (body) => { const { ids, category_id } = body; const tc = mockAdminCategories.find(c => c.id === category_id); mockAdminLessons.forEach(l => { if ((ids || []).includes(l.id)) { l.category_id = category_id; l.category_name = tc?.name || '未分类' } }); return resp(null) },

  // === 订单管理 ===
  'GET:/admin/v1/order/list': (params) => {
    let list = [...mockAdminOrders]
    if (params.order_id) list = list.filter(o => String(o.id).includes(params.order_id))
    if (params.status !== undefined && params.status !== null) list = list.filter(o => o.status === parseInt(params.status))
    if (params.user_mobile) list = list.filter(o => o.user_mobile?.includes(params.user_mobile))
    const page = parseInt(params.page) || 1; const limit = parseInt(params.limit) || 10
    return resp({ page, limit, total: list.length, list: list.slice((page - 1) * limit, page * limit) })
  },
  'GET:/admin/v1/order/info': (params) => {
    const o = mockAdminOrders.find(o => o.id === parseInt(params.order_id))
    return o ? resp(o) : { code: 1, msg: '订单不存在', data: null }
  },
  'POST:/admin/v1/order/refund': (body) => {
    const o = mockAdminOrders.find(o => o.id === body.order_id)
    if (!o) return { code: 1, msg: '订单不存在', data: null }
    if (o.status !== 2) return { code: 1, msg: '仅已支付订单可退款', data: null }
    o.status = 3; return resp(null)
  },

  // === 用户管理 ===
  'GET:/admin/v1/user/list': (params) => {
    let list = [...mockAdminUsers]
    if (params.nick_name_kw) list = list.filter(u => u.nick_name.toLowerCase().includes(params.nick_name_kw.toLowerCase()))
    if (params.mobile) list = list.filter(u => u.mobile?.includes(params.mobile))
    if (params.status !== undefined && params.status !== null) list = list.filter(u => u.status === parseInt(params.status))
    const page = parseInt(params.page) || 1; const limit = parseInt(params.limit) || 10
    return resp({ page, limit, total: list.length, list: list.slice((page - 1) * limit, page * limit) })
  },
  'GET:/admin/v1/user/info': (params) => {
    const u = mockAdminUsers.find(u => u.user_id === parseInt(params.user_id))
    return u ? resp(u) : { code: 1, msg: '用户不存在', data: null }
  },
  'POST:/admin/v1/user/update_status': (body) => {
    const u = mockAdminUsers.find(u => u.user_id === body.user_id)
    if (!u) return { code: 1, msg: '用户不存在', data: null }
    u.status = body.status; return resp(null)
  },

  // === 系统设置 ===
  'GET:/admin/v1/setting/list': () => resp({ list: mockAdminSettings }),
  'POST:/admin/v1/setting/update': (body) => {
    Object.entries(body).forEach(([k, v]) => { const s = mockAdminSettings.find(s => s.key === k); if (s) s.value = v })
    return resp(null)
  },

  // === 微信回调（mock 忽略） ===
  'POST:/customer/v1/wechat/callback/payment': () => resp(null),
  'POST:/customer/v1/wechat/callback/refund': () => resp(null)
}

// ========== Mock 请求拦截器 ==========
export async function mockRequest(url, options = {}) {
  const method = options.method || 'GET'
  let body = null
  if (options.body) {
    try { body = JSON.parse(options.body) } catch (e) { body = null }
  }

  // 从完整 URL 中提取路径
  const path = url.replace('/api/mall', '').replace(/\?.*$/, '')

  // 解析查询参数
  const queryStr = url.includes('?') ? url.split('?')[1] : ''
  const params = {}
  queryStr.split('&').forEach(pair => {
    const [k, v] = pair.split('=')
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '')
  })

  const key = `${method}:${path}`
  console.log(`[Mock API] ${method} ${path}`, params, body)

  // 模拟网络延迟
  await new Promise(r => setTimeout(r, 200 + Math.random() * 300))

  if (handlers[key]) {
    const data = method === 'GET' ? params : body
    return handlers[key](data)
  }

  console.warn(`[Mock API] 未匹配的路由: ${key}`)
  return { code: 1, msg: `未实现的 mock: ${key}`, data: null }
}

// 检查是否启用 mock 模式
export function isMockEnabled() {
  return import.meta.env.VITE_USE_MOCK === 'true' ||
         import.meta.env.DEV  // 开发环境默认启用
}
