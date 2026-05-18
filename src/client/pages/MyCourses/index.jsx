import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Empty, Tag, Spin, message } from 'antd'
import { PlayCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import ClientLayout from '../../layouts/ClientLayout'
import authStore from '../../stores/authStore'
import { getPurchasedCourseList } from '../../api/course'
import './index.css'

function MyCourses() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    if (!authStore.isLogin()) {
      navigate('/login')
      return
    }

    // 调用 API 获取已购课程列表
    setLoading(true)
    getPurchasedCourseList({ unlimited: true })
      .then(data => {
        setCourses(data.list || [])
      })
      .catch(error => {
        console.error('获取已购课程失败:', error)
        message.error('获取已购课程失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // 时间格式化
  const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN')
  }

  // 检查是否过期
  const isExpired = (expireTime) => {
    return expireTime && Date.now() > expireTime
  }

  // 去学习
  const handleLearn = (courseId) => {
    navigate(`/learn/${courseId}`)
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="my-courses-page">
          <div className="my-courses-loading">
            <Spin size="large" tip="加载中..." />
          </div>
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      <div className="my-courses-page">
        <div className="my-courses-container">
          <h2>我的课程 ({courses.length})</h2>

          {courses.length === 0 ? (
            <Card className="my-courses-empty">
              <Empty description="暂无已购课程">
                <Button type="primary" onClick={() => navigate('/')}>
                  去逛逛
                </Button>
              </Empty>
            </Card>
          ) : (
            <div className="my-courses-grid">
              {courses.map(course => {
                const expired = isExpired(course.learn_expire_time)
                return (
                  <Card key={course.id} className={`my-course-card ${expired ? 'expired' : ''}`}>
                    <div className="my-course-cover">
                      {course.cover_url ? (
                        <img src={course.cover_url} alt={course.name} />
                      ) : (
                        <div className="my-course-cover-placeholder">
                          <PlayCircleOutlined />
                        </div>
                      )}
                      {expired && (
                        <div className="my-course-expired-mask">
                          <span>已过期</span>
                        </div>
                      )}
                    </div>

                    <div className="my-course-info">
                      <h3 className="my-course-name">{course.name}</h3>

                      <div className="my-course-meta">
                        <span>
                          <ClockCircleOutlined style={{ marginRight: 4 }} />
                          有效期至 {formatTime(course.learn_expire_time || course.service_expire_time)}
                        </span>
                        {(course.learn_expire_time || course.service_expire_time) && (
                          <Tag color={expired ? 'error' : 'blue'}>
                            {expired ? '已过期' : '有效'}
                          </Tag>
                        )}
                      </div>

                      <Button
                        type="primary"
                        block
                        disabled={expired}
                        onClick={() => handleLearn(course.id)}
                      >
                        {expired ? '已过期' : '去学习'}
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  )
}

export default MyCourses