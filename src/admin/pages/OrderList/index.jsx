import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Input, Select, Popconfirm, message, Modal, Descriptions, Timeline } from 'antd'
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons'
import AdminLayout from '../../layouts/AdminLayout'
import { getOrderList, getOrderInfo, refundOrder } from '../../api/order'
import './index.css'

const { Option } = Select

const OrderStatus = { CANCELLED: -1, PENDING: 1, PAID: 2, REFUNDED: 3 }
const OrderStatusText = { [-1]: '已取消', 1: '待支付', 2: '已支付', 3: '已退款' }
const OrderStatusColor = { [-1]: 'default', 1: 'warning', 2: 'success', 3: 'error' }

function OrderList() {
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, limit: 10 })
  const [filters, setFilters] = useState({ order_id: '', status: null, user_mobile: '' })
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailOrder, setDetailOrder] = useState(null)

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const params = { page: pagination.page, limit: pagination.limit }
      if (filters.order_id) params.order_id = filters.order_id
      if (filters.status !== null && filters.status !== undefined) params.status = filters.status
      if (filters.user_mobile) params.user_mobile = filters.user_mobile
      const data = await getOrderList(params)
      setOrders(data.list || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('加载订单失败:', error)
    } finally { setLoading(false) }
  }

  const handleSearch = () => { setPagination(p => ({ ...p, page: 1 })); loadOrders() }
  const handleReset = () => { setFilters({ order_id: '', status: null, user_mobile: '' }); setPagination({ page: 1, limit: 10 }); loadOrders() }

  const formatPrice = (price) => price ? `¥${(price / 100).toFixed(2)}` : '-'
  const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : '-'

  const handleRefund = async (orderId) => {
    try { await refundOrder(orderId); message.success('已退款'); loadOrders() } catch { message.error('退款失败') }
  }

  const handleViewDetail = async (orderId) => {
    try { const data = await getOrderInfo(orderId); setDetailOrder(data); setDetailVisible(true) } catch { message.error('获取详情失败') }
  }

  const columns = [
    { title: '订单ID', dataIndex: 'id', key: 'id', width: 130 },
    { title: '用户', key: 'user', width: 130, render: (_, r) => r.user_nickname || r.user_mobile || r.user_id },
    { title: '金额', dataIndex: 'payment_amount', key: 'amount', width: 100, render: formatPrice },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s) => <Tag color={OrderStatusColor[s]}>{OrderStatusText[s]}</Tag> },
    { title: '创建时间', dataIndex: 'create_at', key: 'create_at', width: 160, render: formatTime },
    { title: '操作', key: 'actions', width: 160, fixed: 'right', render: (_, r) => (
      <Space size="small">
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(r.id)}>详情</Button>
        {r.status === OrderStatus.PAID && (
          <Popconfirm title="确定退款？" onConfirm={() => handleRefund(r.id)}>
            <Button type="link" size="small" danger>退款</Button>
          </Popconfirm>
        )}
      </Space>
    )}
  ]

  const timelineItems = detailOrder ? [
    { color: 'green', children: `创建订单 ${formatTime(detailOrder.create_at)}` },
    ...(detailOrder.payment_at ? [{ color: 'blue', children: `支付成功 ${formatTime(detailOrder.payment_at)}` }] : []),
    ...(detailOrder.status === OrderStatus.REFUNDED ? [{ color: 'red', children: '已退款' }] : []),
    ...(detailOrder.status === OrderStatus.CANCELLED ? [{ color: 'gray', children: '已取消' }] : [])
  ] : []

  return (
    <AdminLayout>
      <div className="order-list-page">
        <Card title="订单管理" className="order-list-card">
          <div className="order-filter-section">
            <Space wrap>
              <Input placeholder="订单号" prefix={<SearchOutlined />} value={filters.order_id} allowClear onChange={e => setFilters({ ...filters, order_id: e.target.value })} style={{ width: 160 }} />
              <Input placeholder="用户手机号" value={filters.user_mobile} allowClear onChange={e => setFilters({ ...filters, user_mobile: e.target.value })} style={{ width: 140 }} />
              <Select placeholder="订单状态" value={filters.status} allowClear onChange={v => setFilters({ ...filters, status: v })} style={{ width: 120 }}>
                <Option value={OrderStatus.PENDING}>待支付</Option>
                <Option value={OrderStatus.PAID}>已支付</Option>
                <Option value={OrderStatus.REFUNDED}>已退款</Option>
                <Option value={OrderStatus.CANCELLED}>已取消</Option>
              </Select>
              <Button type="primary" onClick={handleSearch}>搜索</Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>重置</Button>
            </Space>
          </div>
          <Table columns={columns} dataSource={orders} rowKey="id" loading={loading} scroll={{ x: 900 }}
            pagination={{ current: pagination.page, pageSize: pagination.limit, total, onChange: (page, limit) => { setPagination({ page, limit }) }, showSizeChanger: true, showQuickJumper: true, showTotal: (t) => `共 ${t} 条` }} />
        </Card>
        <Modal title={`订单详情 - ${detailOrder?.id || ''}`} open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={640}>
          {detailOrder && (<>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="订单号">{detailOrder.id}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={OrderStatusColor[detailOrder.status]}>{OrderStatusText[detailOrder.status]}</Tag></Descriptions.Item>
              <Descriptions.Item label="用户">{detailOrder.user_nickname || detailOrder.user_mobile}</Descriptions.Item>
              <Descriptions.Item label="金额">{formatPrice(detailOrder.payment_amount)}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{formatTime(detailOrder.create_at)}</Descriptions.Item>
              <Descriptions.Item label="支付时间">{formatTime(detailOrder.payment_at)}</Descriptions.Item>
            </Descriptions>
            <h4 style={{ marginBottom: 8 }}>商品信息</h4>
            {(detailOrder.items || []).map((item, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.goods_snap?.name || item.goods_name || `商品${item.goods_id}`}</span>
                <span>{formatPrice(item.payment_amount)}</span>
              </div>
            ))}
            <h4 style={{ margin: '16px 0 8px' }}>订单进度</h4>
            <Timeline items={timelineItems} />
          </>)}
        </Modal>
      </div>
    </AdminLayout>
  )
}

export default OrderList
