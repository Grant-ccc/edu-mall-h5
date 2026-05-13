import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar, message } from 'antd'
import {
  DashboardOutlined,
  BookOutlined,
  PlayCircleOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons'
import adminAuthStore from '../../stores/adminAuthStore'
import './index.css'

const { Header, Sider, Content } = Layout

// 菜单配置
const menuItems = [
  {
    key: '/admin',
    icon: <DashboardOutlined />,
    label: '工作台'
  },
  {
    key: '/admin/courses',
    icon: <BookOutlined />,
    label: '课程管理'
  },
  {
    key: '/admin/lessons',
    icon: <PlayCircleOutlined />,
    label: '课时管理'
  },
  {
    key: '/admin/orders',
    icon: <ShoppingCartOutlined />,
    label: '订单管理'
  },
  {
    key: '/admin/users',
    icon: <UserOutlined />,
    label: '用户管理'
  },
  {
    key: '/admin/settings',
    icon: <SettingOutlined />,
    label: '系统设置'
  }
]

function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState(adminAuthStore.getUser())

  useEffect(() => {
    // 检查登录状态
    if (!adminAuthStore.isLogin()) {
      navigate('/admin/login')
      return
    }

    setUser(adminAuthStore.getUser())

    // 订阅状态变化
    const unsubscribe = adminAuthStore.subscribe((state) => {
      setUser(state.user)
      if (!state.token) {
        navigate('/admin/login')
      }
    })

    return unsubscribe
  }, [navigate])

  // 登出
  const handleLogout = () => {
    adminAuthStore.logout()
    message.success('已退出登录')
    navigate('/admin/login')
  }

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => navigate('/admin/profile')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  // 获取当前选中的菜单
  const getSelectedKey = () => {
    const path = location.pathname
    // 精确匹配
    const exactMatch = menuItems.find(item => item.key === path)
    if (exactMatch) return path
    // 前缀匹配
    const prefixMatch = menuItems.find(item => path.startsWith(item.key) && item.key !== '/admin')
    if (prefixMatch) return prefixMatch.key
    return '/admin'
  }

  return (
    <Layout className="admin-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="admin-sider"
      >
        <div className="admin-logo">
          {collapsed ? 'EDU' : 'EDU Mall Admin'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <div className="admin-header-left">
            <span
              className="admin-trigger"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
          </div>
          <div className="admin-header-right">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="admin-user-info">
                <Avatar icon={<UserOutlined />} />
                <span className="admin-user-name">
                  {user?.nick_name || user?.name || '管理员'}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="admin-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
