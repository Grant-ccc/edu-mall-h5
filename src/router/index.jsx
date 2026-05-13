import { createBrowserRouter } from 'react-router-dom'

// C端页面
import Login from '../pages/Login'
import CourseList from '../pages/CourseList'
import CourseDetail from '../pages/CourseDetail'
import MyCourses from '../pages/MyCourses'
import MyOrders from '../pages/MyOrders'
import OrderDetail from '../pages/OrderDetail'
import Cart from '../pages/Cart'
import Checkout from '../pages/Checkout'
import Payment from '../pages/Payment'
import PaymentSuccess from '../pages/PaymentSuccess'
import AccountSettings from '../pages/AccountSettings'

// 管理端页面
import AdminLogin from '../pages/admin/Login'
import AdminDashboard from '../pages/admin/Dashboard'

const router = createBrowserRouter([
  // ========== C端路由 ==========
  {
    path: '/',
    element: <CourseList />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/courses',
    element: <CourseList />
  },
  {
    path: '/courses/:id',
    element: <CourseDetail />
  },
  {
    path: '/cart',
    element: <Cart />
  },
  {
    path: '/checkout',
    element: <Checkout />
  },
  {
    path: '/pay/:orderId',
    element: <Payment />
  },
  {
    path: '/payment-success',
    element: <PaymentSuccess />
  },
  {
    path: '/me/courses',
    element: <MyCourses />
  },
  {
    path: '/me/orders',
    element: <MyOrders />
  },
  {
    path: '/me/orders/:orderId',
    element: <OrderDetail />
  },
  {
    path: '/me/settings',
    element: <AccountSettings />
  },

  // ========== 管理端路由 ==========
  {
    path: '/admin/login',
    element: <AdminLogin />
  },
  {
    path: '/admin',
    element: <AdminDashboard />
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboard />
  }
])

export default router
