import { useRef, useEffect, useCallback } from 'react'
import { getCaptcha, checkCaptcha } from '../../../client/api/auth'
import './index.css'

/**
 * 滑块验证码组件（弹窗模式）
 * 使用 GoCaptcha.Slide 全局库，调用真实 API
 */
function SliderCaptcha({ onSuccess, onReset, visible, onClose }) {
  const wrapRef = useRef(null)
  const captchaRef = useRef(null)
  const captchaKeyRef = useRef('')

  const CW = 300
  const CH = 220

  // 生成签名（与 login(1).html 一致）
  const generateSign = (once, ts) => {
    const secret = 'daqing2025'
    const msg = once + secret + ts
    let hash = 0
    for (let i = 0; i < msg.length; i++) {
      hash = ((hash << 5) - hash) + msg.charCodeAt(i)
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(32, '0').toLowerCase()
  }

  // 初始化验证码 —— 完全照搬 login(1).html 的 initAndLoadCaptcha
  const initCaptcha = useCallback(async () => {
    if (!window.GoCaptcha || !window.GoCaptcha.Slide || !wrapRef.current) return

    try {
      // 1. 获取验证码数据
      const once = Math.random().toString(36).substring(2, 10)
      const ts = Date.now()
      const sign = await generateSign(once, ts)
      const captchaData = await getCaptcha(once, ts, sign)

      captchaKeyRef.current = captchaData.key

      // 2. 销毁之前的实例
      if (captchaRef.current) { captchaRef.current.destroy(); captchaRef.current = null }
      wrapRef.current.innerHTML = ''

      // 3. 创建新实例
      const captcha = new window.GoCaptcha.Slide({ width: CW, height: CH })
      captcha.mount(wrapRef.current)

      // 4. 设置数据 (thumbX: 0 从左侧起点，和 login(1).html 一致)
      captcha.setData({
        image: captchaData.image_base64,
        thumb: captchaData.title_image_base64,
        thumbX: 0,
        thumbY: captchaData.title_y || 0,
        thumbWidth: captchaData.title_width || 50,
        thumbHeight: captchaData.title_height || 50
      })

      // 5. 设置事件
      captcha.setEvents({
        confirm: async function (point, reset) {
          try {
            const result = await checkCaptcha(
              captchaKeyRef.current,
              Math.round(point.x),
              Math.round(point.y)
            )
            if (onSuccess) onSuccess(result.ticket)
          } catch (error) {
            console.error('验证失败:', error)
            if (reset) reset()
          }
        },
        refresh: function () { initCaptcha() },
        close: function () { if (onClose) onClose() }
      })

      captchaRef.current = captcha
    } catch (error) {
      console.error('初始化验证码失败:', error)
    }
  }, [onSuccess, onClose])

  useEffect(() => {
    const checkLib = () => {
      if (window.GoCaptcha && window.GoCaptcha.Slide) {
        initCaptcha()
      } else {
        setTimeout(checkLib, 200)
      }
    }
    checkLib()
  }, [initCaptcha])

  useEffect(() => () => {
    if (captchaRef.current) { captchaRef.current.destroy(); captchaRef.current = null }
  }, [])

  if (visible === false) return null

  return (
    <div className="captcha-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget && onClose) onClose()
    }}>
      <div className="captcha-modal">
        <div ref={wrapRef} style={{ width: CW, height: CH }}>
          <div className="captcha-loading">
            <span className="captcha-spinner" />
            <span>加载验证码中...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SliderCaptcha
