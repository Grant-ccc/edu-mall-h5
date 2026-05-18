import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Empty, message, Divider, Spin } from 'antd'
import { SafetyOutlined } from '@ant-design/icons'
import ClientLayout from '../../layouts/ClientLayout'
import authStore from '../../stores/authStore'
import cartStore from '../../stores/cartStore'
import { calcFee, payNow } from '../../api/order'
import './index.css'

function Checkout() {
  const navigate = useNavigate()
  const [feeData, setFeeData] = useState(null) // 计费结果
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [courseIds, setCourseIds] = useState([])

  useEffect(() => {
    if (!authStore.isLogin()) {
      navigate('/login')
      return
    }

    // 从localStorage读取要结算的商品ID
    const goodsIdsStr = localStorage.getItem('checkout_goods_ids')
    if (!goodsIdsStr) {
      setLoading(false)
      return
    }

    try {
      const ids = JSON.parse(goodsIdsStr)
      setCourseIds(ids)

      // 调用计费接口
      calcFee(ids)
        .then(data => setFeeData(data))
        .catch(() => message.error('计算价格失败'))
        .finally(() => setLoading(false))
    } catch (e) {
      setLoading(false)
    }
  }, [])

  // 价格显示
  const formatPrice = (price) => (price / 100).toFixed(2)

  const courses = feeData?.course_fees || []
  const totalPayFee = feeData?.total_pay_fee || 0
  const feeUuid = feeData?.fee_uuid

  // 提交订单
  const handleSubmit = async () => {
    if (!courseIds.length || !feeUuid) {
      message.error('没有要结算的商品')
      return
    }

    setSubmitting(true)
    try {
      const payData = await payNow(feeUuid)
      // 清除结算商品ID
      localStorage.removeItem('checkout_goods_ids')
      // 移除购物车中已下单的商品
      await cartStore.clearCart()
      message.success('订单创建成功')
      // 跳转支付页
      navigate(`/pay/${payData.order_id}`)
    } catch (error) {
      console.error('提交订单失败:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="checkout-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '120px 0' }}>
          <Spin size="large" tip="计算价格..." />
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      <div className="checkout-page">
        <div className="checkout-container">
          <h2>确认订单</h2>

          {courseIds.length === 0 || courses.length === 0 ? (
            <Card className="checkout-empty-card">
              <Empty description="没有要结算的商品">
                <Button onClick={() => navigate('/')}>去逛逛</Button>
              </Empty>
            </Card>
          ) : (
            <div className="checkout-content">
              <Card className="checkout-goods-card" title="商品清单">
                {courses.map((fee, index) => (
                  <div key={fee.course_id}>
                    <div className="checkout-goods-item">
                      <span className="goods-name">课程 {fee.course_id}</span>
                      <span className="goods-price">¥{formatPrice(fee.price)}</span>
                    </div>
                    {fee.discount_fee > 0 && (
                      <div className="checkout-discount">
                        优惠：-¥{formatPrice(fee.discount_fee)}
                      </div>
                    )}
                    {index < courses.length - 1 && <Divider />}
                  </div>
                ))}
              </Card>

              <Card className="checkout-summary-card">
                <div className="checkout-summary-row">
                  <span>商品数量</span>
                  <span>{courses.length} 件</span>
                </div>
                <div className="checkout-summary-row total">
                  <span>应付金额</span>
                  <span className="total-price">¥{formatPrice(totalPayFee)}</span>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={submitting}
                  onClick={handleSubmit}
                >
                  提交订单
                </Button>

                <div className="checkout-tip">
                  <SafetyOutlined /> 支持安全支付
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  )
}

export default Checkout
