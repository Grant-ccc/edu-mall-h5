import { createBrowserRouter } from 'react-router-dom'

// C端页面
import Login from '../client/pages/Login'
import LarkCallback from '../client/pages/LarkCallback'
import CourseList from '../client/pages/CourseList'
import CourseDetail from '../client/pages/CourseDetail'
import MyCourses from '../client/pages/MyCourses'
import MyOrders from '../client/pages/MyOrders'
import OrderDetail from '../client/pages/OrderDetail'
import Cart from '../client/pages/Cart'
import Checkout from '../client/pages/Checkout'
import Payment from '../client/pages/Payment'
import PaymentSuccess from '../client/pages/PaymentSuccess'
import AccountSettings from '../client/pages/AccountSettings'

// 管理端页面
import AdminLogin from '../admin/pages/Login'
import AdminDashboard from '../admin/pages/Dashboard'
import AdminCourseList from '../admin/pages/CourseList'
import AdminCourseForm from '../admin/pages/CourseForm'
import AdminCourseCatalog from '../admin/pages/CourseCatalog'
import AdminLessonList from '../admin/pages/LessonList'
import AdminLessonForm from '../admin/pages/LessonForm'

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
    path: '/lark-callback',
    element: <LarkCallback />
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
  },
  // 课程管理
  {
    path: '/admin/courses',
    element: <AdminCourseList />
  },
  {
    path: '/admin/courses/create',
    element: <AdminCourseForm />
  },
  {
    path: '/admin/courses/:id/edit',
    element: <AdminCourseForm />
  },
  {
    path: '/admin/courses/:id/catalog',
    element: <AdminCourseCatalog />
  },
  // 课时管理
  {
    path: '/admin/lessons',
    element: <AdminLessonList />
  },
  {
    path: '/admin/lessons/create',
    element: <AdminLessonForm />
  },
  {
    path: '/admin/lessons/:id/edit',
    element: <AdminLessonForm />
  }
])

export default router
