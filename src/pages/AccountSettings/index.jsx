import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, message } from 'antd'
import ClientLayout from '../../layouts/ClientLayout'
import ChangePasswordModal from '../../components/ChangePasswordModal'
import authStore from '../../stores/authStore'

function AccountSettings() {
  const navigate = useNavigate()
  const user = authStore.getState()?.user

  // 修改密码弹窗
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)

  useEffect(() => {
    if (!authStore.isLogin()) {
      navigate('/login')
    }
  }, [])

  const handleLogout = () => {
    authStore.logout()
    message.success('已退出登录')
    navigate('/login')
  }

  return (
    <ClientLayout>
      <div style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ marginBottom: 24 }}>账号设置</h2>

        <Card title="基本信息">
          <Descriptions column={1}>
            <Descriptions.Item label="用户ID">{user?.user_id}</Descriptions.Item>
            <Descriptions.Item label="昵称">{user?.nick_name}</Descriptions.Item>
            <Descriptions.Item label="手机号">{user?.mobile}</Descriptions.Item>
            <Descriptions.Item label="微信绑定">未绑定</Descriptions.Item>
          </Descriptions>

          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <Button onClick={() => setPasswordModalVisible(true)}>修改密码</Button>
            <Button>绑定微信</Button>
            <Button danger onClick={handleLogout}>退出登录</Button>
          </div>
        </Card>
      </div>

      {/* 修改密码弹窗 */}
      <ChangePasswordModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />
    </ClientLayout>
  )
}

export default AccountSettings
