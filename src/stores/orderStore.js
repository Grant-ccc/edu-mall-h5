// 订单状态管理
// 使用 localStorage 持久化

import userCourseStore from './userCourseStore'

const ORDER_KEY = 'edu_mall_orders'

// 订单状态枚举
export const OrderStatus = {
  CANCELLED: -1,  // 已取消
  PENDING: 1,     // 待支付
  PAID: 2,        // 已支付
  REFUNDED: 3,    // 已退款
  SHIPPED: 4,     // 已发货
  RECEIVED: 5,    // 已签收
  COMPLETED: 6    // 已完成
}

// 状态文字映射
export const OrderStatusText = {
  [-1]: '已取消',
  1: '待支付',
  2: '已支付',
  3: '已退款',
  4: '已发货',
  5: '已签收',
  6: '已完成'
}

// 状态颜色映射
export const OrderStatusColor = {
  [-1]: 'default',
  1: 'warning',
  2: 'success',
  3: 'error',
  4: 'processing',
  5: 'success',
  6: 'success'
}

// 生成订单号
function generateOrderNo() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `${year}${month}${day}${random}`
}

// 获取初始状态
function getInitialState() {
  const orderStr = localStorage.getItem(ORDER_KEY)
  let orders = []
  try {
    const data = orderStr ? JSON.parse(orderStr) : { orders: [] }
    orders = data.orders || []
  } catch (e) {
    orders = []
  }
  return { orders }
}

// 简单状态管理
let state = getInitialState()
const listeners = new Set()

function notify() {
  listeners.forEach(listener => listener(state))
}

function persist() {
  localStorage.setItem(ORDER_KEY, JSON.stringify({ orders: state.orders }))
}

export const orderStore = {
  getState() {
    return state
  },

  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  // 创建订单
  createOrder(items) {
    const newOrder = {
      id: Date.now(),
      order_no: generateOrderNo(),
      status: OrderStatus.PENDING,
      items: items.map(item => ({
        goods_id: item.id,
        name: item.name,
        price: item.course_price,
        cover_url: item.cover_url || ''
      })),
      total_amount: items.reduce((sum, item) => sum + item.course_price, 0),
      payment_amount: items.reduce((sum, item) => sum + item.course_price, 0),
      create_at: Date.now(),
      pay_at: null,
      cancel_at: null,
      cancel_reason: null,
      refund_at: null,
      refund_reason: null
    }

    state = {
      orders: [newOrder, ...state.orders]
    }

    persist()
    notify()
    return newOrder
  },

  // 获取订单列表
  getOrders() {
    return state.orders
  },

  // 根据状态筛选订单
  getOrdersByStatus(status) {
    if (status === null || status === undefined) {
      return state.orders
    }
    return state.orders.filter(order => order.status === status)
  },

  // 获取订单详情
  getOrder(orderId) {
    return state.orders.find(order => order.id === parseInt(orderId))
  },

  // 支付订单（演示模式：直接成功）
  payOrder(orderId) {
    const order = this.getOrder(orderId)
    if (!order) {
      return { success: false, message: '订单不存在' }
    }
    if (order.status !== OrderStatus.PENDING) {
      return { success: false, message: '订单状态不正确' }
    }

    // 更新订单状态
    order.status = OrderStatus.PAID
    order.pay_at = Date.now()

    // 添加课程权益到用户课程列表
    userCourseStore.addCourses(order.items)

    persist()
    notify()
    return { success: true }
  },

  // 取消订单
  cancelOrder(orderId, reason = '用户取消') {
    const order = this.getOrder(orderId)
    if (!order) {
      return { success: false, message: '订单不存在' }
    }
    if (order.status !== OrderStatus.PENDING) {
      return { success: false, message: '只能取消待支付订单' }
    }

    order.status = OrderStatus.CANCELLED
    order.cancel_at = Date.now()
    order.cancel_reason = reason

    persist()
    notify()
    return { success: true }
  },

  // 完成订单（支付成功后）
  completeOrder(orderId) {
    const order = this.getOrder(orderId)
    if (!order) return { success: false }

    order.status = OrderStatus.COMPLETED
    persist()
    notify()
    return { success: true }
  },

  // 申请退款
  refundOrder(orderId, reason = '用户申请退款') {
    const order = this.getOrder(orderId)
    if (!order) return { success: false, message: '订单不存在' }
    if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.COMPLETED) {
      return { success: false, message: '只能对已支付订单申请退款' }
    }

    order.status = OrderStatus.REFUNDED
    order.refund_at = Date.now()
    order.refund_reason = reason

    // 移除课程权益
    userCourseStore.removeCourses(order.items.map(item => item.goods_id))

    persist()
    notify()
    return { success: true }
  }
}

export default orderStore
