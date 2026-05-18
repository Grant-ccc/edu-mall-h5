import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Input, InputNumber, Select, Button, Space, message, Upload, Divider } from 'antd'
import { SaveOutlined, ArrowLeftOutlined, UploadOutlined, PlusOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons'
import AdminLayout from '../../layouts/AdminLayout'
import lessonStore from '../../stores/lessonStore'
import './index.css'

const { Option } = Select
const { TextArea } = Input

function LessonForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [videoFile, setVideoFile] = useState(null)
  const [attachments, setAttachments] = useState([])
  const [chapters, setChapters] = useState([])
  const [duration, setDuration] = useState(0)

  const isEdit = !!id

  // 加载分类列表
  useEffect(() => {
    lessonStore.fetchCategories().then(() => {
      setCategories(lessonStore.getState().categories)
    }).catch(() => {})

    // 编辑模式：加载课时数据
    if (isEdit) {
      lessonStore.fetchLessonDetail(id).then(lesson => {
        if (lesson) {
          form.setFieldsValue({
            name: lesson.name,
            detail: lesson.detail,
            category_id: lesson.category_id
          })
          setDuration(lesson.duration)
          setAttachments(lesson.attachments || [])
          setChapters(lesson.chapters || [])
        } else {
          message.error('课时不存在')
          navigate('/admin/lessons')
        }
      }).catch(() => {
        message.error('加载课时失败')
      })
    }
  }, [id])

  // 时长格式化
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}分钟`
    const hours = Math.floor(minutes / 60)
    const remainMinutes = minutes % 60
    return `${hours}小时${remainMinutes > 0 ? remainMinutes + '分钟' : ''}`
  }

  // 秒转时间字符串
  const secondsToTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // 时间字符串转秒
  const timeToSeconds = (timeStr) => {
    const parts = timeStr.split(':')
    if (parts.length === 3) {
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
    }
    return 0
  }

  // 返回列表
  const handleBack = () => {
    navigate('/admin/lessons')
  }

  // 视频上传前处理
  const handleVideoBeforeUpload = (file) => {
    // 演示模式：直接保存文件引用
    setVideoFile(file)
    // 模拟获取时长
    setDuration(Math.floor(Math.random() * 600 + 300)) // 5-15分钟随机
    return false
  }

  // 附件上传前处理
  const handleAttachmentBeforeUpload = (file) => {
    const newAttachment = {
      origin_name: file.name,
      file_key: `mock_key_${Date.now()}`,
      file_url: `mock_url_${file.name}`
    }
    setAttachments([...attachments, newAttachment])
    return false
  }

  // 删除附件
  const handleRemoveAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  // 添加章节
  const handleAddChapter = () => {
    const newChapter = {
      id: `chapter_${Date.now()}`,
      name: '',
      begin_position: 0,
      end_position: 0
    }
    setChapters([...chapters, newChapter])
  }

  // 删除章节
  const handleRemoveChapter = (index) => {
    setChapters(chapters.filter((_, i) => i !== index))
  }

  // 更新章节
  const handleUpdateChapter = (index, field, value) => {
    const updated = [...chapters]
    updated[index] = { ...updated[index], [field]: value }
    setChapters(updated)
  }

  // 保存课时
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const lessonData = {
        name: values.name,
        detail: values.detail || '',
        category_id: values.category_id || -1,
        video_key: videoFile ? `mock_video_key_${Date.now()}` : '',
        video_url: videoFile ? `mock_video_url` : '',
        video_file_name: videoFile?.name || '',
        attachments: attachments,
        duration: duration,
        chapters: chapters
      }

      let result
      if (isEdit) {
        result = await lessonStore.updateLesson({ ...lessonData, id: parseInt(id) })
      } else {
        result = await lessonStore.createLesson(lessonData)
      }

      setLoading(false)

      if (result.success) {
        message.success(isEdit ? '更新成功' : '创建成功')
        navigate('/admin/lessons')
      } else {
        message.error(result.message || '操作失败')
      }
    } catch (error) {
      setLoading(false)
      console.error('表单验证失败:', error)
    }
  }

  return (
    <AdminLayout>
      <div className="lesson-form-page">
        <Card title={isEdit ? '编辑课时' : '创建课时'} className="lesson-form-card">
          <Form
            form={form}
            layout="vertical"
            className="lesson-form"
          >
            {/* 基本信息 */}
            <div className="form-section">
              <h3 className="section-title">基本信息</h3>

              <Form.Item
                label="课时名称"
                name="name"
                rules={[{ required: true, message: '请输入课时名称' }]}
              >
                <Input placeholder="请输入课时名称" maxLength={100} />
              </Form.Item>

              <Form.Item
                label="所属分类"
                name="category_id"
              >
                <Select placeholder="请选择分类" allowClear>
                  {categories.map(c => (
                    <Option key={c.id} value={c.id}>{c.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="课时详情"
                name="detail"
              >
                <TextArea
                  placeholder="请输入课时详情"
                  rows={4}
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </div>

            {/* 视频上传 */}
            <div className="form-section">
              <h3 className="section-title">视频文件</h3>

              <Upload
                beforeUpload={handleVideoBeforeUpload}
                fileList={videoFile ? [{
                  uid: '-1',
                  name: videoFile.name,
                  status: 'done'
                }] : []}
                onRemove={() => {
                  setVideoFile(null)
                  setDuration(0)
                }}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>选择视频文件</Button>
              </Upload>

              {duration > 0 && (
                <div className="duration-display">
                  <PlayCircleOutlined style={{ marginRight: 8 }} />
                  <span>时长：{formatDuration(duration)}</span>
                  <Divider type="vertical" />
                  <span>({secondsToTime(duration)})</span>
                </div>
              )}

              <Form.Item label="视频时长（秒）">
                <InputNumber
                  value={duration}
                  onChange={setDuration}
                  min={0}
                  style={{ width: 200 }}
                  placeholder="手动输入时长"
                />
              </Form.Item>
            </div>

            {/* 附件管理 */}
            <div className="form-section">
              <h3 className="section-title">课时附件</h3>

              <Upload
                beforeUpload={handleAttachmentBeforeUpload}
                showUploadList={false}
                multiple
              >
                <Button icon={<UploadOutlined />}>添加附件</Button>
              </Upload>

              {attachments.length > 0 && (
                <div className="attachment-list">
                  {attachments.map((att, index) => (
                    <div key={index} className="attachment-item">
                      <span className="attachment-name">{att.origin_name}</span>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveAttachment(index)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 章节打点 */}
            <div className="form-section">
              <h3 className="section-title">视频章节</h3>

              <Button icon={<PlusOutlined />} onClick={handleAddChapter}>
                添加章节
              </Button>

              {chapters.length > 0 && (
                <div className="chapter-list">
                  {chapters.map((chapter, index) => (
                    <div key={chapter.id} className="chapter-item">
                      <div className="chapter-header">
                        <span>章节 {index + 1}</span>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveChapter(index)}
                        />
                      </div>
                      <div className="chapter-fields">
                        <Input
                          placeholder="章节名称"
                          value={chapter.name}
                          onChange={(e) => handleUpdateChapter(index, 'name', e.target.value)}
                          style={{ marginBottom: 8 }}
                        />
                        <Space>
                          <div>
                            <span>开始位置：</span>
                            <Input
                              placeholder="00:00:00"
                              value={secondsToTime(chapter.begin_position)}
                              onChange={(e) => handleUpdateChapter(index, 'begin_position', timeToSeconds(e.target.value))}
                              style={{ width: 100 }}
                            />
                          </div>
                          <div>
                            <span>结束位置：</span>
                            <Input
                              placeholder="00:00:00"
                              value={secondsToTime(chapter.end_position)}
                              onChange={(e) => handleUpdateChapter(index, 'end_position', timeToSeconds(e.target.value))}
                              style={{ width: 100 }}
                            />
                          </div>
                        </Space>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <Form.Item className="form-actions">
              <Space>
                <Button onClick={handleBack} icon={<ArrowLeftOutlined />}>
                  返回
                </Button>
                <Button type="primary" onClick={handleSubmit} loading={loading} icon={<SaveOutlined />}>
                  {isEdit ? '保存修改' : '创建课时'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default LessonForm