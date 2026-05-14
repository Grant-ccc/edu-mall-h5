import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Spin, Tag, Button, message, Radio } from 'antd'
import { WechatOutlined, SafetyOutlined } from '@ant-design/icons'
import ClientLayout from '../../layouts/ClientLayout'
import orderStore, { OrderStatusText, OrderStatus } from '../../stores/orderStore'
import './index.css'

// Mock 课程数据
const mockCourseMap = {
  1: { id: 1, name: 'Go语言在线教育商城实战', course_price: 9900 },
  2: { id: 2, name: 'React前端工程化实战', course_price: 7900 },
  3: { id: 3, name: 'TypeScript深入浅出', course_price: 5900 },
  4: { id: 4, name: 'Node.js服务端开发', course_price: 8900 },
  5: { id: 5, name: 'Vue3全家桶实战', course_price: 6900 },
  6: { id: 6, name: 'MySQL数据库设计与优化', course_price: 4900 },
  7: { id: 7, name: 'Redis缓存实战应用', course_price: 3900 },
  8: { id: 8, name: 'Docker容器化部署', course_price: 2900 }
}

function Payment() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState(null)
  const [paying, setPaying] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('wechat')

  useEffect(() => {
    // 获取订单信息
    const orderData = orderStore.getOrder(orderId)
    if (orderData) {
      setOrder(orderData)
    }
    setLoading(false)

    // 订阅订单状态变化
    const unsubscribe = orderStore.subscribe((state) => {
      const updatedOrder = state.orders.find(o => o.id === parseInt(orderId))
      if (updatedOrder) {
        setOrder(updatedOrder)
      }
    })

    return unsubscribe
  }, [orderId])

  // 价格显示
  const formatPrice = (price) => (price / 100).toFixed(2)

  // 格式化时间
  const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN')
  }

  // 模拟支付成功
  const handleMockPay = async () => {
    setPaying(true)

    // 模拟支付过程
    await new Promise(resolve => setTimeout(resolve, 1000))

    const result = orderStore.payOrder(orderId)

    setPaying(false)

    if (result.success) {
      message.success('支付成功')
      // 跳转支付成功页
      setTimeout(() => {
        navigate(`/payment-success?orderId=${orderId}`)
      }, 500)
    } else {
      message.error(result.message)
    }
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="payment-loading">
          <Spin size="large" />
        </div>
      </ClientLayout>
    )
  }

  if (!order) {
    return (
      <ClientLayout>
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <h2>订单不存在</h2>
          <Button onClick={() => navigate('/me/orders')}>返回订单列表</Button>
        </div>
      </ClientLayout>
    )
  }

  // 已支付或已取消
  if (order.status !== OrderStatus.PENDING) {
    return (
      <ClientLayout>
        <div style={{ padding: '60px 24px', maxWidth: 600, margin: '0 auto' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <h2>订单状态：{OrderStatusText[order.status]}</h2>
              <p>订单号：{order.order_no}</p>
              <Button type="primary" onClick={() => navigate('/me/orders')}>
                返回订单列表
              </Button>
            </div>
          </Card>
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      <div className="payment-page">
        <div className="payment-container">
          <h2>订单支付</h2>

          {/* 订单信息 */}
          <Card className="payment-order-card" title="订单信息">
            <div className="payment-order-row">
              <span className="label">订单号</span>
              <span className="value">{order.order_no}</span>
            </div>
            <div className="payment-order-row">
              <span className="label">创建时间</span>
              <span className="value">{formatTime(order.create_at)}</span>
            </div>
            <div className="payment-order-row">
              <span className="label">支付金额</span>
              <span className="value price">¥{formatPrice(order.payment_amount)}</span>
            </div>
          </Card>

          {/* 商品信息 */}
          <Card className="payment-goods-card" title="商品信息">
            {order.items.map((item, index) => (
              <div key={index} className="payment-goods-item">
                <span className="goods-name">{item.name}</span>
                <span className="goods-price">¥{formatPrice(item.price)}</span>
              </div>
            ))}
          </Card>

          {/* 支付方式 */}
          <Card className="payment-method-card" title="支付方式">
            <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <Radio value="wechat">
                <WechatOutlined style={{ color: '#07c160', marginRight: 4 }} />
                微信支付
              </Radio>
            </Radio.Group>
          </Card>

          {/* 支付二维码（演示） */}
          <Card className="payment-qrcode-card">
            <div className="payment-qrcode">
              <div style={{
                width: 200,
                height: 200,
                margin: '0 auto',
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8
              }}>
                <div style={{ textAlign: 'center', color: '#999' }}>
                  <WechatOutlined style={{ fontSize: 48, color: '#07c160' }} />
                  <p style={{ marginTop: 8 }}>微信扫码支付</p>
                </div>
              </div>
              <p className="qrcode-tip">请使用微信扫描二维码完成支付</p>
            </div>

            {/* 演示模式 */}
            <div className="payment-demo">
              <Button
                type="primary"
                size="large"
                loading={paying}
                onClick={handleMockPay}
              >
                模拟支付成功
              </Button>
              <p className="demo-tip">演示模式：点击按钮模拟支付成功</p>
            </div>
          </Card>
        </div>
      </div>
    </ClientLayout>
  )
}

export default Payment
