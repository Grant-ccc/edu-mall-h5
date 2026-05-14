import { useState, useRef, useEffect } from 'react'
import './index.css'

/**
 * 滑块验证码组件（演示版）
 * 滑动到右侧即视为验证通过
 */
function SliderCaptcha({ onSuccess, onReset }) {
  const [dragging, setDragging] = useState(false)
  const [position, setPosition] = useState(0)
  const [verified, setVerified] = useState(false)
  const [startX, setStartX] = useState(0)
  const containerRef = useRef(null)

  // 容器宽度（滑块可移动范围）
  const containerWidth = 280
  const sliderWidth = 40
  const maxPosition = containerWidth - sliderWidth

  // 重置
  const reset = () => {
    setPosition(0)
    setVerified(false)
    setDragging(false)
    if (onReset) onReset()
  }

  // 暴露重置方法
  useEffect(() => {
    if (onReset) {
      // 可以通过 ref 调用重置
    }
  }, [onReset])

  // 鼠标/触摸开始
  const handleStart = (e) => {
    if (verified) return
    e.preventDefault()
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX
    setDragging(true)
    setStartX(clientX - position)
  }

  // 鼠标/触摸移动
  const handleMove = (e) => {
    if (!dragging || verified) return
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX
    let newPosition = clientX - startX

    // 限制范围
    if (newPosition < 0) newPosition = 0
    if (newPosition > maxPosition) newPosition = maxPosition

    setPosition(newPosition)
  }

  // 鼠标/触摸结束
  const handleEnd = () => {
    if (verified) return
    setDragging(false)

    // 判断是否验证成功（滑动到接近右侧）
    if (position >= maxPosition - 5) {
      setPosition(maxPosition)
      setVerified(true)
      // 生成演示 ticket
      const ticket = 'mock_ticket_' + Date.now()
      if (onSuccess) onSuccess(ticket)
    } else {
      // 未成功，滑回起点
      setPosition(0)
    }
  }

  // 点击重置
  const handleRefresh = () => {
    reset()
  }

  return (
    <div className="slider-captcha-wrapper">
      <div className="slider-captcha-label">
        {verified ? '验证成功' : '请拖动滑块完成验证'}
      </div>
      <div
        className={`slider-captcha-container ${verified ? 'verified' : ''}`}
        ref={containerRef}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {/* 背景轨道 */}
        <div className="slider-track">
          {/* 已滑动区域 */}
          <div
            className="slider-filled"
            style={{ width: position + sliderWidth / 2 }}
          />
        </div>

        {/* 滑块 */}
        <div
          className={`slider-button ${dragging ? 'dragging' : ''} ${verified ? 'verified' : ''}`}
          style={{ left: position }}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
        >
          {verified ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>

        {/* 提示文字 */}
        {!verified && (
          <div className="slider-tip">
            向右滑动
          </div>
        )}
      </div>

      {/* 刷新按钮 */}
      <button className="slider-refresh" onClick={handleRefresh} title="重置">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M17.65 6.35C16.15 4.85 14.15 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.44 7.73-5.73h-2.08c-.82 2.14-2.91 3.73-5.65 3.73-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
        </svg>
      </button>
    </div>
  )
}

export default SliderCaptcha
