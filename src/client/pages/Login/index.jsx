import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { message } from 'antd'
import SliderCaptcha from '../../../shared/components/SliderCaptcha'
import authStore from '../../stores/authStore'
import { sendSmsCode, verifyCodeLogin, passwordLogin, resetPassword, appletLogin } from '../../api/auth'
import '../../../shared/styles/login.css'

function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // 页面步骤: main | verify | password | lark | reset
  const [step, setStep] = useState('main')
  const [loading, setLoading] = useState(false)

  // Lark 登录配置（来自 login(1).html）
  const LARK_APP_ID = 'cli_a955e814feba9cb3'
  const LARK_REDIRECT_URI = window.location.origin + '/lark-callback'

  // 表单字段
  const [mobile, setMobile] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // 验证码弹窗
  const [captchaVisible, setCaptchaVisible] = useState(false)
  const [captchaTicket, setCaptchaTicket] = useState('')
  const [pendingAction, setPendingAction] = useState('') // 'sendSms' | 'passwordLogin' | 'resetSms'

  // 倒计时
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef(null)

  // 检查已登录
  useEffect(() => {
    if (authStore.isLogin()) navigate('/')
  }, [])

  // 退出登录后显示提示
  useEffect(() => {
    if (searchParams.get('from') === 'logout') {
      message.success('您已成功退出登录')
    }
  }, [])

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(timerRef.current)
    }
  }, [countdown])

  // ===== 滑块验证码 =====
  const showCaptcha = (action) => {
    setPendingAction(action)
    setCaptchaVisible(true)
  }

  const handleCaptchaSuccess = (ticket) => {
    setCaptchaTicket(ticket)
    setCaptchaVisible(false)

    // 延迟执行对应操作
    setTimeout(() => {
      if (pendingAction === 'sendSms') doSendSms(ticket)
      else if (pendingAction === 'passwordLogin') doPasswordLogin(ticket)
      else if (pendingAction === 'resetSms') doResetSms(ticket)
      setPendingAction('')
    }, 500)
  }

  const handleCaptchaClose = () => {
    setCaptchaVisible(false)
    setPendingAction('')
  }

  // ===== 发送短信验证码 =====
  const doSendSms = async (ticket) => {
    try {
      await sendSmsCode('login', mobile, ticket)
      message.success('验证码已发送')
      setCountdown(60)
    } catch (error) {
      console.error('发送验证码失败:', error)
    }
  }

  // ===== 验证码登录 =====
  const handleVerifyLogin = async () => {
    if (!/^1\d{10}$/.test(mobile)) { message.error('请输入正确的手机号'); return }
    if (!verifyCode) { message.error('请输入验证码'); return }

    setLoading(true)
    try {
      const data = await verifyCodeLogin(mobile, verifyCode)
      const user = data.user_info?.user || {}
      authStore.login(data.token, user)
      message.success('登录成功')
      navigate('/')
    } catch (error) {
      console.error('登录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // ===== 密码登录 =====
  const doPasswordLogin = async (ticket) => {
    setLoading(true)
    try {
      const data = await passwordLogin(mobile, password, ticket)
      const user = data.user_info?.user || {}
      authStore.login(data.token, user)
      message.success('登录成功')
      navigate('/')
    } catch (error) {
      console.error('登录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // ===== 重置密码 =====
  const doResetSms = async (ticket) => {
    try {
      await sendSmsCode('reset_password', mobile, ticket)
      message.success('验证码已发送')
      setCountdown(60)
    } catch (error) {
      console.error('发送失败:', error)
    }
  }

  const handleResetPassword = async () => {
    if (!/^1\d{10}$/.test(mobile)) { message.error('请输入正确的手机号'); return }
    if (!verifyCode) { message.error('请输入验证码'); return }
    if (!password) { message.error('请输入新密码'); return }
    if (password !== confirmPassword) { message.error('两次密码不一致'); return }

    setLoading(true)
    try {
      await resetPassword(mobile, password, confirmPassword, verifyCode)
      message.success('密码重置成功，请重新登录')
      setStep('password')
    } catch (error) {
      console.error('重置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // ===== 飞书登录 =====
  const startLarkLogin = () => {
    const state = Math.random().toString(36).substring(2)
    sessionStorage.setItem('lark_auth_state', state)
    sessionStorage.setItem('lark_auth_mode', 'login')

    const authUrl =
      `https://open.feishu.cn/open-apis/authen/v1/authorize?` +
      `app_id=${LARK_APP_ID}&` +
      `redirect_uri=${encodeURIComponent(LARK_REDIRECT_URI)}&` +
      `state=${state}`

    window.location.href = authUrl
  }

  // Mock 飞书登录（开发/演示用）
  const handleMockLarkLogin = async () => {
    setLoading(true)
    try {
      const data = await appletLogin(2000, 'mock_code_' + Date.now(), 'lark')
      const user = data.user_info?.user || {}
      authStore.login(data.token, user)
      message.success('登录成功')
      navigate('/')
    } catch (error) {
      console.error('飞书登录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // ===== 页面切换 =====
  const goStep = (s) => {
    setStep(s)
    setVerifyCode('')
    setPassword('')
    setConfirmPassword('')
    setCountdown(0)
  }

  // ===== 渲染 =====
  return (
    <div className="login-page-new">
      {/* ====== 主页面 ====== */}
      {step === 'main' && (
        <div className="login-card">
          <div className="login-logo">🚀</div>
          <h1>在线教育商城</h1>
          <p className="login-subtitle">选择登录方式</p>

          <button className="login-btn login-btn-primary" onClick={() => goStep('verify')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
            </svg>
            手机号验证码登录
          </button>
          <button className="login-btn login-btn-secondary" onClick={() => goStep('password')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/>
            </svg>
            手机号密码登录
          </button>
          <button className="login-btn login-btn-secondary" onClick={() => goStep('lark')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 17.2c-5 0-9.27-4.07-9.8-9.2h2.04c.5 3.9 3.76 6.8 7.76 6.8s7.26-2.9 7.76-6.8h2.04c-.53 5.13-4.8 9.2-9.8 9.2z"/>
            </svg>
            飞书扫码登录
          </button>
        </div>
      )}

      {/* ====== 飞书登录页 ====== */}
      {step === 'lark' && (
        <div className="login-card">
          <div className="login-logo">🚀</div>
          <h1>飞书扫码登录</h1>
          <p className="login-subtitle">即将跳转到飞书授权页面</p>

          <button className="login-btn login-btn-primary" onClick={startLarkLogin}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 17.2c-5 0-9.27-4.07-9.8-9.2h2.04c.5 3.9 3.76 6.8 7.76 6.8s7.26-2.9 7.76-6.8h2.04c-.53 5.13-4.8 9.2-9.8 9.2z"/>
            </svg>
            前往飞书扫码
          </button>

          <button
            className="login-btn login-btn-secondary"
            onClick={handleMockLarkLogin}
            disabled={loading}
          >
            {loading ? '登录中...' : '模拟飞书登录 (演示)'}
          </button>

          <button className="login-btn-back" onClick={() => goStep('main')}>← 返回</button>
        </div>
      )}

      {/* ====== 验证码登录页 ====== */}
      {step === 'verify' && (
        <div className="login-card">
          <div className="login-logo">📱</div>
          <h1>验证码登录</h1>
          <p className="login-subtitle">使用手机验证码安全登录</p>

          <div className="login-form-group">
            <label>手机号</label>
            <input
              type="tel" placeholder="请输入手机号" maxLength={11}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="login-form-group">
            <label>验证码</label>
            <div className="login-input-row">
              <input
                type="text" placeholder="请输入验证码" maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                className="login-btn-code"
                disabled={countdown > 0 || !/^1\d{10}$/.test(mobile)}
                onClick={() => showCaptcha('sendSms')}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            </div>
          </div>

          <button
            className="login-btn login-btn-primary"
            disabled={!/^1\d{10}$/.test(mobile) || !verifyCode}
            onClick={handleVerifyLogin}
          >
            {loading ? '登录中...' : '登录'}
          </button>

          <button className="login-btn-back" onClick={() => goStep('main')}>← 返回</button>
        </div>
      )}

      {/* ====== 密码登录页 ====== */}
      {step === 'password' && (
        <div className="login-card">
          <div className="login-logo">🔐</div>
          <h1>密码登录</h1>
          <p className="login-subtitle">使用手机号和密码登录</p>

          <div className="login-form-group">
            <label>手机号</label>
            <input
              type="tel" placeholder="请输入手机号" maxLength={11}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="login-form-group">
            <label>密码</label>
            <input
              type="password" placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login-link" onClick={() => goStep('reset')}>忘记密码？</button>

          <button
            className="login-btn login-btn-primary"
            disabled={!/^1\d{10}$/.test(mobile) || !password}
            onClick={() => showCaptcha('passwordLogin')}
          >
            {loading ? '登录中...' : '登录'}
          </button>

          <button className="login-btn-back" onClick={() => goStep('main')}>← 返回</button>
        </div>
      )}

      {/* ====== 重置密码页 ====== */}
      {step === 'reset' && (
        <div className="login-card">
          <div className="login-logo">🔁</div>
          <h1>重置密码</h1>
          <p className="login-subtitle">验证码校验后重置登录密码</p>

          <div className="login-form-group">
            <label>手机号</label>
            <input
              type="tel" placeholder="请输入手机号" maxLength={11}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="login-form-group">
            <label>验证码</label>
            <div className="login-input-row">
              <input
                type="text" placeholder="请输入验证码" maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                className="login-btn-code"
                disabled={countdown > 0 || !/^1\d{10}$/.test(mobile)}
                onClick={() => showCaptcha('resetSms')}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            </div>
          </div>

          <div className="login-form-group">
            <label>新密码</label>
            <input
              type="password" placeholder="请输入新密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="login-form-group">
            <label>确认新密码</label>
            <input
              type="password" placeholder="请再次输入新密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            className="login-btn login-btn-primary"
            disabled={!/^1\d{10}$/.test(mobile) || !verifyCode || !password || !confirmPassword}
            onClick={handleResetPassword}
          >
            {loading ? '重置中...' : '确认重置'}
          </button>

          <button className="login-btn-back" onClick={() => goStep('password')}>← 返回密码登录</button>
        </div>
      )}

      {/* ====== 滑块验证码弹窗 ====== */}
      <SliderCaptcha
        visible={captchaVisible}
        onSuccess={handleCaptchaSuccess}
        onClose={handleCaptchaClose}
      />
    </div>
  )
}

export default Login
