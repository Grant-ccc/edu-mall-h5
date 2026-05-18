import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, Tag, Button, Collapse, Spin, message } from 'antd'
import { PlayCircleOutlined, ClockCircleOutlined, SafetyOutlined } from '@ant-design/icons'
import ClientLayout from '../../layouts/ClientLayout'
import authStore from '../../stores/authStore'
import cartStore from '../../stores/cartStore'
import { getCourseDetail } from '../../api/course'
import './index.css'

const { Panel } = Collapse
const { TabPane } = Tabs

function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState(null)
  const [activeCatalogKey, setActiveCatalogKey] = useState(['1'])

  useEffect(() => {
    // 调用 API 获取课程详情
    setLoading(true)
    getCourseDetail(id)
      .then(data => {
        setCourse(data)
        // 默认展开第一个目录
        if (data.catalogs && data.catalogs.length > 0) {
          setActiveCatalogKey([String(data.catalogs[0].id)])
        }
      })
      .catch(error => {
        console.error('获取课程详情失败:', error)
        message.error('获取课程详情失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  // 价格显示
  const priceYuan = course ? (course.course_price / 100).toFixed(2) : '0.00'

  // 已购状态（从 API 返回的 has_purchased 字段获取）
  const hasPurchased = course ? course.has_purchased : false

  // 时长格式化
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}分钟`
    const hours = Math.floor(minutes / 60)
    const remainMinutes = minutes % 60
    return `${hours}小时${remainMinutes > 0 ? remainMinutes + '分钟' : ''}`
  }

  // 加入购物车
  const handleAddCart = () => {
    if (!authStore.isLogin()) {
      message.warning('请先登录')
      navigate('/login')
      return
    }

    const result = cartStore.addItem(course)
    if (result.success) {
      message.success('已加入购物车')
    } else {
      message.warning(result.message)
    }
  }

  // 立即购买
  const handleBuyNow = () => {
    if (!authStore.isLogin()) {
      message.warning('请先登录')
      navigate('/login')
      return
    }

    // 将商品ID存入localStorage，供确认订单页使用
    localStorage.setItem('checkout_goods_ids', JSON.stringify([course.id]))
    navigate('/checkout')
  }

  // 点击课时
  const handleLessonClick = (lesson) => {
    if (!authStore.isLogin()) {
      message.warning('请先登录')
      navigate('/login')
      return
    }

    if (hasPurchased || lesson.enable_trial === 1) {
      navigate(`/learn/${course.id}/${lesson.lesson_id}`)
    } else {
      message.warning('请购买课程后再学习')
    }
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="course-detail-loading">
          <Spin size="large" tip="加载中..." />
        </div>
      </ClientLayout>
    )
  }

  if (!course) {
    return (
      <ClientLayout>
        <div className="course-detail-loading">课程不存在</div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      <div className="course-detail-page">
        {/* 课程信息区 */}
        <div className="course-detail-header">
          <div className="course-detail-header-inner">
            {/* 左侧信息 */}
            <div className="course-detail-info">
              <h1 className="course-detail-title">{course.name}</h1>

              <div className="course-detail-features">
                {course.features.map((f, i) => (
                  <Tag key={i} color="blue">{f}</Tag>
                ))}
              </div>

              <div className="course-detail-meta">
                <span><ClockCircleOutlined /> {course.lesson_count}课时 / {formatDuration(course.total_duration)}</span>
                <span>学习{course.learn_time}天</span>
                <span>服务{course.service_time}天</span>
              </div>

              <div className="course-detail-price">
                <span className="price-current">¥{priceYuan}</span>
              </div>
            </div>

            {/* 右侧购买卡片 */}
            <div className="course-detail-buy-card">
              <div className="buy-card-price">
                <span className="price-label">课程价格</span>
                <span className="price-value">¥{priceYuan}</span>
              </div>

              <div className="buy-card-actions">
                {hasPurchased ? (
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<PlayCircleOutlined />}
                    onClick={() => navigate(`/learn/${course.id}`)}
                  >
                    去学习
                  </Button>
                ) : (
                  <>
                    <Button size="large" block onClick={handleAddCart}>
                      加入购物车
                    </Button>
                    <Button type="primary" size="large" block onClick={handleBuyNow}>
                      立即购买
                    </Button>
                  </>
                )}
              </div>

              <div className="buy-card-service">
                <SafetyOutlined /> 支持退款
              </div>
            </div>
          </div>
        </div>

        {/* Tab 内容区 */}
        <div className="course-detail-content">
          <Tabs defaultActiveKey="intro" className="course-detail-tabs">
            <TabPane tab="课程介绍" key="intro">
              <div
                className="course-detail-intro"
                dangerouslySetInnerHTML={{ __html: course.detail }}
              />
            </TabPane>

            <TabPane tab={`课程目录 (${course.lesson_count})`} key="catalog">
              <Collapse
                activeKey={activeCatalogKey}
                onChange={(keys) => setActiveCatalogKey(keys)}
                className="course-catalog-collapse"
              >
                {course.catalogs.map(catalog => (
                  <Panel
                    header={
                      <div className="catalog-header">
                        <span>{catalog.name}</span>
                        <span className="catalog-lesson-count">{catalog.lessons.length}课时</span>
                      </div>
                    }
                    key={String(catalog.id)}
                  >
                    <div className="catalog-lessons">
                      {catalog.lessons.map((lesson, index) => (
                        <div
                          key={lesson.lesson_id}
                          className={`catalog-lesson-item ${
                            !hasPurchased && lesson.enable_trial !== 1 ? 'disabled' : ''
                          }`}
                          onClick={() => handleLessonClick(lesson)}
                        >
                          <span className="lesson-index">{index + 1}</span>
                          <span className="lesson-name">{lesson.name}</span>
                          <span className="lesson-duration">{formatDuration(lesson.duration)}</span>
                          {lesson.enable_trial === 1 && (
                            <Tag color="orange" className="lesson-trial-tag">试看</Tag>
                          )}
                        </div>
                      ))}
                    </div>
                  </Panel>
                ))}
              </Collapse>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </ClientLayout>
  )
}

export default CourseDetail
