import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Spin } from 'antd'
import authStore from '../../stores/authStore'
import { appletLogin } from '../../api/auth'

/**
 * 飞书 OAuth 回调页面
 * 接收 Lark 重定向回来的 code 和 state，调用后端完成登录
 */
function LarkCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')

      if (!code) {
        setError('授权失败：未获取到授权码')
        return
      }

      const savedState = sessionStorage.getItem('lark_auth_state')
      if (state && savedState && state !== savedState) {
        setError('授权验证失败：state 不匹配')
        return
      }

      sessionStorage.removeItem('lark_auth_state')
      sessionStorage.removeItem('lark_auth_mode')

      try {
        const data = await appletLogin(2000, code, 'lark')
        const user = data.user_info?.user || {}
        authStore.login(data.token, user)
        navigate('/', { replace: true })
      } catch (err) {
        console.error('飞书登录失败:', err)
        setError(err.message || '飞书登录失败，请重试')
      }
    }

    handleCallback()
  }, [])

  if (error) {
    return (
      <div className="login-page-new">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div className="login-logo">❌</div>
          <h1>登录失败</h1>
          <p style={{ color: '#ff4d4f', margin: '16px 0' }}>{error}</p>
          <button className="login-btn login-btn-secondary" onClick={() => navigate('/login')}>
            返回重新登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page-new">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: '#666' }}>飞书授权中，请稍候...</p>
      </div>
    </div>
  )
}

export default LarkCallback
