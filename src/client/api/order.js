// 订单相关 API
import { get, post } from './request'

// 计算订单价格
export function calcFee(course_ids, platform = 'h5') {
  return post('/customer/v1/order/calc_fee', { course_ids, platform })
}

// 立即创建订单并发起支付
export function payNow(fee_uuid, remark = '', platform = 'h5') {
  return post('/customer/v1/order/pay_now', { fee_uuid, remark, platform })
}

// 从订单列表发起支付
export function payLater(order_id, platform = 'h5') {
  return post('/customer/v1/order/pay_later', { order_id, platform })
}

// 取消订单
export function cancelOrder(order_id, reason = '') {
  return post('/customer/v1/order/cancel', { order_id, reason })
}

// 我的订单列表
export function getOrderList(params = {}) {
  const queryParams = {
    page: params.page || 1,
    limit: params.limit || 10
  }
  // 可选筛选参数
  if (params.order_id) queryParams.order_id = params.order_id
  if (params.status !== undefined && params.status !== null) queryParams.status = params.status
  if (params.status_list) queryParams.status_list = params.status_list
  if (params.goods_name_kw) queryParams.goods_name_kw = params.goods_name_kw
  if (params.create_start) queryParams.create_start = params.create_start
  if (params.create_end) queryParams.create_end = params.create_end
  if (params.payment_start) queryParams.payment_start = params.payment_start
  if (params.payment_end) queryParams.payment_end = params.payment_end
  if (params.refund_start) queryParams.refund_start = params.refund_start
  if (params.refund_end) queryParams.refund_end = params.refund_end

  return get('/customer/v1/order/list', queryParams)
}

// 订单详情
export function getOrderInfo(order_id) {
  return get('/customer/v1/order/info', { order_id })
}

export default {
  calcFee,
  payNow,
  payLater,
  cancelOrder,
  getOrderList,
  getOrderInfo
}