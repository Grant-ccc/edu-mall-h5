import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Tabs, Form, Input, Button, message } from 'antd'
import { MobileOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'
import SliderCaptcha from '../../../shared/components/SliderCaptcha'
import WechatQrCode from '../../../shared/components/WechatQrCode'
import authStore from '../../stores/authStore'
import '../../../shared/styles/login.css'

const { TabPane } = Tabs

function Login() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('sms') // sms | password | wechat
  const [loading, setLoading] = useState(false)

  // 表单状态
  const [mobile, setMobile] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [password, setPassword] = useState('')

  // 滑块验证
  const [captchaTicket, setCaptchaTicket] = useState(null)
  const [captchaValid, setCaptchaValid] = useState(false)

  // 验证码倒计时
  const [countdown, setCountdown] = useState(0)

  // 检查是否已登录
  useEffect(() => {
    if (authStore.isLogin()) {
      navigate('/')
    }
  }, [])

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // 滑块验证成功
  const handleCaptchaSuccess = (ticket) => {
    setCaptchaTicket(ticket)
    setCaptchaValid(true)
  }

  // 发送短信验证码
  const handleSendSms = async () => {
    if (!mobile || mobile.length !== 11) {
      message.error('请输入正确的手机号')
      return
    }
    if (!captchaValid) {
      message.error('请先完成滑块验证')
      return
    }

    // 演示模式：直接开始倒计时
    message.success('验证码已发送（演示模式，验证码：123456）')
    setCountdown(60)
  }

  // 验证码登录
  const handleSmsLogin = async () => {
    if (!mobile || mobile.length !== 11) {
      message.error('请输入正确的手机号')
      return
    }
    if (!verifyCode) {
      message.error('请输入验证码')
      return
    }

    setLoading(true)
    try {
      // 演示模式：验证码为 123456 即可登录
      if (verifyCode === '123456') {
        const mockUser = {
          user_id: Date.now(),
          nick_name: mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
          icon_url: '',
          sex: 0,
          mobile: mobile
        }
        authStore.login('mock_token_' + Date.now(), mockUser)
        message.success('登录成功')
        navigate('/')
      } else {
        message.error('验证码错误（演示模式请输入：123456）')
      }
    } finally {
      setLoading(false)
    }
  }

  // 密码登录
  const handlePasswordLogin = async () => {
    if (!mobile || mobile.length !== 11) {
      message.error('请输入正确的手机号')
      return
    }
    if (!password) {
      message.error('请输入密码')
      return
    }
    if (!captchaValid) {
      message.error('请先完成滑块验证')
      return
    }

    setLoading(true)
    try {
      // 演示模式：任意密码可登录
      const mockUser = {
        user_id: Date.now(),
        nick_name: mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
        icon_url: '',
        sex: 0,
        mobile: mobile
      }
      authStore.login('mock_token_' + Date.now(), mockUser)
      message.success('登录成功')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  // 微信扫码登录成功
  const handleWechatLoginSuccess = (token, user) => {
    authStore.login(token, user)
    message.success('登录成功')
    navigate('/')
  }

  // Tab 切换时重置滑块状态
  const handleTabChange = (key) => {
    setActiveTab(key)
    setCaptchaValid(false)
    setCaptchaTicket(null)
  }

  return (
    <div className="login-page">
      {/* 左侧展示区 */}
      <div className="login-left">
        <h1>在线教育商城</h1>
        <p>课程虚拟商品交易系统，从浏览、购买到学习的完整闭环</p>
        <div className="login-features">
          <div className="login-feature-item">
            <SafetyOutlined />
            <span>安全支付</span>
          </div>
          <div className="login-feature-item">
            <MobileOutlined />
            <span>移动学习</span>
          </div>
          <div className="login-feature-item">
            <LockOutlined />
            <span>权益保障</span>
          </div>
        </div>
      </div>

      {/* 右侧登录卡片 */}
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-card-title">登录 / 注册</h2>

          <Tabs activeKey={activeTab} onChange={handleTabChange} className="login-tabs">
            {/* 验证码登录 Tab */}
            <TabPane tab="验证码登录" key="sms">
              <Form layout="vertical" className="login-form">
                <Form.Item label="手机号">
                  <Input
                    prefix={<MobileOutlined />}
                    placeholder="请输入手机号"
                    maxLength={11}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  />
                </Form.Item>

                <Form.Item label="滑块验证">
                  <SliderCaptcha onSuccess={handleCaptchaSuccess} />
                </Form.Item>

                <Form.Item label="验证码">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Input
                      placeholder="请输入验证码"
                      maxLength={6}
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      className="sms-btn"
                      disabled={countdown > 0 || !captchaValid}
                      onClick={handleSendSms}
                    >
                      {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </Button>
                  </div>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    className="login-btn"
                    loading={loading}
                    onClick={handleSmsLogin}
                  >
                    登录 / 注册
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            {/* 密码登录 Tab */}
            <TabPane tab="密码登录" key="password">
              <Form layout="vertical" className="login-form">
                <Form.Item label="手机号">
                  <Input
                    prefix={<MobileOutlined />}
                    placeholder="请输入手机号"
                    maxLength={11}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  />
                </Form.Item>

                <Form.Item label="密码">
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Item>

                <Form.Item label="滑块验证">
                  <SliderCaptcha onSuccess={handleCaptchaSuccess} />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    className="login-btn"
                    loading={loading}
                    onClick={handlePasswordLogin}
                  >
                    登录
                  </Button>
                </Form.Item>

                <Link to="/reset-password" className="forgot-password-link">
                  忘记密码？
                </Link>
              </Form>
            </TabPane>

            {/* 微信登录 Tab */}
            <TabPane tab="微信登录" key="wechat">
              <WechatQrCode onSuccess={handleWechatLoginSuccess} />
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default Login
