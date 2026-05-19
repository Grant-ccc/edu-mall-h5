import { useState, useEffect } from 'react'
import { Card, Descriptions, Tag, Spin } from 'antd'
import AdminLayout from '../../layouts/AdminLayout'
import adminAuthStore from '../../stores/adminAuthStore'
import { getAdminUserInfo } from '../../api/auth'

function Profile() {
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState(null)

  useEffect(() => {
    getAdminUserInfo()
      .then(data => setUserInfo(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const user = userInfo?.user_info?.user || userInfo?.user || adminAuthStore.getUser()

  if (loading) return <AdminLayout><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '120px 0' }}><Spin size="large" /></div></AdminLayout>

  return (
    <AdminLayout>
      <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ marginBottom: 24 }}>个人资料</h2>
        <Card>
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="用户ID">{user?.user_id}</Descriptions.Item>
            <Descriptions.Item label="昵称">{user?.nick_name}</Descriptions.Item>
            <Descriptions.Item label="手机号">{userInfo?.mobile_user?.mobile || user?.mobile || '-'}</Descriptions.Item>
            <Descriptions.Item label="角色">{adminAuthStore.getState().roles?.map(r => r.name).join(', ') || '超级管理员'}</Descriptions.Item>
            <Descriptions.Item label="微信绑定">{user?.wechat_bind ? <Tag color="green">已绑定</Tag> : <Tag>未绑定</Tag>}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{user?.create_at ? new Date(user.create_at).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
            <Descriptions.Item label="最后登录">{user?.last_login_at ? new Date(user.last_login_at).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default Profile
