// 购物车状态管理
// 基于 API 调用，本地维护状态用于 UI 响应

import { listGoods, addGoods, removeGoods } from '../api/cart'

let state = {
  items: [],
  count: 0
}

const listeners = new Set()

function notify() {
  listeners.forEach(listener => listener(state))
}

function setState(newState) {
  state = { ...state, ...newState }
  notify()
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

  // 从 API 加载购物车列表
  async fetchCartList() {
    try {
      const data = await listGoods({ unlimited: true })
      const items = (data.list || []).filter(item => item.status === 1)
      setState({ items, count: items.length })
    } catch (error) {
      console.error('获取购物车列表失败:', error)
      throw error
    }
  },

  // 添加商品到购物车
  async addItem(course) {
    if (this.hasItem(course.id)) {
      return { success: false, message: '该课程已在购物车' }
    }
    try {
      await addGoods(course.id)
      // 重新加载购物车列表
      await this.fetchCartList()
      return { success: true }
    } catch (error) {
      console.error('添加购物车失败:', error)
      return { success: false, message: '添加失败' }
    }
  },

  // 从购物车移除商品
  async removeItem(cartId) {
    try {
      await removeGoods(cartId)
      // 重新加载购物车列表
      await this.fetchCartList()
      return { success: true }
    } catch (error) {
      console.error('移除购物车失败:', error)
      return { success: false, message: '移除失败' }
    }
  },

  // 批量移除商品
  async removeItems(cartIds) {
    try {
      await Promise.all(cartIds.map(id => removeGoods(id)))
      await this.fetchCartList()
      return { success: true }
    } catch (error) {
      console.error('批量移除失败:', error)
      return { success: false, message: '移除失败' }
    }
  },

  // 清空购物车
  async clearCart() {
    const ids = state.items.map(item => item.cart_id)
    if (ids.length === 0) return { success: true }
    return this.removeItems(ids)
  },

  // 获取选中商品总价
  getSelectedTotal(selectedIds) {
    return state.items
      .filter(item => selectedIds.includes(item.cart_id))
      .reduce((sum, item) => sum + (item.course_price || 0), 0)
  },

  // 获取选中商品列表
  getSelectedItems(selectedIds) {
    return state.items.filter(item => selectedIds.includes(item.cart_id))
  }
}

export default cartStore