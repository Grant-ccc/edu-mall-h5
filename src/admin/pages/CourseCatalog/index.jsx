import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Input, Space, Tree, Table, Tag, Modal, Form, Popconfirm, message, Empty, Switch, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, FolderOutlined, PlayCircleOutlined } from '@ant-design/icons'
import AdminLayout from '../../layouts/AdminLayout'
import courseStore from '../../stores/courseStore'
import './index.css'

function CourseCatalog() {
  const navigate = useNavigate()
  const { id: courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [catalogData, setCatalogData] = useState({ catalogs: [], total_duration: 0, lesson_count: 0 })
  const [selectedCatalog, setSelectedCatalog] = useState(null)
  const [catalogModalVisible, setCatalogModalVisible] = useState(false)
  const [editingCatalog, setEditingCatalog] = useState(null)
  const [lessonModalVisible, setLessonModalVisible] = useState(false)
  const [form] = Form.useForm()

  // Mock 课时数据（实际项目中应该从课时管理模块获取）
  const mockLessons = [
    { lesson_id: 101, name: '项目介绍与环境搭建', duration: 600 },
    { lesson_id: 102, name: 'Go Module初始化', duration: 480 },
    { lesson_id: 103, name: '项目目录结构设计', duration: 520 },
    { lesson_id: 201, name: '用户表设计', duration: 580 },
    { lesson_id: 202, name: '课程表设计', duration: 620 },
    { lesson_id: 203, name: '订单表设计', duration: 700 }
  ]

  // 加载课程和目录数据
  useEffect(() => {
    const courseData = courseStore.getCourse(courseId)
    if (courseData) {
      setCourse(courseData)
      const catalog = courseStore.getCatalog(courseId)
      setCatalogData(catalog)
    } else {
      message.error('课程不存在')
      navigate('/admin/courses')
    }

    // 订阅状态变化
    const unsubscribe = courseStore.subscribe(() => {
      const catalog = courseStore.getCatalog(courseId)
      setCatalogData(catalog)
    })

    return unsubscribe
  }, [courseId])

  // 时长格式化
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}分钟`
    const hours = Math.floor(minutes / 60)
    const remainMinutes = minutes % 60
    return `${hours}小时${remainMinutes > 0 ? remainMinutes + '分钟' : ''}`
  }

  // 返回列表
  const handleBack = () => {
    navigate('/admin/courses')
  }

  // 打开添加目录弹窗
  const handleAddCatalog = () => {
    setEditingCatalog(null)
    form.resetFields()
    setCatalogModalVisible(true)
  }

  // 打开编辑目录弹窗
  const handleEditCatalog = (catalog) => {
    setEditingCatalog(catalog)
    form.setFieldsValue({ name: catalog.name })
    setCatalogModalVisible(true)
  }

  // 保存目录
  const handleSaveCatalog = async () => {
    try {
      const values = await form.validateFields()
      if (editingCatalog) {
        // 更新目录
        courseStore.updateCatalog(courseId, editingCatalog.id, { name: values.name })
        message.success('目录更新成功')
      } else {
        // 添加目录
        courseStore.addCatalog(courseId, { name: values.name, sort: catalogData.catalogs.length + 1 })
        message.success('目录添加成功')
      }
      setCatalogModalVisible(false)
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  // 删除目录
  const handleDeleteCatalog = (catalogId) => {
    const result = courseStore.deleteCatalog(courseId, catalogId)
    if (result.success) {
      message.success('目录删除成功')
    } else {
      message.error(result.message)
    }
  }

  // 选择目录
  const handleSelectCatalog = (catalogId) => {
    setSelectedCatalog(catalogData.catalogs.find(c => c.id === catalogId))
  }

  // 打开添加课时弹窗
  const handleAddLesson = () => {
    if (!selectedCatalog) {
      message.warning('请先选择一个目录')
      return
    }
    setLessonModalVisible(true)
  }

  // 添加课时到目录（模拟）
  const handleAddLessonToCatalog = (lesson) => {
    if (!selectedCatalog) return

    const newCatalogLesson = {
      id: Date.now(),
      lesson_id: lesson.lesson_id,
      name: lesson.name,
      lesson_name: lesson.name,
      duration: lesson.duration,
      status: 1,
      show_time: 0,
      enable_trial: 0
    }

    // 更新目录中的课时列表
    const updatedCatalogs = catalogData.catalogs.map(c => {
      if (c.id === selectedCatalog.id) {
        return {
          ...c,
          lessons: [...(c.lessons || []), newCatalogLesson],
          lesson_count: (c.lessons || []).length + 1
        }
      }
      return c
    })

    courseStore.setCatalog(courseId, {
      catalogs: updatedCatalogs,
      total_duration: catalogData.total_duration + lesson.duration,
      lesson_count: catalogData.lesson_count + 1
    })

    setLessonModalVisible(false)
    message.success('课时添加成功')
  }

  // 从目录移除课时
  const handleRemoveLesson = (catalogLessonId) => {
    const lessonToRemove = selectedCatalog?.lessons?.find(l => l.id === catalogLessonId)
    if (!lessonToRemove) return

    const updatedCatalogs = catalogData.catalogs.map(c => {
      if (c.id === selectedCatalog.id) {
        return {
          ...c,
          lessons: c.lessons.filter(l => l.id !== catalogLessonId),
          lesson_count: c.lessons.length - 1
        }
      }
      return c
    })

    courseStore.setCatalog(courseId, {
      catalogs: updatedCatalogs,
      total_duration: catalogData.total_duration - lessonToRemove.duration,
      lesson_count: catalogData.lesson_count - 1
    })

    message.success('课时移除成功')
  }

  // 课时表格列定义
  const lessonColumns = [
    {
      title: '序号',
      render: (_, __, index) => index + 1,
      width: 60
    },
    {
      title: '课时名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (d) => formatDuration(d)
    },
    {
      title: '试看',
      dataIndex: 'enable_trial',
      key: 'enable_trial',
      width: 80,
      render: (v) => <Tag color={v === 1 ? 'orange' : 'default'}>{v === 1 ? '可试看' : '不可试看'}</Tag>
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="确定移除该课时？"
          onConfirm={() => handleRemoveLesson(record.id)}
        >
          <Button type="link" size="small" danger>移除</Button>
        </Popconfirm>
      )
    }
  ]

  // 目录树数据
  const treeData = catalogData.catalogs.map(catalog => ({
    key: catalog.id,
    title: (
      <div className="catalog-tree-node">
        <span>{catalog.name}</span>
        <span className="catalog-lesson-count">({catalog.lessons?.length || 0}课时)</span>
        <Space className="catalog-actions">
          <Button type="link" size="small" onClick={() => handleEditCatalog(catalog)}>
            <EditOutlined />
          </Button>
          <Popconfirm
            title="确定删除该目录？"
            onConfirm={() => handleDeleteCatalog(catalog.id)}
          >
            <Button type="link" size="small" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      </div>
    ),
    icon: <FolderOutlined />
  }))

  return (
    <AdminLayout>
      <div className="course-catalog-page">
        {/* 头部信息 */}
        <Card className="catalog-header-card">
          <div className="catalog-header">
            <div className="catalog-title">
              <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>返回</Button>
              <h2>{course?.name || '课程目录编排'}</h2>
            </div>
            <div className="catalog-stats">
              <Tag color="blue">总课时：{catalogData.lesson_count}</Tag>
              <Tag color="green">总时长：{formatDuration(catalogData.total_duration)}</Tag>
            </div>
          </div>
        </Card>

        {/* 目录编排区域 */}
        <div className="catalog-content">
          {/* 左侧目录树 */}
          <Card title="课程目录" className="catalog-tree-card" extra={
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddCatalog}>
              添加目录
            </Button>
          }>
            {catalogData.catalogs.length === 0 ? (
              <Empty description="暂无目录，点击添加" />
            ) : (
              <Tree
                showIcon
                treeData={treeData}
                selectedKeys={selectedCatalog ? [selectedCatalog.id] : []}
                onSelect={(keys) => {
                  if (keys.length > 0) {
                    handleSelectCatalog(keys[0])
                  }
                }}
                className="catalog-tree"
              />
            )}
          </Card>

          {/* 右侧课时列表 */}
          <Card
            title={selectedCatalog ? `${selectedCatalog.name} - 课时列表` : '课时列表'}
            className="catalog-lesson-card"
            extra={
              selectedCatalog && (
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddLesson}>
                  添加课时
                </Button>
              )
            }
          >
            {!selectedCatalog ? (
              <Empty description="请先选择一个目录" />
            ) : (selectedCatalog.lessons?.length || 0) === 0 ? (
              <Empty description="暂无课时，点击添加" />
            ) : (
              <Table
                columns={lessonColumns}
                dataSource={selectedCatalog?.lessons || []}
                rowKey="id"
                pagination={false}
                size="small"
              />
            )}
          </Card>
        </div>

        {/* 添加/编辑目录弹窗 */}
        <Modal
          title={editingCatalog ? '编辑目录' : '添加目录'}
          open={catalogModalVisible}
          onOk={handleSaveCatalog}
          onCancel={() => setCatalogModalVisible(false)}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="目录名称"
              name="name"
              rules={[{ required: true, message: '请输入目录名称' }]}
            >
              <Input placeholder="请输入目录名称，如：第一章 基础入门" maxLength={50} />
            </Form.Item>
          </Form>
        </Modal>

        {/* 添加课时弹窗 */}
        <Modal
          title="选择课时"
          open={lessonModalVisible}
          onCancel={() => setLessonModalVisible(false)}
          footer={null}
          width={500}
        >
          <div className="lesson-select-list">
            {mockLessons.map(lesson => (
              <div key={lesson.lesson_id} className="lesson-select-item">
                <div className="lesson-info">
                  <PlayCircleOutlined style={{ marginRight: 8 }} />
                  <span className="lesson-name">{lesson.name}</span>
                  <span className="lesson-duration">{formatDuration(lesson.duration)}</span>
                </div>
                <Button type="primary" size="small" onClick={() => handleAddLessonToCatalog(lesson)}>
                  添加
                </Button>
              </div>
            ))}
          </div>
        </Modal>
      </div>
    </AdminLayout>
  )
}

export default CourseCatalog