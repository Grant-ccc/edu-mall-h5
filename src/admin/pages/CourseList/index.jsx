import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Button, Space, Tag, Input, Select, DatePicker, Popconfirm, message, Image } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined, SearchOutlined } from '@ant-design/icons'
import AdminLayout from '../../layouts/AdminLayout'
import courseStore, { CourseStatus, CourseStatusText, CourseStatusColor, CourseUpdateStatus, CourseUpdateStatusText } from '../../stores/courseStore'
import './index.css'

const { RangePicker } = DatePicker
const { Option } = Select

function CourseList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, limit: 10 })

  // 筛选条件
  const [filters, setFilters] = useState({
    name_kw: '',
    status: null,
    update_status: null
  })

  // 初始化加载
  useEffect(() => {
    loadCourses()

    // 订阅状态变化
    const unsubscribe = courseStore.subscribe(() => {
      loadCourses()
    })

    return unsubscribe
  }, [])

  // 加载课程列表
  const loadCourses = () => {
    setLoading(true)

    // 模拟 API 调用延迟
    setTimeout(() => {
      let list = courseStore.getCourses()

      // 应用筛选
      if (filters.name_kw) {
        list = list.filter(c => c.name.toLowerCase().includes(filters.name_kw.toLowerCase()))
      }
      if (filters.status !== null) {
        list = list.filter(c => c.status === filters.status)
      }
      if (filters.update_status !== null) {
        list = list.filter(c => c.update_status === filters.update_status)
      }

      // 排序
      list.sort((a, b) => b.update_at - a.update_at)

      setCourses(list)
      setTotal(list.length)
      setLoading(false)
    }, 300)
  }

  // 价格格式化（分转元）
  const formatPrice = (price) => `¥${(price / 100).toFixed(2)}`

  // 时间格式化
  const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN')
  }

  // 创建课程
  const handleCreate = () => {
    navigate('/admin/courses/create')
  }

  // 编辑课程
  const handleEdit = (id) => {
    navigate(`/admin/courses/${id}/edit`)
  }

  // 目录编排
  const handleCatalog = (id) => {
    navigate(`/admin/courses/${id}/catalog`)
  }

  // 上架/下架
  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === CourseStatus.ONLINE ? CourseStatus.OFFLINE : CourseStatus.ONLINE
    const result = courseStore.updateStatus(id, newStatus)
    if (result.success) {
      message.success(newStatus === CourseStatus.ONLINE ? '上架成功' : '下架成功')
    } else {
      message.error(result.message)
    }
  }

  // 删除课程
  const handleDelete = (id) => {
    const result = courseStore.deleteCourse(id)
    if (result.success) {
      message.success('删除成功')
    } else {
      message.error(result.message)
    }
  }

  // 搜索
  const handleSearch = () => {
    loadCourses()
  }

  // 重置筛选
  const handleReset = () => {
    setFilters({
      name_kw: '',
      status: null,
      update_status: null
    })
    loadCourses()
  }

  // 表格列定义
  const columns = [
    {
      title: '课程名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <Space>
          {record.cover_url ? (
            <Image src={record.cover_url} width={60} height={40} style={{ borderRadius: 4 }} />
          ) : (
            <div className="course-cover-placeholder" style={{ width: 60, height: 40, borderRadius: 4, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AppstoreOutlined style={{ color: '#ccc' }} />
            </div>
          )}
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '价格',
      dataIndex: 'course_price',
      key: 'course_price',
      width: 100,
      render: (price) => formatPrice(price)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={CourseStatusColor[status]}>{CourseStatusText[status]}</Tag>
      )
    },
    {
      title: '更新状态',
      dataIndex: 'update_status',
      key: 'update_status',
      width: 100,
      render: (status) => (
        <Tag color={status === CourseUpdateStatus.UPDATING ? 'processing' : 'success'}>
          {CourseUpdateStatusText[status]}
        </Tag>
      )
    },
    {
      title: '特色',
      dataIndex: 'features',
      key: 'features',
      width: 150,
      render: (features) => (
        <Space size={4}>
          {(features || []).slice(0, 3).map((f, i) => (
            <Tag key={i} color="blue">{f}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'create_at',
      key: 'create_at',
      width: 150,
      render: (time) => formatTime(time)
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(record.id)}>
            <EditOutlined /> 编辑
          </Button>
          <Button type="link" size="small" onClick={() => handleCatalog(record.id)}>
            <AppstoreOutlined /> 目录
          </Button>
          <Popconfirm
            title={`确定${record.status === CourseStatus.ONLINE ? '下架' : '上架'}该课程？`}
            onConfirm={() => handleToggleStatus(record.id, record.status)}
          >
            <Button type="link" size="small">
              {record.status === CourseStatus.ONLINE ? '下架' : '上架'}
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确定删除该课程？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger>
              <DeleteOutlined /> 删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <AdminLayout>
      <div className="course-list-page">
        <Card title="课程管理" className="course-list-card">
          {/* 筛选区域 */}
          <div className="course-filter-section">
            <Space wrap>
              <Input
                placeholder="课程名称"
                prefix={<SearchOutlined />}
                value={filters.name_kw}
                onChange={(e) => setFilters({ ...filters, name_kw: e.target.value })}
                style={{ width: 200 }}
                allowClear
              />
              <Select
                placeholder="课程状态"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                style={{ width: 120 }}
                allowClear
              >
                <Option value={CourseStatus.ONLINE}>上架</Option>
                <Option value={CourseStatus.OFFLINE}>下架</Option>
              </Select>
              <Select
                placeholder="更新状态"
                value={filters.update_status}
                onChange={(value) => setFilters({ ...filters, update_status: value })}
                style={{ width: 120 }}
                allowClear
              >
                <Option value={CourseUpdateStatus.UPDATING}>更新中</Option>
                <Option value={CourseUpdateStatus.COMPLETED}>已完结</Option>
              </Select>
              <Button type="primary" onClick={handleSearch}>搜索</Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>

            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              创建课程
            </Button>
          </div>

          {/* 表格 */}
          <Table
            columns={columns}
            dataSource={courses}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: total,
              onChange: (page, limit) => {
                setPagination({ page, limit })
              },
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>
    </AdminLayout>
  )
}

export default CourseList