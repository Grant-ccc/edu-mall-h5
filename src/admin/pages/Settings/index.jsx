import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, message, Spin } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import AdminLayout from '../../layouts/AdminLayout'
import { getSettings, updateSettings } from '../../api/settings'
import './index.css'

const { TextArea } = Input

function Settings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    getSettings()
      .then(data => { const map = {}; (data.list || data || []).forEach(s => { map[s.key] = s.value }); form.setFieldsValue(map) })
      .catch(() => message.error('加载设置失败'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      await updateSettings(values)
      message.success('设置已保存')
    } catch (error) {
      if (!error.errorFields) message.error('保存失败')
    } finally { setSaving(false) }
  }

  if (loading) return <AdminLayout><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '120px 0' }}><Spin size="large" /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="settings-page">
        <Card title="系统设置" className="settings-card">
          <Form form={form} layout="vertical">
            <Form.Item label="站点名称" name="site_name" rules={[{ required: true, message: '请输入站点名称' }]}>
              <Input placeholder="请输入站点名称" maxLength={50} />
            </Form.Item>
            <Form.Item label="客服电话" name="service_phone" rules={[{ required: true, message: '请输入客服电话' }]}>
              <Input placeholder="请输入客服电话" maxLength={20} />
            </Form.Item>
            <Form.Item label="站点公告" name="announcement">
              <TextArea placeholder="请输入站点公告" rows={4} maxLength={500} showCount />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleSave} loading={saving} icon={<SaveOutlined />}>保存设置</Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default Settings
