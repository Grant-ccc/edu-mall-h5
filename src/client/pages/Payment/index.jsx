import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Spin, Tag, Button, message, Radio } from 'antd'
import { WechatOutlined } from '@ant-design/icons'
import ClientLayout from '../../layouts/ClientLayout'
import { getOrderInfo, payLater } from '../../api/order'
import './index.css'

// 订单状态
const OrderStatus = {
  CANCELLED: -1,
  PENDING: 1,
  PAID: 2,
  REFUNDED: 3,
  SHIPPED: 4,
  RECEIVED: 5,
  COMPLETED: 6
}

const OrderStatusText = {
  [-1]: '已取消',
  1: '待支付',
  2: '已支付',
  3: '已退款',
  4: '已发货',
  5: '已签收',
  6: '已完成'
}

function Payment() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState(null)
  const [payData, setPayData] = useState(null) // 支付参数
  const [paying, setPaying] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('wechat')

  useEffect(() => {
    // 获取订单详情
    setLoading(true)
    getOrderInfo(orderId)
      .then(data => {
        setOrder(data)
        // 如果订单待支付，获取支付参数
        if (data.status === OrderStatus.PENDING) {
          return payLater(orderId)
        }
      })
      .then(data => {
        if (data) setPayData(data)
      })
      .catch(() => {
        message.error('获取订单信息失败')
      })
      .finally(() => setLoading(false))
  }, [orderId])

  // 价格显示
  const formatPrice = (price) => (price / 100).toFixed(2)

  // 格式化时间
  const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN')
  }

  // 发起支付
  const handlePay = async () => {
    setPaying(true)
    try {
      const data = await payLater(orderId, 'h5')
      setPayData(data)
      // 如果有二维码URL，直接用微信打开
      if (data.code_url) {
        // Native 支付：展示二维码
        message.info('请使用微信扫描二维码完成支付')
      } else if (data.package) {
        // JSAPI 支付：调用微信 JSAPI（需在微信环境中）
        message.info('微信支付参数已就绪')
      }
    } catch (error) {
      console.error('获取支付参数失败:', error)
    } finally {
      setPaying(false)
    }
  }

  // 模拟支付成功（开发/演示用）
  const handleMockPay = async () => {
    setPaying(true)
    try {
      await payLater(orderId, 'h5')
      message.success('支付成功')
      navigate(`/payment-success?orderId=${orderId}`)
    } catch (error) {
      console.error('支付失败:', error)
    } finally {
      setPaying(false)
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
              <p>订单ID：{order.id}</p>
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
              <span className="value">{order.id}</span>
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
            {(order.items || []).map((item, index) => (
              <div key={item.id || index} className="payment-goods-item">
                <span className="goods-name">{item.goods_snap?.name || `商品 ${item.goods_id}`}</span>
                <span className="goods-price">¥{formatPrice(item.payment_amount)}</span>
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

          {/* 支付二维码 */}
          <Card className="payment-qrcode-card">
            {payData?.code_url ? (
              <div className="payment-qrcode">
                <img src={payData.code_url} alt="微信支付二维码" style={{ width: 200, height: 200, margin: '0 auto', display: 'block' }} />
                <p className="qrcode-tip">请使用微信扫描二维码完成支付</p>
              </div>
            ) : (
              <div className="payment-qrcode">
                <div style={{
                  width: 200, height: 200, margin: '0 auto', background: '#f0f0f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8
                }}>
                  <div style={{ textAlign: 'center', color: '#999' }}>
                    <WechatOutlined style={{ fontSize: 48, color: '#07c160' }} />
                    <p style={{ marginTop: 8 }}>微信扫码支付</p>
                  </div>
                </div>
                <p className="qrcode-tip">请使用微信扫描二维码完成支付</p>
              </div>
            )}

            <div className="payment-demo">
              <Button
                type="primary"
                size="large"
                loading={paying}
                onClick={payData?.code_url ? handlePay : handleMockPay}
              >
                {payData?.code_url ? '重新获取支付码' : '模拟支付成功'}
              </Button>
              <p className="demo-tip">
                {payData?.code_url ? '支付码有效期有限，可刷新获取新码' : '演示模式：点击按钮模拟支付成功'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </ClientLayout>
  )
}

export default Payment
