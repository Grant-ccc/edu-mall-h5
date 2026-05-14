import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, Card, Tag, Button, Empty, Popconfirm, message } from 'antd'
import ClientLayout from '../../layouts/ClientLayout'
import authStore from '../../stores/authStore'
import orderStore, { OrderStatus, OrderStatusText, OrderStatusColor } from '../../stores/orderStore'
import './index.css'

function MyOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (!authStore.isLogin()) {
      navigate('/login')
      return
    }

    // 初始加载订单
    setOrders(orderStore.getOrders())

    // 订阅订单变化
    const unsubscribe = orderStore.subscribe((state) => {
      setOrders(state.orders)
    })

    return unsubscribe
  }, [])

  // 价格显示
  const formatPrice = (price) => (price / 100).toFixed(2)

  // 时间格式化
  const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN')
  }

  // 根据Tab筛选订单
  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'pending':
        return orders.filter(o => o.status === OrderStatus.PENDING)
      case 'paid':
        return orders.filter(o => o.status === OrderStatus.PAID || o.status === OrderStatus.COMPLETED)
      case 'refunded':
        return orders.filter(o => o.status === OrderStatus.REFUNDED)
      case 'cancelled':
        return orders.filter(o => o.status === OrderStatus.CANCELLED)
      default:
        return orders
    }
  }

  const filteredOrders = getFilteredOrders()

  // 取消订单
  const handleCancel = (orderId) => {
    const result = orderStore.cancelOrder(orderId)
    if (result.success) {
      message.success('订单已取消')
    } else {
      message.error(result.message)
    }
  }

  // 继续支付
  const handlePay = (orderId) => {
    navigate(`/pay/${orderId}`)
  }

  // 查看详情
  const handleDetail = (orderId) => {
    navigate(`/me/orders/${orderId}`)
  }

  // 申请退款
  const handleRefund = (orderId) => {
    const result = orderStore.refundOrder(orderId)
    if (result.success) {
      message.success('退款成功，课程权益已移除')
    } else {
      message.error(result.message)
    }
  }

  // Tab项
  const tabItems = [
    { key: 'all', label: `全部 (${orders.length})` },
    { key: 'pending', label: `待支付 (${orders.filter(o => o.status === OrderStatus.PENDING).length})` },
    { key: 'paid', label: `已支付 (${orders.filter(o => o.status === OrderStatus.PAID || o.status === OrderStatus.COMPLETED).length})` },
    { key: 'refunded', label: `已退款 (${orders.filter(o => o.status === OrderStatus.REFUNDED).length})` },
    { key: 'cancelled', label: `已取消 (${orders.filter(o => o.status === OrderStatus.CANCELLED).length})` }
  ]

  return (
    <ClientLayout>
      <div className="my-orders-page">
        <div className="my-orders-container">
          <div className="my-orders-header">
            <h2>我的订单</h2>
          </div>

          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

          {filteredOrders.length === 0 ? (
            <Card className="orders-empty">
              <Empty description="暂无订单记录">
                <Button onClick={() => navigate('/')}>去逛逛</Button>
              </Empty>
            </Card>
          ) : (
            filteredOrders.map(order => (
              <Card key={order.id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-card-no">订单号：{order.order_no}</span>
                    <span className="order-card-time">{formatTime(order.create_at)}</span>
                  </div>
                  <Tag color={OrderStatusColor[order.status]}>
                    {OrderStatusText[order.status]}
                  </Tag>
                </div>

                <div className="order-card-body">
                  <div className="order-goods-list">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-goods-item">
                        <div className="order-goods-cover">课程</div>
                        <div className="order-goods-info">
                          <div className="order-goods-name">{item.name}</div>
                          <div className="order-goods-price">¥{formatPrice(item.price)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-summary">
                    <div className="order-total-label">实付金额</div>
                    <div className="order-total-amount">¥{formatPrice(order.payment_amount)}</div>
                  </div>
                </div>

                <div className="order-card-actions">
                  {order.status === OrderStatus.PENDING && (
                    <>
                      <Button onClick={() => handlePay(order.id)}>
                        继续支付
                      </Button>
                      <Popconfirm
                        title="确定取消订单？"
                        onConfirm={() => handleCancel(order.id)}
                      >
                        <Button>取消订单</Button>
                      </Popconfirm>
                    </>
                  )}
                  {(order.status === OrderStatus.PAID || order.status === OrderStatus.COMPLETED) && (
                    <>
                      <Button onClick={() => handleDetail(order.id)}>
                        查看详情
                      </Button>
                      <Popconfirm
                        title="确定申请退款？退款后课程权益将被移除"
                        onConfirm={() => handleRefund(order.id)}
                      >
                        <Button danger>申请退款</Button>
                      </Popconfirm>
                    </>
                  )}
                  {order.status === OrderStatus.REFUNDED && (
                    <Button onClick={() => handleDetail(order.id)}>
                      查看详情
                    </Button>
                  )}
                  {order.status === OrderStatus.CANCELLED && (
                    <Button onClick={() => handleDetail(order.id)}>
                      查看详情
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </ClientLayout>
  )
}

export default MyOrders
