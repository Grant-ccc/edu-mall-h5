// 管理端 - 订单管理 API
import { get, post } from '../../client/api/request'

export function getOrderList(params = {}) {
  const query = { page: params.page || 1, limit: params.limit || 10 }
  if (params.order_id) query.order_id = params.order_id
  if (params.status !== undefined && params.status !== null) query.status = params.status
  if (params.user_mobile) query.user_mobile = params.user_mobile
  if (params.create_start) query.create_start = params.create_start
  if (params.create_end) query.create_end = params.create_end
  return get('/admin/v1/order/list', query)
}

export function getOrderInfo(order_id) {
  return get('/admin/v1/order/info', { order_id })
}

export function refundOrder(order_id, reason = '') {
  return post('/admin/v1/order/refund', { order_id, reason })
}

export default { getOrderList, getOrderInfo, refundOrder }
