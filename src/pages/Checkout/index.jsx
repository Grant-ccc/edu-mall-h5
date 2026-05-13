import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Empty, message, Divider } from 'antd'
import { SafetyOutlined } from '@ant-design/icons'
import ClientLayout from '../../layouts/ClientLayout'
import authStore from '../../stores/authStore'
import orderStore from '../../stores/orderStore'
import cartStore from '../../stores/cartStore'
import './index.css'

// Mock 课程数据
const mockCourseMap = {
  1: { id: 1, name: 'Go语言在线教育商城实战', course_price: 9900, cover_url: '' },
  2: { id: 2, name: 'React前端工程化实战', course_price: 7900, cover_url: '' },
  3: { id: 3, name: 'TypeScript深入浅出', course_price: 5900, cover_url: '' },
  4: { id: 4, name: 'Node.js服务端开发', course_price: 8900, cover_url: '' },
  5: { id: 5, name: 'Vue3全家桶实战', course_price: 6900, cover_url: '' },
  6: { id: 6, name: 'MySQL数据库设计与优化', course_price: 4900, cover_url: '' },
  7: { id: 7, name: 'Redis缓存实战应用', course_price: 3900, cover_url: '' },
  8: { id: 8, name: 'Docker容器化部署', course_price: 2900, cover_url: '' }
}

function Checkout() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authStore.isLogin()) {
      navigate('/login')
      return
    }

    // 从localStorage读取要结算的商品ID
    const goodsIdsStr = localStorage.getItem('checkout_goods_ids')
    if (goodsIdsStr) {
      try {
        const goodsIds = JSON.parse(goodsIdsStr)
        const courseList = goodsIds
          .map(id => mockCourseMap[id])
          .filter(Boolean)
        setCourses(courseList)
      } catch (e) {
        setCourses([])
      }
    }
  }, [])

  // 计算总价
  const totalAmount = courses.reduce((sum, c) => sum + c.course_price, 0)

  // 价格显示
  const formatPrice = (price) => (price / 100).toFixed(2)

  // 提交订单
  const handleSubmit = async () => {
    if (courses.length === 0) {
      message.error('没有要结算的商品')
      return
    }

    setLoading(true)

    // 演示模式：模拟提交
    await new Promise(resolve => setTimeout(resolve, 500))

    // 创建订单
    const order = orderStore.createOrder(courses)

    // 从购物车移除已下单的商品
    const goodsIds = courses.map(c => c.id)
    cartStore.removeByGoodsIds(goodsIds)

    // 清除结算商品ID
    localStorage.removeItem('checkout_goods_ids')

    message.success('订单创建成功')

    // 跳转支付页
    navigate(`/pay/${order.id}`)
  }

  return (
    <ClientLayout>
      <div className="checkout-page">
        <div className="checkout-container">
          <h2>确认订单</h2>

          {courses.length === 0 ? (
            <Card className="checkout-empty-card">
              <Empty description="没有要结算的商品">
                <Button onClick={() => navigate('/')}>去逛逛</Button>
              </Empty>
            </Card>
          ) : (
            <div className="checkout-content">
              <Card className="checkout-goods-card" title="商品清单">
                {courses.map((course, index) => (
                  <div key={course.id}>
                    <div className="checkout-goods-item">
                      <span className="goods-name">{course.name}</span>
                      <span className="goods-price">¥{formatPrice(course.course_price)}</span>
                    </div>
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
                  <span className="total-price">¥{formatPrice(totalAmount)}</span>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={loading}
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
