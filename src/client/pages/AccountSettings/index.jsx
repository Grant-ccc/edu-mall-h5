import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, message, Spin, Tag } from 'antd'
import ClientLayout from '../../layouts/ClientLayout'
import ChangePasswordModal from '../../components/ChangePasswordModal'
import authStore from '../../stores/authStore'
import { getUserInfo } from '../../api/user'

function AccountSettings() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState(null)

  // 修改密码弹窗
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)

  useEffect(() => {
    if (!authStore.isLogin()) {
      navigate('/login')
      return
    }

    // 加载用户信息
    setLoading(true)
    getUserInfo()
      .then(data => setUserInfo(data))
      .catch(() => message.error('获取用户信息失败'))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    authStore.logout()
    navigate('/login?from=logout')
  }

  const user = userInfo?.user || authStore.getState()?.user

  if (loading) {
    return (
      <ClientLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '120px 0' }}>
          <Spin size="large" />
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      <div style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ marginBottom: 24 }}>账号设置</h2>

        <Card title="基本信息">
          <Descriptions column={1}>
            <Descriptions.Item label="用户ID">{user?.user_id}</Descriptions.Item>
            <Descriptions.Item label="昵称">{user?.nick_name}</Descriptions.Item>
            <Descriptions.Item label="手机号">{userInfo?.mobile_user?.mobile || user?.mobile || '未绑定'}</Descriptions.Item>
            <Descriptions.Item label="微信绑定">
              {user?.wechat_bind ? <Tag color="green">已绑定</Tag> : <Tag>未绑定</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="是否设置密码">
              {user?.has_password ? <Tag color="green">已设置</Tag> : <Tag>未设置</Tag>}
            </Descriptions.Item>
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
