import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Tabs, message } from 'antd'
import { MobileOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'
import adminAuthStore from '../../../stores/adminAuthStore'
import SliderCaptcha from '../../../components/SliderCaptcha'
import './index.css'

function AdminLogin() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('password')
  const [loading, setLoading] = useState(false)
  const [captchaTicket, setCaptchaTicket] = useState(null)
  const [mobile, setMobile] = useState('')
  const [countDown, setCountDown] = useState(0)
  const countDownRef = useRef(null)
  const [form] = Form.useForm()
  const [showSlider, setShowSlider] = useState(false)

  // 清理定时器
  useEffect(() => {
    return () => {
      if (countDownRef.current) {
        clearInterval(countDownRef.current)
      }
    }
  }, [])

  // 密码登录
  const handlePasswordLogin = async (values) => {
    setLoading(true)
    try {
      const result = adminAuthStore.login(values.mobile, values.password)
      if (result.success) {
        message.success('登录成功')
        navigate('/admin')
      } else {
        message.error(result.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // 滑块验证成功后，发送短信验证码
  const handleCaptchaSuccess = (ticket) => {
    setCaptchaTicket(ticket)
    setShowSlider(false)
    message.success('验证码已发送：123456')
    // 开始倒计时
    setCountDown(60)
    countDownRef.current = setInterval(() => {
      setCountDown(prev => {
        if (prev <= 1) {
          clearInterval(countDownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // 点击获取验证码
  const handleGetVerifyCode = () => {
    const mobileValue = form.getFieldValue('mobile')
    if (!mobileValue) {
      message.warning('请先输入手机号')
      return
    }
    setMobile(mobileValue)
    setShowSlider(true)
  }

  // 验证码登录
  const handleVerifyCodeLogin = async (values) => {
    setLoading(true)
    try {
      const result = adminAuthStore.loginWithVerifyCode(values.mobile, values.verify_code)
      if (result.success) {
        message.success('登录成功')
        navigate('/admin')
      } else {
        message.error(result.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1>EDU Mall Admin</h1>
          <p>在线教育商城管理后台</p>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} className="admin-login-tabs">
          <Tabs.TabPane tab="手机号密码登录" key="password">
            <Form onFinish={handlePasswordLogin} layout="vertical">
              <Form.Item name="mobile" rules={[{ required: true, message: '请输入手机号' }]}>
                <Input prefix={<MobileOutlined />} placeholder="手机号" size="large" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                  登录
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="手机号验证码登录" key="verify_code">
            <Form form={form} onFinish={handleVerifyCodeLogin} layout="vertical">
              <Form.Item name="mobile" rules={[{ required: true, message: '请输入手机号' }]}>
                <Input prefix={<MobileOutlined />} placeholder="手机号" size="large" />
              </Form.Item>
              <Form.Item>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Form.Item name="verify_code" noStyle rules={[{ required: true, message: '请输入验证码' }]}>
                    <Input prefix={<SafetyOutlined />} placeholder="验证码" size="large" style={{ flex: 1 }} />
                  </Form.Item>
                  <Button
                    size="large"
                    onClick={handleGetVerifyCode}
                    disabled={countDown > 0}
                  >
                    {countDown > 0 ? `${countDown}s` : '获取验证码'}
                  </Button>
                </div>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                  登录
                </Button>
              </Form.Item>
            </Form>
            <div className="admin-login-tip">
              演示模式：验证码为 123456
            </div>
            {/* 滑块验证码 - 嵌入到卡片内 */}
            {showSlider && (
              <div className="admin-slider-container">
                <SliderCaptcha onSuccess={handleCaptchaSuccess} />
                <Button
                  type="text"
                  className="admin-slider-close"
                  onClick={() => setShowSlider(false)}
                >
                  取消
                </Button>
              </div>
            )}
          </Tabs.TabPane>
        </Tabs>

        <div className="admin-login-footer">
          演示账号：13800000000（任意密码可登录）
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
