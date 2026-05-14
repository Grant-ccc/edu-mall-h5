import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Result, Button } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import ClientLayout from '../../layouts/ClientLayout'
import orderStore from '../../stores/orderStore'

function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderId = searchParams.get('orderId')

  const order = orderId ? orderStore.getOrder(orderId) : null

  return (
    <ClientLayout>
      <div style={{ padding: '60px 24px', maxWidth: 600, margin: '0 auto' }}>
        <Result
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          status="success"
          title="支付成功"
          subTitle={order ? `订单号：${order.order_no}` : '订单支付成功'}
          extra={[
            <Button type="primary" key="orders" onClick={() => navigate('/me/orders')}>
              查看订单
            </Button>,
            <Button key="courses" onClick={() => navigate('/me/courses')}>
              去学习
            </Button>
          ]}
        />
      </div>
    </ClientLayout>
  )
}

export default PaymentSuccess
