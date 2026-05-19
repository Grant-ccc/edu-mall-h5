import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Input, Select, Popconfirm, message } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import AdminLayout from '../../layouts/AdminLayout'
import { getUserList, updateUserStatus } from '../../api/user'
import './index.css'

const { Option } = Select
const UserStatus = { BANNED: -1, NORMAL: 1 }
const UserStatusText = { [-1]: '封禁', 1: '正常' }
const UserStatusColor = { [-1]: 'error', 1: 'success' }

function UserList() {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, limit: 10 })
  const [filters, setFilters] = useState({ nick_name_kw: '', mobile: '', status: null })

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params = { page: pagination.page, limit: pagination.limit }
      if (filters.nick_name_kw) params.nick_name_kw = filters.nick_name_kw
      if (filters.mobile) params.mobile = filters.mobile
      if (filters.status !== null && filters.status !== undefined) params.status = filters.status
      const data = await getUserList(params)
      setUsers(data.list || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('加载用户失败:', error)
    } finally { setLoading(false) }
  }

  const handleSearch = () => { setPagination(p => ({ ...p, page: 1 })); loadUsers() }
  const handleReset = () => { setFilters({ nick_name_kw: '', mobile: '', status: null }); setPagination({ page: 1, limit: 10 }); loadUsers() }
  const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : '-'

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === UserStatus.NORMAL ? UserStatus.BANNED : UserStatus.NORMAL
    try { await updateUserStatus(userId, newStatus); message.success(newStatus === UserStatus.NORMAL ? '已解封' : '已封禁'); loadUsers() } catch { message.error('操作失败') }
  }

  const columns = [
    { title: '用户ID', dataIndex: 'user_id', key: 'user_id', width: 90 },
    { title: '昵称', dataIndex: 'nick_name', key: 'nick_name', width: 120 },
    { title: '手机号', dataIndex: 'mobile', key: 'mobile', width: 130 },
    { title: '微信绑定', dataIndex: 'wechat_bind', key: 'wechat_bind', width: 90, render: (v) => v ? <Tag color="green">已绑定</Tag> : <Tag>未绑定</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 70, render: (s) => <Tag color={UserStatusColor[s]}>{UserStatusText[s]}</Tag> },
    { title: '注册时间', dataIndex: 'create_at', key: 'create_at', width: 160, render: formatTime },
    { title: '最后登录', dataIndex: 'last_login_at', key: 'last_login_at', width: 160, render: formatTime },
    { title: '操作', key: 'actions', width: 100, fixed: 'right', render: (_, r) => (
      <Popconfirm title={r.status === UserStatus.NORMAL ? '确定封禁该用户？' : '确定解封该用户？'} onConfirm={() => handleToggleStatus(r.user_id, r.status)}>
        <Button type="link" size="small" danger={r.status === UserStatus.NORMAL}>{r.status === UserStatus.NORMAL ? '封禁' : '解封'}</Button>
      </Popconfirm>
    )}
  ]

  return (
    <AdminLayout>
      <div className="user-list-page">
        <Card title="用户管理" className="user-list-card">
          <div className="user-filter-section">
            <Space wrap>
              <Input placeholder="昵称" prefix={<SearchOutlined />} value={filters.nick_name_kw} allowClear onChange={e => setFilters({ ...filters, nick_name_kw: e.target.value })} style={{ width: 140 }} />
              <Input placeholder="手机号" value={filters.mobile} allowClear onChange={e => setFilters({ ...filters, mobile: e.target.value })} style={{ width: 140 }} />
              <Select placeholder="状态" value={filters.status} allowClear onChange={v => setFilters({ ...filters, status: v })} style={{ width: 100 }}>
                <Option value={UserStatus.NORMAL}>正常</Option>
                <Option value={UserStatus.BANNED}>封禁</Option>
              </Select>
              <Button type="primary" onClick={handleSearch}>搜索</Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>重置</Button>
            </Space>
          </div>
          <Table columns={columns} dataSource={users} rowKey="user_id" loading={loading} scroll={{ x: 900 }}
            pagination={{ current: pagination.page, pageSize: pagination.limit, total, onChange: (page, limit) => { setPagination({ page, limit }) }, showSizeChanger: true, showQuickJumper: true, showTotal: (t) => `共 ${t} 条` }} />
        </Card>
      </div>
    </AdminLayout>
  )
}

export default UserList
