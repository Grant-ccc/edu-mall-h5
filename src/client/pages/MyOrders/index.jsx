import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, Card, Tag, Button, Empty, Popconfirm, message, Spin } from 'antd'
import ClientLayout from '../../layouts/ClientLayout'
import authStore from '../../stores/authStore'
import { getOrderList, cancelOrder } from '../../api/order'
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

function MyOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  // 加载订单列表
  const loadOrders = async (status) => {
    setLoading(true)
    try {
      const params = { limit: 100 }
      if (status !== 'all') {
        if (status === 'paid') {
          params.status_list = `${OrderStatus.PAID},${OrderStatus.COMPLETED}`
        } else {
          params.status = {
            pending: OrderStatus.PENDING,
            refunded: OrderStatus.REFUNDED,
            cancelled: OrderStatus.CANCELLED
          }[status]
        }
      }
      const data = await getOrderList(params)
      setOrders(data.list || [])
    } catch (error) {
      console.error('获取订单列表失败:', error)
      message.error('获取订单列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authStore.isLogin()) {
      navigate('/login')
      return
    }
    loadOrders(activeTab)
  }, [activeTab])

  // 价格显示
  const formatPrice = (price) => (price / 100).toFixed(2)

  // 时间格式化
  const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN')
  }

  // 取消订单
  const handleCancel = async (orderId) => {
    try {
      await cancelOrder(orderId, '用户取消')
      message.success('订单已取消')
      loadOrders(activeTab)
    } catch (error) {
      message.error('取消失败')
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

  // Tab项
  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待支付' },
    { key: 'paid', label: '已支付' },
    { key: 'refunded', label: '已退款' },
    { key: 'cancelled', label: '已取消' }
  ]

  return (
    <ClientLayout>
      <div className="my-orders-page">
        <div className="my-orders-container">
          <div className="my-orders-header">
            <h2>我的订单</h2>
          </div>

          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Spin size="large" />
            </div>
          ) : orders.length === 0 ? (
            <Card className="orders-empty">
              <Empty description="暂无订单记录">
                <Button onClick={() => navigate('/')}>去逛逛</Button>
              </Empty>
            </Card>
          ) : (
            orders.map(order => (
              <Card key={order.id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-card-no">订单号：{order.id}</span>
                    <span className="order-card-time">{formatTime(order.create_at)}</span>
                  </div>
                  <Tag color={OrderStatusColor[order.status]}>
                    {OrderStatusText[order.status]}
                  </Tag>
                </div>

                <div className="order-card-body">
                  <div className="order-goods-list">
                    {(order.items || []).map((item, index) => (
                      <div key={item.id || index} className="order-goods-item">
                        <div className="order-goods-cover">课程</div>
                        <div className="order-goods-info">
                          <div className="order-goods-name">
                            {item.goods_snap?.name || `商品 ${item.goods_id}`}
                          </div>
                          <div className="order-goods-price">¥{formatPrice(item.payment_amount)}</div>
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
                      <Button onClick={() => handlePay(order.id)}>继续支付</Button>
                      <Popconfirm
                        title="确定取消订单？"
                        onConfirm={() => handleCancel(order.id)}
                      >
                        <Button>取消订单</Button>
                      </Popconfirm>
                    </>
                  )}
                  {(order.status === OrderStatus.PAID || order.status === OrderStatus.COMPLETED) && (
                    <Button onClick={() => handleDetail(order.id)}>查看详情</Button>
                  )}
                  {order.status === OrderStatus.REFUNDED && (
                    <Button onClick={() => handleDetail(order.id)}>查看详情</Button>
                  )}
                  {order.status === OrderStatus.CANCELLED && (
                    <Button onClick={() => handleDetail(order.id)}>查看详情</Button>
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
