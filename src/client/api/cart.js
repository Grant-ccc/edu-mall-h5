// 购物车相关 API
import { get, post } from './request'

// 添加商品到购物车
export function addGoods(goods_id) {
  return post('/customer/v1/cart/add_goods', { goods_id })
}

// 删除购物车商品
export function removeGoods(id) {
  return post('/customer/v1/cart/remove_goods', { id })
}

// 购物车商品列表
export function listGoods(params = {}) {
  const queryParams = {
    page: params.page || 1,
    limit: params.limit || 100,
    unlimited: params.unlimited || true
  }
  if (params.goods_name_kw) {
    queryParams.goods_name_kw = params.goods_name_kw
  }
  return get('/customer/v1/cart/list_goods', queryParams)
}

export default {
  addGoods,
  removeGoods,
  listGoods
}