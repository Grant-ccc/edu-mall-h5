import { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, message } from 'antd'
import { LockOutlined, SafetyOutlined } from '@ant-design/icons'
import SliderCaptcha from '../SliderCaptcha'
import authStore from '../../stores/authStore'
import './index.css'

/**
 * 修改密码弹窗组件
 */
function ChangePasswordModal({ visible, onClose }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // 滑块验证状态
  const [captchaValid, setCaptchaValid] = useState(false)
  const [captchaTicket, setCaptchaTicket] = useState(null)

  // 弹窗关闭时重置状态
  useEffect(() => {
    if (!visible) {
      form.resetFields()
      setCaptchaValid(false)
      setCaptchaTicket(null)
      setCountdown(0)
    }
  }, [visible])

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

  // 发送验证码
  const handleSendSms = async () => {
    if (!captchaValid) {
      message.error('请先完成滑块验证')
      return
    }

    // 演示模式
    message.success('验证码已发送（演示模式，验证码：123456）')
    setCountdown(60)
  }

  // 提交修改密码
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (!captchaValid) {
        message.error('请先完成滑块验证')
        return
      }

      setLoading(true)

      // 演示模式：验证码为 123456 即可成功
      if (values.verifyCode !== '123456') {
        message.error('验证码错误（演示模式请输入：123456）')
        setLoading(false)
        return
      }

      // 模拟接口返回
      await new Promise(resolve => setTimeout(resolve, 500))

      message.success('密码修改成功，请重新登录')
      setLoading(false)
      onClose()

      // 清除登录态，跳转登录页
      authStore.logout()
      window.location.href = '/login'

    } catch (error) {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="修改密码"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={420}
      className="change-password-modal"
    >
      <Form
        form={form}
        layout="vertical"
        className="change-password-form"
      >
        {/* 滑块验证 */}
        <Form.Item label="安全验证">
          <SliderCaptcha onSuccess={handleCaptchaSuccess} />
        </Form.Item>

        {/* 验证码 */}
        <Form.Item
          label="验证码"
          name="verifyCode"
          rules={[
            { required: true, message: '请输入验证码' },
            { pattern: /^\d{6}$/, message: '请输入6位数字验证码' }
          ]}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              placeholder="请输入验证码"
              maxLength={6}
              style={{ flex: 1 }}
              prefix={<SafetyOutlined />}
            />
            <Button
              disabled={countdown > 0 || !captchaValid}
              onClick={handleSendSms}
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </Button>
          </div>
        </Form.Item>

        {/* 新密码 */}
        <Form.Item
          label="新密码"
          name="newPassword"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '密码至少6位' }
          ]}
        >
          <Input.Password
            placeholder="请输入新密码（至少6位）"
            prefix={<LockOutlined />}
          />
        </Form.Item>

        {/* 确认密码 */}
        <Form.Item
          label="确认密码"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('两次输入的密码不一致'))
              }
            })
          ]}
        >
          <Input.Password
            placeholder="请再次输入新密码"
            prefix={<LockOutlined />}
          />
        </Form.Item>

        {/* 提交按钮 */}
        <Form.Item>
          <Button
            type="primary"
            block
            loading={loading}
            onClick={handleSubmit}
          >
            确认修改
          </Button>
        </Form.Item>
      </Form>

      <div className="change-password-tip">
        提示：修改密码后需要重新登录
      </div>
    </Modal>
  )
}

export default ChangePasswordModal
