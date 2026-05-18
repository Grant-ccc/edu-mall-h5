import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Input, Select, Switch, Pagination, message, Spin } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import ClientLayout from '../../layouts/ClientLayout'
import CourseCard from '../../components/CourseCard'
import cartStore from '../../stores/cartStore'
import authStore from '../../stores/authStore'
import { getCourseList } from '../../api/course'
import './index.css'

const { Option } = Select

function CourseList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState([])
  const [total, setTotal] = useState(0)

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
      const params = {
        page,
        limit: pageSize
      }
      if (keyword) params.name_kw = keyword
      if (updateStatus !== null) params.update_status = updateStatus
      if (isRecommend) params.is_recommend = true

      const result = await getCourseList(params)
      setCourses(result.list || [])
      setTotal(result.total || 0)
    } catch (error) {
      console.error('获取课程列表失败:', error)
      setCourses([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  // 初始加载 & 筛选变化时重新加载
  useEffect(() => {
    searchCourses()
  }, [keyword, updateStatus, isRecommend, page])

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
                    course={course}
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
