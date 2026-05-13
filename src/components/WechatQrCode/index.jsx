import { useState, useEffect } from 'react'
import './index.css'

/**
 * 微信扫码登录组件（演示版）
 * 展示二维码并模拟扫码状态变化
 */
function WechatQrCode({ onSuccess }) {
  // 状态：waiting(等待扫码) -> scanned(已扫码待确认) -> success(登录成功)
  const [status, setStatus] = useState('waiting')
  const [qrcodeUrl, setQrcodeUrl] = useState('')
  const [countdown, setCountdown] = useState(120) // 二维码有效期

  // 生成演示二维码
  useEffect(() => {
    // 使用占位二维码图片
    setQrcodeUrl('data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect fill="#fff" width="200" height="200"/>
        <text x="100" y="90" text-anchor="middle" fill="#333" font-size="14">微信扫码登录</text>
        <text x="100" y="110" text-anchor="middle" fill="#999" font-size="12">(演示二维码)</text>
        <rect x="20" y="20" width="40" height="40" fill="#333"/>
        <rect x="140" y="20" width="40" height="40" fill="#333"/>
        <rect x="20" y="140" width="40" height="40" fill="#333"/>
        <rect x="28" y="28" width="24" height="24" fill="#fff"/>
        <rect x="148" y="28" width="24" height="24" fill="#fff"/>
        <rect x="28" y="148" width="24" height="24" fill="#fff"/>
        <rect x="36" y="36" width="8" height="8" fill="#333"/>
        <rect x="156" y="36" width="8" height="8" fill="#333"/>
        <rect x="36" y="156" width="8" height="8" fill="#333"/>
      </svg>
    `))
  }, [])

  // 二维码倒计时
  useEffect(() => {
    if (status === 'waiting' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
    if (countdown === 0) {
      // 二维码过期，刷新
      setCountdown(120)
    }
  }, [status, countdown])

  // 模拟扫码成功
  const simulateScanSuccess = () => {
    setStatus('scanned')
    setTimeout(() => {
      setStatus('success')
      // 生成演示登录数据
      const mockUser = {
        user_id: 1001,
        nick_name: '微信用户',
        icon_url: '',
        sex: 0
      }
      if (onSuccess) {
        onSuccess('mock_wechat_token_' + Date.now(), mockUser)
      }
    }, 1500)
  }

  // 刷新二维码
  const refreshQrCode = () => {
    setStatus('waiting')
    setCountdown(120)
  }

  return (
    <div className="wechat-qrcode-wrapper">
      <div className="wechat-qrcode-container">
        {/* 二维码图片 */}
        <img src={qrcodeUrl} alt="微信扫码登录" className="wechat-qrcode-img" />

        {/* 状态遮罩 */}
        {status === 'scanned' && (
          <div className="wechat-qrcode-overlay scanned">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="#1890ff">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <p>扫码成功，请在手机确认登录</p>
          </div>
        )}

        {status === 'success' && (
          <div className="wechat-qrcode-overlay success">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="#52c41a">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            <p>登录成功</p>
          </div>
        )}
      </div>

      {/* 状态提示 */}
      <div className={`wechat-status-tip ${status}`}>
        {status === 'waiting' && (
          <span>请使用微信扫描二维码登录 ({countdown}s 后刷新)</span>
        )}
        {status === 'scanned' && (
          <span>请在微信中确认登录</span>
        )}
        {status === 'success' && (
          <span>正在跳转...</span>
        )}
      </div>

      {/* 演示按钮 */}
      <div className="wechat-demo-actions">
        <button className="wechat-demo-btn" onClick={simulateScanSuccess}>
          模拟扫码成功
        </button>
        <button className="wechat-demo-btn" onClick={refreshQrCode}>
          刷新二维码
        </button>
      </div>
    </div>
  )
}

export default WechatQrCode
