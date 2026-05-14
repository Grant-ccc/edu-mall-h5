import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Input, Select, Switch, Pagination, message, Spin } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import ClientLayout from '../../layouts/ClientLayout'
import CourseCard from '../../components/CourseCard'
import cartStore from '../../stores/cartStore'
import authStore from '../../stores/authStore'
import userCourseStore from '../../stores/userCourseStore'
import './index.css'

const { Option } = Select

// Mock 课程数据
const mockCourses = [
  {
    id: 1,
    name: 'Go语言在线教育商城实战',
    cover_url: '',
    course_price: 9900,
    features: ['录播', '实战', '答疑'],
    learn_time: 30,
    service_time: 365,
    update_status: 1,
    has_purchased: false
  },
  {
    id: 2,
    name: 'React前端工程化实战',
    cover_url: '',
    course_price: 7900,
    features: ['录播', '源码'],
    learn_time: 20,
    service_time: 180,
    update_status: 2,
    has_purchased: true
  },
  {
    id: 3,
    name: 'TypeScript深入浅出',
    cover_url: '',
    course_price: 5900,
    features: ['录播', '练习'],
    learn_time: 15,
    service_time: 90,
    update_status: 2,
    has_purchased: false
  },
  {
    id: 4,
    name: 'Node.js服务端开发',
    cover_url: '',
    course_price: 8900,
    features: ['录播', '实战'],
    learn_time: 25,
    service_time: 365,
    update_status: 1,
    has_purchased: false
  },
  {
    id: 5,
    name: 'Vue3全家桶实战',
    cover_url: '',
    course_price: 6900,
    features: ['录播', '源码', '答疑'],
    learn_time: 18,
    service_time: 180,
    update_status: 2,
    has_purchased: false
  },
  {
    id: 6,
    name: 'MySQL数据库设计与优化',
    cover_url: '',
    course_price: 4900,
    features: ['录播'],
    learn_time: 12,
    service_time: 90,
    update_status: 2,
    has_purchased: false
  },
  {
    id: 7,
    name: 'Redis缓存实战应用',
    cover_url: '',
    course_price: 3900,
    features: ['录播', '实战'],
    learn_time: 8,
    service_time: 60,
    update_status: 2,
    has_purchased: true
  },
  {
    id: 8,
    name: 'Docker容器化部署',
    cover_url: '',
    course_price: 2900,
    features: ['录播'],
    learn_time: 6,
    service_time: 30,
    update_status: 2,
    has_purchased: false
  }
]

function CourseList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState([])
  const [total, setTotal] = useState(0)
  const [, forceUpdate] = useState(0) // 用于触发重新渲染

  // 筛选状态
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [updateStatus, setUpdateStatus] = useState(null)
  const [isRecommend, setIsRecommend] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 8

  // 搜索课程
  const searchCourses = async () => {
    setLoading(true)
    try {
      // 演示模式：本地筛选 mock 数据
      await new Promise(resolve => setTimeout(resolve, 500))

      let filtered = [...mockCourses]

      // 关键词筛选
      if (keyword) {
        filtered = filtered.filter(c =>
          c.name.toLowerCase().includes(keyword.toLowerCase())
        )
      }

      // 更新状态筛选
      if (updateStatus !== null) {
        filtered = filtered.filter(c => c.update_status === updateStatus)
      }

      // 推荐筛选（演示：取前几条）
      if (isRecommend) {
        filtered = filtered.slice(0, 4)
      }

      setCourses(filtered)
      setTotal(filtered.length)
    } finally {
      setLoading(false)
    }
  }

  // 初始加载 & 筛选变化时重新加载
  useEffect(() => {
    searchCourses()
  }, [keyword, updateStatus, isRecommend, page])

  // 监听已购课程变化，触发重新渲染
  useEffect(() => {
    const unsubscribe = userCourseStore.subscribe(() => {
      forceUpdate(n => n + 1)
    })
    return unsubscribe
  }, [])

  // 加入购物车
  const handleAddCart = (course) => {
    if (!authStore.isLogin()) {
      message.warning('请先登录')
      navigate('/login')
      return
    }

    const result = cartStore.addItem(course)
    if (result.success) {
      message.success(`已将「${course.name}」加入购物车`)
    } else {
      message.warning(result.message)
    }
  }

  // 立即购买
  const handleBuyNow = (course) => {
    if (!authStore.isLogin()) {
      message.warning('请先登录')
      navigate('/login')
      return
    }

    // 将商品ID存入localStorage，供确认订单页使用
    localStorage.setItem('checkout_goods_ids', JSON.stringify([course.id]))
    navigate('/checkout')
  }

  // 搜索
  const handleSearch = (value) => {
    setKeyword(value)
    setPage(1)
    if (value) {
      setSearchParams({ keyword: value })
    } else {
      setSearchParams({})
    }
  }

  return (
    <ClientLayout>
      <div className="course-list-page">
        {/* 筛选栏 */}
        <div className="course-filter-bar">
          <div className="course-filter-inner">
            <Input.Search
              className="course-filter-search"
              placeholder="搜索课程名称"
              prefix={<SearchOutlined />}
              defaultValue={keyword}
              onSearch={handleSearch}
              allowClear
            />

            <Select
              className="course-filter-select"
              placeholder="更新状态"
              value={updateStatus}
              onChange={(value) => {
                setUpdateStatus(value)
                setPage(1)
              }}
              allowClear
            >
              <Option value={1}>更新中</Option>
              <Option value={2}>已完结</Option>
            </Select>

            <div className="course-filter-recommend">
              <Switch
                checked={isRecommend}
                onChange={(checked) => {
                  setIsRecommend(checked)
                  setPage(1)
                }}
                size="small"
              />
              <span>只看推荐</span>
            </div>
          </div>
        </div>

        {/* 课程列表 */}
        <div className="course-list-container">
          {loading ? (
            <div className="course-list-loading">
              <Spin size="large" tip="加载中..." />
            </div>
          ) : (
            <>
              <div className="course-list-grid">
                {courses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={{
                      ...course,
                      has_purchased: userCourseStore.hasCourse(course.id)
                    }}
                    onAddCart={handleAddCart}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>

              {courses.length === 0 && (
                <div className="course-list-loading">
                  暂无符合条件的课程
                </div>
              )}

              {/* 分页器 */}
              {total > pageSize && (
                <div className="pagination-wrapper">
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    onChange={(p) => setPage(p)}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ClientLayout>
  )
}

export default CourseList
