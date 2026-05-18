import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Button, Space, Tag, Input, Select, DatePicker, Popconfirm, message, Modal, Dropdown } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, SearchOutlined, FolderOutlined, MoreOutlined } from '@ant-design/icons'
import AdminLayout from '../../layouts/AdminLayout'
import CategoryTree from '../../components/CategoryTree'
import lessonStore, { LessonStatus, LessonStatusText, LessonStatusColor } from '../../stores/lessonStore'
import './index.css'

const { RangePicker } = DatePicker
const { Option } = Select

function LessonList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [lessons, setLessons] = useState([])
  const [total, setTotal] = useState(0)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10 })
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  // 筛选条件
  const [filters, setFilters] = useState({
    name_kw: '',
    status: null
  })

  // 移动课时弹窗
  const [moveModalVisible, setMoveModalVisible] = useState(false)
  const [targetCategoryId, setTargetCategoryId] = useState(null)

  // 初始化加载
  useEffect(() => {
    loadLessons()
    lessonStore.fetchCategories().catch(() => {})

    const unsubscribe = lessonStore.subscribe(() => {
      loadLessons()
    })

    return unsubscribe
  }, [selectedCategoryId])

  // 加载课时列表
  const loadLessons = async () => {
    setLoading(true)
    try {
      const params = {}
      if (selectedCategoryId !== null) params.category_id = selectedCategoryId
      if (filters.name_kw) params.name_kw = filters.name_kw
      if (filters.status !== null) params.status = filters.status
      await lessonStore.fetchLessons(params)
      const list = lessonStore.getLessons()
      setLessons(list)
      setTotal(list.length)
    } catch (error) {
      console.error('加载课时列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 时长格式化
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}分钟`
    const hours = Math.floor(minutes / 60)
    const remainMinutes = minutes % 60
    return `${hours}小时${remainMinutes > 0 ? remainMinutes + '分钟' : ''}`
  }

  // 时间格式化
  const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN')
  }

  // 创建课时
  const handleCreate = () => {
    navigate('/admin/lessons/create')
  }

  // 编辑课时
  const handleEdit = (id) => {
    navigate(`/admin/lessons/${id}/edit`)
  }

  // 删除课时
  const handleDelete = async (id) => {
    const result = await lessonStore.deleteLesson(id)
    if (result.success) {
      message.success('删除成功')
    } else {
      message.error(result.message)
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的课时')
      return
    }
    const result = await lessonStore.deleteLessons(selectedRowKeys)
    if (result.success) {
      message.success('批量删除成功')
      setSelectedRowKeys([])
    }
  }

  // 启用/禁用
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === LessonStatus.ENABLED ? LessonStatus.DISABLED : LessonStatus.ENABLED
    const result = await lessonStore.updateLessonStatus(id, newStatus)
    if (result.success) {
      message.success(newStatus === LessonStatus.ENABLED ? '已启用' : '已禁用')
    } else {
      message.error(result.message)
    }
  }

  // 打开移动弹窗
  const handleOpenMoveModal = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要移动的课时')
      return
    }
    setMoveModalVisible(true)
  }

  // 移动课时
  const handleMoveLessons = async () => {
    if (!targetCategoryId) {
      message.warning('请选择目标分类')
      return
    }
    const result = await lessonStore.moveLessons(selectedRowKeys, targetCategoryId)
    if (result.success) {
      message.success('移动成功')
      setMoveModalVisible(false)
      setSelectedRowKeys([])
    }
  }

  // 搜索
  const handleSearch = () => {
    loadLessons()
  }

  // 重置筛选
  const handleReset = () => {
    setFilters({
      name_kw: '',
      status: null
    })
    loadLessons()
  }

  // 选择分类
  const handleSelectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId)
  }

  // 表格列定义
  const columns = [
    {
      title: '课时名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text) => (
        <Space>
          <PlayCircleOutlined style={{ color: '#1890ff' }} />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '所属分类',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 120
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (d) => formatDuration(d)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={LessonStatusColor[status]}>{LessonStatusText[status]}</Tag>
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
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(record.id)}>
            <EditOutlined /> 编辑
          </Button>
          <Popconfirm
            title={`确定${record.status === LessonStatus.ENABLED ? '禁用' : '启用'}该课时？`}
            onConfirm={() => handleToggleStatus(record.id, record.status)}
          >
            <Button type="link" size="small">
              {record.status === LessonStatus.ENABLED ? '禁用' : '启用'}
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确定删除该课时？"
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

  // 获取分类列表用于移动弹窗
  const categories = lessonStore.getCategories()

  return (
    <AdminLayout>
      <div className="lesson-list-page">
        {/* 左侧分类树 */}
        <Card className="category-panel">
          <CategoryTree
            selectedCategoryId={selectedCategoryId}
            onSelect={handleSelectCategory}
          />
        </Card>

        {/* 右侧课时列表 */}
        <Card className="lesson-panel" title="课时列表">
          {/* 筛选区域 */}
          <div className="lesson-filter-section">
            <Space wrap>
              <Input
                placeholder="课时名称"
                prefix={<SearchOutlined />}
                value={filters.name_kw}
                onChange={(e) => setFilters({ ...filters, name_kw: e.target.value })}
                style={{ width: 200 }}
                allowClear
              />
              <Select
                placeholder="状态"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                style={{ width: 120 }}
                allowClear
              >
                <Option value={LessonStatus.ENABLED}>启用</Option>
                <Option value={LessonStatus.DISABLED}>禁用</Option>
              </Select>
              <Button onClick={handleSearch}>搜索</Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>

            <Space>
              {selectedRowKeys.length > 0 && (
                <>
                  <Button onClick={handleOpenMoveModal} icon={<FolderOutlined />}>
                    移动 ({selectedRowKeys.length})
                  </Button>
                  <Popconfirm
                    title="确定批量删除选中的课时？"
                    onConfirm={handleBatchDelete}
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      删除 ({selectedRowKeys.length})
                    </Button>
                  </Popconfirm>
                </>
              )}
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                创建课时
              </Button>
            </Space>
          </div>

          {/* 表格 */}
          <Table
            columns={columns}
            dataSource={lessons}
            rowKey="id"
            loading={loading}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys
            }}
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
            scroll={{ x: 800 }}
          />
        </Card>

        {/* 移动课时弹窗 */}
        <Modal
          title="移动课时"
          open={moveModalVisible}
          onOk={handleMoveLessons}
          onCancel={() => setMoveModalVisible(false)}
        >
          <div className="move-modal-content">
            <p>将 {selectedRowKeys.length} 个课时移动到：</p>
            <Select
              placeholder="选择目标分类"
              value={targetCategoryId}
              onChange={setTargetCategoryId}
              style={{ width: '100%' }}
            >
              {categories.map(c => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  )
}

export default LessonList