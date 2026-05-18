import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Tag, Button, Timeline, Empty, Popconfirm, message, Spin } from 'antd'
import ClientLayout from '../../layouts/ClientLayout'
import { getOrderInfo, cancelOrder } from '../../api/order'
import './index.css'

// 订单状态枚举
const OrderStatus = {
  CANCELLED: -1, PENDING: 1, PAID: 2, REFUNDED: 3,
  SHIPPED: 4, RECEIVED: 5, COMPLETED: 6
}

const OrderStatusText = {
  [-1]: '已取消', 1: '待支付', 2: '已支付', 3: '已退款',
  4: '已发货', 5: '已签收', 6: '已完成'
}

const OrderStatusColor = {
  [-1]: 'default', 1: 'warning', 2: 'success', 3: 'error',
  4: 'processing', 5: 'success', 6: 'success'
}

function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getOrderInfo(orderId)
      .then(data => setOrder(data))
      .catch(() => message.error('获取订单详情失败'))
      .finally(() => setLoading(false))
  }, [orderId])

  // 价格显示
  const formatPrice = (price) => (price / 100).toFixed(2)

  // 时间格式化
  const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN')
  }

  // 取消订单
  const handleCancel = async () => {
    try {
      await cancelOrder(orderId, '用户取消')
      message.success('订单已取消')
      // 重新加载
      getOrderInfo(orderId).then(data => setOrder(data))
    } catch (error) {
      message.error('取消失败')
    }
  }

  // 继续支付
  const handlePay = () => {
    navigate(`/pay/${orderId}`)
  }

  // 返回列表
  const handleBack = () => {
    navigate('/me/orders')
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="order-detail-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '120px 0' }}>
          <Spin size="large" />
        </div>
      </ClientLayout>
    )
  }

  if (!order) {
    return (
      <ClientLayout>
        <div className="order-detail-page">
          <div className="order-detail-container">
            <Card>
              <Empty description="订单不存在">
                <Button onClick={handleBack}>返回订单列表</Button>
              </Empty>
            </Card>
          </div>
        </div>
      </ClientLayout>
    )
  }

  // 时间线
  const timelineItems = [
    {
      color: 'green',
      children: `创建订单 ${formatTime(order.create_at)}`
    }
  ]

  if (order.payment_at) {
    timelineItems.push({
      color: 'green',
      children: `支付成功 ${formatTime(order.payment_at)}`
    })
  }

  if (order.status === OrderStatus.CANCELLED) {
    timelineItems.push({
      color: 'red',
      children: `订单取消 ${formatTime(order.cancel_at)}${order.cancel_reason ? `（${order.cancel_reason}）` : ''}`
    })
  }

  if (order.status === OrderStatus.REFUNDED) {
    if (order.payment_at) {
      timelineItems.push({
        color: 'green',
        children: `支付成功 ${formatTime(order.payment_at)}`
      })
    }
    timelineItems.push({
      color: 'red',
      children: `已退款 ${formatTime(order.refund_at)}`
    })
  }

  return (
    <ClientLayout>
      <div className="order-detail-page">
        <div className="order-detail-container">
          <div className="order-detail-header">
            <h2>订单详情</h2>
            <Button onClick={handleBack}>返回列表</Button>
          </div>

          {/* 订单状态 */}
          <Card className="order-detail-status-card">
            <div className="order-status-info">
              <Tag color={OrderStatusColor[order.status]} style={{ fontSize: 16, padding: '4px 12px' }}>
                {OrderStatusText[order.status]}
              </Tag>
              <span className="order-no">订单号：{order.id}</span>
            </div>
          </Card>

          {/* 基本信息 */}
          <Card title="订单信息" className="order-detail-card">
            <Descriptions column={2}>
              <Descriptions.Item label="订单号">{order.id}</Descriptions.Item>
              <Descriptions.Item label="订单状态">
                <Tag color={OrderStatusColor[order.status]}>{OrderStatusText[order.status]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{formatTime(order.create_at)}</Descriptions.Item>
              <Descriptions.Item label="支付时间">{formatTime(order.payment_at)}</Descriptions.Item>
              <Descriptions.Item label="订单金额">¥{formatPrice(order.order_amount)}</Descriptions.Item>
              <Descriptions.Item label="实付金额">
                <span style={{ color: '#ff4d4f', fontWeight: 600 }}>
                  ¥{formatPrice(order.payment_amount)}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 商品信息 */}
          <Card title="商品信息" className="order-detail-card">
            {(order.items || []).map((item, index) => (
              <div key={item.id || index} className="order-detail-goods-item">
                <div className="goods-cover">课程</div>
                <div className="goods-info">
                  <div className="goods-name">{item.goods_snap?.name || `商品 ${item.goods_id}`}</div>
                  <div className="goods-price">¥{formatPrice(item.payment_amount)}</div>
                </div>
              </div>
            ))}
          </Card>

          {/* 订单进度 */}
          <Card title="订单进度" className="order-detail-card">
            <Timeline items={timelineItems} />
          </Card>

          {/* 操作按钮 */}
          <Card className="order-detail-card">
            <div className="order-detail-actions">
              {order.status === OrderStatus.PENDING && (
                <>
                  <Button type="primary" onClick={handlePay}>继续支付</Button>
                  <Popconfirm title="确定取消订单？" onConfirm={handleCancel}>
                    <Button>取消订单</Button>
                  </Popconfirm>
                </>
              )}
              {(order.status === OrderStatus.PAID || order.status === OrderStatus.COMPLETED) && (
                <Button type="primary" onClick={() => navigate('/me/courses')}>去学习</Button>
              )}
              {order.status === OrderStatus.REFUNDED && (
                <Button onClick={() => navigate('/')}>重新购买</Button>
              )}
              {order.status === OrderStatus.CANCELLED && (
                <Button onClick={() => navigate('/')}>重新购买</Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </ClientLayout>
  )
}

export default OrderDetail
