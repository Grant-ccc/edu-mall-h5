import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Input, InputNumber, Select, Button, Space, message, Upload, Switch } from 'antd'
import { SaveOutlined, ArrowLeftOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons'
import AdminLayout from '../../layouts/AdminLayout'
import courseStore, { CourseStatus, CourseUpdateStatus } from '../../stores/courseStore'
import './index.css'

const { Option } = Select
const { TextArea } = Input

function CourseForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [coverFile, setCoverFile] = useState(null)
  const [detailCoverFile, setDetailCoverFile] = useState(null)
  const [features, setFeatures] = useState([])
  const [newFeature, setNewFeature] = useState('')

  const isEdit = !!id

  // 编辑模式：加载课程数据
  useEffect(() => {
    if (isEdit) {
      courseStore.fetchCourseDetail(id).then(course => {
        if (course) {
          form.setFieldsValue({
            name: course.name,
            course_price: course.course_price / 100,
            service_time: course.service_time,
            learn_time: course.learn_time,
            update_status: course.update_status,
            status: course.status,
            detail: course.detail
          })
          setFeatures(course.features || [])
        } else {
          message.error('课程不存在')
          navigate('/admin/courses')
        }
      }).catch(() => {
        message.error('加载课程失败')
      })
    }
  }, [id])

  // 保存课程
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const courseData = {
        name: values.name,
        course_price: Math.round(values.course_price * 100), // 元转分
        service_time: values.service_time,
        learn_time: values.learn_time,
        update_status: values.update_status,
        status: values.status,
        features: features,
        detail: values.detail || '',
        cover_url: '', // 实际项目中这里应该是上传后的 URL
        detail_cover_url: ''
      }

      let result
      if (isEdit) {
        result = await courseStore.updateCourse({ ...courseData, id: parseInt(id) })
      } else {
        result = await courseStore.createCourse(courseData)
      }

      setLoading(false)

      if (result.success) {
        message.success(isEdit ? '更新成功' : '创建成功')
        navigate('/admin/courses')
      } else {
        message.error(result.message || '操作失败')
      }
    } catch (error) {
      setLoading(false)
      console.error('表单验证失败:', error)
    }
  }

  // 返回列表
  const handleBack = () => {
    navigate('/admin/courses')
  }

  // 添加特色标签
  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()])
      setNewFeature('')
    }
  }

  // 删除特色标签
  const handleRemoveFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  // 封面上传前处理
  const beforeUpload = (file) => {
    // 实际项目中这里应该调用临时密钥接口
    setCoverFile(file)
    return false // 阻止自动上传，手动处理
  }

  return (
    <AdminLayout>
      <div className="course-form-page">
        <Card title={isEdit ? '编辑课程' : '创建课程'} className="course-form-card">
          <Form
            form={form}
            layout="vertical"
            className="course-form"
            initialValues={{
              update_status: CourseUpdateStatus.UPDATING,
              status: CourseStatus.OFFLINE,
              service_time: 365,
              learn_time: 30
            }}
          >
            {/* 基本信息 */}
            <div className="form-section">
              <h3 className="section-title">基本信息</h3>

              <Form.Item
                label="课程名称"
                name="name"
                rules={[{ required: true, message: '请输入课程名称' }]}
              >
                <Input placeholder="请输入课程名称" maxLength={100} />
              </Form.Item>

              <Form.Item
                label="课程价格（元）"
                name="course_price"
                rules={[
                  { required: true, message: '请输入课程价格' },
                  { type: 'number', min: 0, message: '价格不能为负数' }
                ]}
              >
                <InputNumber
                  placeholder="请输入价格"
                  precision={2}
                  min={0}
                  style={{ width: 200 }}
                  prefix="¥"
                />
              </Form.Item>

              <Space size="large">
                <Form.Item
                  label="服务时长（天）"
                  name="service_time"
                  rules={[{ required: true, message: '请输入服务时长' }]}
                >
                  <InputNumber min={1} style={{ width: 120 }} />
                </Form.Item>

                <Form.Item
                  label="学习时长（天）"
                  name="learn_time"
                  rules={[{ required: true, message: '请输入学习时长' }]}
                >
                  <InputNumber min={1} style={{ width: 120 }} />
                </Form.Item>
              </Space>
            </div>

            {/* 状态设置 */}
            <div className="form-section">
              <h3 className="section-title">状态设置</h3>

              <Space size="large">
                <Form.Item
                  label="更新状态"
                  name="update_status"
                >
                  <Select style={{ width: 120 }}>
                    <Option value={CourseUpdateStatus.UPDATING}>更新中</Option>
                    <Option value={CourseUpdateStatus.COMPLETED}>已完结</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="课程状态"
                  name="status"
                >
                  <Select style={{ width: 120 }}>
                    <Option value={CourseStatus.OFFLINE}>下架</Option>
                    <Option value={CourseStatus.ONLINE}>上架</Option>
                  </Select>
                </Form.Item>
              </Space>
            </div>

            {/* 课程特色 */}
            <div className="form-section">
              <h3 className="section-title">课程特色</h3>

              <div className="features-input">
                <Input
                  placeholder="输入特色标签"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onPressEnter={handleAddFeature}
                  style={{ width: 200 }}
                />
                <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddFeature}>
                  添加
                </Button>
              </div>

              <div className="features-list">
                {features.map((feature, index) => (
                  <span key={index} className="feature-tag">
                    {feature}
                    <a onClick={() => handleRemoveFeature(index)}>×</a>
                  </span>
                ))}
              </div>
            </div>

            {/* 封面上传 */}
            <div className="form-section">
              <h3 className="section-title">课程封面</h3>

              <Form.Item label="封面图片">
                <Upload
                  listType="picture-card"
                  beforeUpload={beforeUpload}
                  fileList={coverFile ? [{ uid: '-1', name: coverFile.name, status: 'done', originFileObj: coverFile }] : []}
                  onRemove={() => setCoverFile(null)}
                  maxCount={1}
                >
                  {!coverFile && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>上传封面</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              <Form.Item label="详情封面图片">
                <Upload
                  listType="picture-card"
                  beforeUpload={(file) => { setDetailCoverFile(file); return false }}
                  fileList={detailCoverFile ? [{ uid: '-1', name: detailCoverFile.name, status: 'done', originFileObj: detailCoverFile }] : []}
                  onRemove={() => setDetailCoverFile(null)}
                  maxCount={1}
                >
                  {!detailCoverFile && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>上传详情封面</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </div>

            {/* 课程详情 */}
            <div className="form-section">
              <h3 className="section-title">课程详情</h3>

              <Form.Item
                label="详情描述"
                name="detail"
              >
                <TextArea
                  placeholder="请输入课程详情（支持 HTML）"
                  rows={6}
                  maxLength={5000}
                  showCount
                />
              </Form.Item>
            </div>

            {/* 操作按钮 */}
            <Form.Item className="form-actions">
              <Space>
                <Button onClick={handleBack} icon={<ArrowLeftOutlined />}>
                  返回
                </Button>
                <Button type="primary" onClick={handleSubmit} loading={loading} icon={<SaveOutlined />}>
                  {isEdit ? '保存修改' : '创建课程'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default CourseForm