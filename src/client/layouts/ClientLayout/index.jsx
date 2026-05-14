import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Input, Dropdown, Avatar, Badge } from 'antd'
import { SearchOutlined, ShoppingCartOutlined, UserOutlined, BookOutlined, OrderedListOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons'
import authStore from '../../stores/authStore'
import cartStore from '../../stores/cartStore'
import './index.css'

function ClientLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [cartCount, setCartCount] = useState(0)

  // 监听登录状态和购物车变化
  useEffect(() => {
    const authState = authStore.getState()
    setUser(authState.user)

    const cartState = cartStore.getState()
    setCartCount(cartState.count)

    const unsubscribeAuth = authStore.subscribe((newState) => {
      setUser(newState.user)
    })

    const unsubscribeCart = cartStore.subscribe((newState) => {
      setCartCount(newState.count)
    })

    return () => {
      unsubscribeAuth()
      unsubscribeCart()
    }
  }, [])

  // 登出
  const handleLogout = () => {
    authStore.logout()
    navigate('/login')
  }

  // 用户下拉菜单
  const userMenuItems = user ? [
    {
      key: 'courses',
      icon: <BookOutlined />,
      label: '我的课程',
      onClick: () => navigate('/me/courses')
    },
    {
      key: 'orders',
      icon: <OrderedListOutlined />,
      label: '我的订单',
      onClick: () => navigate('/me/orders')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账号设置',
      onClick: () => navigate('/me/settings')
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
  ] : []

  // 导航项
  const navItems = [
    { path: '/', label: '课程' },
    { path: '/me/courses', label: '我的课程' },
    { path: '/me/orders', label: '我的订单' }
  ]

  return (
    <div className="client-layout">
      {/* 顶部导航 */}
      <header className="client-header">
        <div className="client-header-inner">
          {/* Logo */}
          <Link to="/" className="client-logo">
            在线教育商城
          </Link>

          {/* 导航 */}
          <nav className="client-nav">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`client-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 右侧区域 */}
          <div className="client-header-right">
            {/* 搜索框 */}
            <Input
              className="client-search"
              placeholder="搜索课程"
              prefix={<SearchOutlined />}
              allowClear
              onPressEnter={(e) => {
                const keyword = e.target.value
                if (keyword) {
                  navigate(`/?keyword=${encodeURIComponent(keyword)}`)
                }
              }}
            />

            {/* 购物车 */}
            <Link to="/cart" className="client-cart-btn">
              <Badge count={cartCount} size="small">
                <ShoppingCartOutlined style={{ fontSize: 20 }} />
              </Badge>
            </Link>

            {/* 用户头像 */}
            {user ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
              >
                <div className="client-user-avatar">
                  <Avatar
                    size={32}
                    icon={<UserOutlined />}
                    src={user.icon_url}
                  />
                  <span className="client-user-name">{user.nick_name}</span>
                </div>
              </Dropdown>
            ) : (
              <Link to="/login" className="client-login-btn">
                登录 / 注册
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 内容区域 */}
      <main className="client-main">
        {children}
      </main>
    </div>
  )
}

export default ClientLayout
