import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, Tag, Button, Collapse, Spin, message } from 'antd'
import { PlayCircleOutlined, ClockCircleOutlined, SafetyOutlined } from '@ant-design/icons'
import ClientLayout from '../../layouts/ClientLayout'
import authStore from '../../stores/authStore'
import cartStore from '../../stores/cartStore'
import userCourseStore from '../../stores/userCourseStore'
import './index.css'

const { Panel } = Collapse
const { TabPane } = Tabs

// Mock 课程详情数据
const getMockCourseDetail = (id) => ({
  id: parseInt(id),
  name: 'Go语言在线教育商城实战',
  cover_url: '',
  detail_cover_url: '',
  course_price: 9900,
  features: ['录播', '实战', '答疑', '源码'],
  learn_time: 30,
  service_time: 365,
  update_status: 1,
  has_purchased: false,
  detail: `
    <h3>课程介绍</h3>
    <p>本课程带你从零开始，使用 Go 语言构建一个完整的在线教育商城系统。</p>
    <p>课程涵盖：</p>
    <ul>
      <li>Go 语言基础与进阶</li>
      <li>Gin 框架实战</li>
      <li>MySQL 数据库设计</li>
      <li>Redis 缓存应用</li>
      <li>订单与支付系统</li>
      <li>学习进度管理</li>
    </ul>
    <h3>适合人群</h3>
    <p>有一定编程基础，想要学习 Go 语言后端开发的同学。</p>
  `,
  total_duration: 7200,
  lesson_count: 48,
  catalogs: [
    {
      id: 1,
      name: '第一章：项目初始化',
      sort: 1,
      lessons: [
        { lesson_id: 101, name: '1-1 项目介绍与环境搭建', duration: 600, enable_trial: 1 },
        { lesson_id: 102, name: '1-2 Go Module初始化', duration: 480, enable_trial: 1 },
        { lesson_id: 103, name: '1-3 项目目录结构设计', duration: 520, enable_trial: 0 }
      ]
    },
    {
      id: 2,
      name: '第二章：数据库设计',
      sort: 2,
      lessons: [
        { lesson_id: 201, name: '2-1 用户表设计', duration: 580, enable_trial: 0 },
        { lesson_id: 202, name: '2-2 课程表设计', duration: 620, enable_trial: 0 },
        { lesson_id: 203, name: '2-3 订单表设计', duration: 700, enable_trial: 0 }
      ]
    },
    {
      id: 3,
      name: '第三章：用户认证',
      sort: 3,
      lessons: [
        { lesson_id: 301, name: '3-1 手机号登录实现', duration: 800, enable_trial: 0 },
        { lesson_id: 302, name: '3-2 JWT Token生成与验证', duration: 650, enable_trial: 0 },
        { lesson_id: 303, name: '3-3 微信扫码登录', duration: 900, enable_trial: 0 }
      ]
    }
  ]
})

function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState(null)
  const [activeCatalogKey, setActiveCatalogKey] = useState(['1'])
  const [, forceUpdate] = useState(0) // 用于触发重新渲染

  useEffect(() => {
    // 模拟加载
    setLoading(true)
    setTimeout(() => {
      setCourse(getMockCourseDetail(id))
      setLoading(false)
    }, 500)
  }, [id])

  // 监听已购课程变化，触发重新渲染
  useEffect(() => {
    const unsubscribe = userCourseStore.subscribe(() => {
      forceUpdate(n => n + 1)
    })
    return unsubscribe
  }, [])

  // 价格显示
  const priceYuan = course ? (course.course_price / 100).toFixed(2) : '0.00'

  // 已购状态（从 userCourseStore 实时获取）
  const hasPurchased = course ? userCourseStore.hasCourse(course.id) : false

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
