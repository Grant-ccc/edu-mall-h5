import { Card, Row, Col, Statistic, Table, Tag } from 'antd'
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  BookOutlined
} from '@ant-design/icons'
import AdminLayout from '../../layouts/AdminLayout'

// Mock 统计数据
const mockStats = {
  totalOrders: 156,
  totalRevenue: 12560000, // 分
  totalUsers: 89,
  totalCourses: 12
}

// Mock 最近订单
const mockRecentOrders = [
  { id: 1, order_no: '202605100001', user_name: '张三', amount: 9900, status: 2, create_at: '2026-05-10 10:30' },
  { id: 2, order_no: '202605100002', user_name: '李四', amount: 7900, status: 1, create_at: '2026-05-10 09:15' },
  { id: 3, order_no: '202605090003', user_name: '王五', amount: 5900, status: 2, create_at: '2026-05-09 18:20' },
]

const statusMap = {
  1: { text: '待支付', color: 'warning' },
  2: { text: '已支付', color: 'success' },
  3: { text: '已退款', color: 'error' },
  [-1]: { text: '已取消', color: 'default' }
}

const formatPrice = (price) => `¥${(price / 100).toFixed(2)}`

function Dashboard() {
  const orderColumns = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no' },
    { title: '用户', dataIndex: 'user_name', key: 'user_name' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: formatPrice },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
    { title: '时间', dataIndex: 'create_at', key: 'create_at' },
  ]

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <h2 style={{ marginBottom: 24 }}>工作台</h2>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="订单总数"
                value={mockStats.totalOrders}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总收入"
                value={mockStats.totalRevenue / 100}
                prefix={<DollarOutlined />}
                precision={2}
                suffix="元"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="注册用户"
                value={mockStats.totalUsers}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="课程数量"
                value={mockStats.totalCourses}
                prefix={<BookOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 最近订单 */}
        <Card title="最近订单">
          <Table
            columns={orderColumns}
            dataSource={mockRecentOrders}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </div>
    </AdminLayout>
  )
}

export default Dashboard
