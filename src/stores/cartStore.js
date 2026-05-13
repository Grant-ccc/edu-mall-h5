// 购物车状态管理
// 使用 localStorage 持久化

const CART_KEY = 'edu_mall_cart'

// 获取初始状态
function getInitialState() {
  const cartStr = localStorage.getItem(CART_KEY)
  let items = []
  try {
    const data = cartStr ? JSON.parse(cartStr) : { items: [] }
    items = data.items || []
  } catch (e) {
    items = []
  }
  return {
    items,
    count: items.length
  }
}

// 简单状态管理
let state = getInitialState()
const listeners = new Set()

function notify() {
  listeners.forEach(listener => listener(state))
}

function persist() {
  localStorage.setItem(CART_KEY, JSON.stringify({ items: state.items }))
}

export const cartStore = {
  getState() {
    return state
  },

  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  // 获取购物车数量
  getCount() {
    return state.count
  },

  // 检查商品是否已在购物车
  hasItem(goodsId) {
    return state.items.some(item => item.goods_id === goodsId)
  },

  // 添加商品到购物车
  addItem(course) {
    // 检查是否已存在
    if (this.hasItem(course.id)) {
      return { success: false, message: '该课程已在购物车' }
    }

    const newItem = {
      cart_id: Date.now(),
      goods_id: course.id,
      name: course.name,
      cover_url: course.cover_url || '',
      course_price: course.course_price,
      features: course.features || [],
      learn_time: course.learn_time,
      service_time: course.service_time,
      update_status: course.update_status,
      quantity: 1,
      status: 1 // 1=正常, -1=失效
    }

    state = {
      items: [...state.items, newItem],
      count: state.count + 1
    }

    persist()
    notify()
    return { success: true, cartId: newItem.cart_id }
  },

  // 从购物车移除商品
  removeItem(cartId) {
    const index = state.items.findIndex(item => item.cart_id === cartId)
    if (index === -1) {
      return { success: false, message: '商品不存在' }
    }

    state = {
      items: state.items.filter(item => item.cart_id !== cartId),
      count: state.count - 1
    }

    persist()
    notify()
    return { success: true }
  },

  // 批量移除商品
  removeItems(cartIds) {
    state = {
      items: state.items.filter(item => !cartIds.includes(item.cart_id)),
      count: state.count - cartIds.length
    }

    persist()
    notify()
    return { success: true }
  },

  // 清空购物车
  clearCart() {
    state = {
      items: [],
      count: 0
    }

    persist()
    notify()
    return { success: true }
  },

  // 按 goods_id 移除商品（用于订单创建后清理购物车）
  removeByGoodsIds(goodsIds) {
    const toRemove = state.items.filter(item => goodsIds.includes(item.goods_id))
    if (toRemove.length === 0) return { success: true, removed: 0 }

    state = {
      items: state.items.filter(item => !goodsIds.includes(item.goods_id)),
      count: state.count - toRemove.length
    }

    persist()
    notify()
    return { success: true, removed: toRemove.length }
  },

  // 获取选中商品总价
  getSelectedTotal(selectedIds) {
    return state.items
      .filter(item => selectedIds.includes(item.cart_id))
      .reduce((sum, item) => sum + item.course_price, 0)
  },

  // 获取选中商品列表
  getSelectedItems(selectedIds) {
    return state.items.filter(item => selectedIds.includes(item.cart_id))
  }
}

export default cartStore
