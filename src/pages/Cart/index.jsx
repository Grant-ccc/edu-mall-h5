import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Checkbox, Button, Empty, Popconfirm, message, Image } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import ClientLayout from '../../layouts/ClientLayout'
import cartStore from '../../stores/cartStore'
import authStore from '../../stores/authStore'
import './index.css'

function Cart() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    if (!authStore.isLogin()) {
      navigate('/login')
      return
    }

    // 订阅购物车状态变化
    const state = cartStore.getState()
    setItems(state.items)
    setSelectedIds(state.items.map(item => item.cart_id))

    const unsubscribe = cartStore.subscribe((newState) => {
      setItems(newState.items)
      // 如果新列表比选中列表少，更新选中列表
      const newItemIds = newState.items.map(item => item.cart_id)
      setSelectedIds(prev => prev.filter(id => newItemIds.includes(id)))
    })

    return unsubscribe
  }, [])

  // 价格显示（分转元）
  const formatPrice = (price) => (price / 100).toFixed(2)

  // 计算选中商品总价
  const totalAmount = cartStore.getSelectedTotal(selectedIds)
  const selectedCount = selectedIds.length

  // 全选
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(items.filter(item => item.status === 1).map(item => item.cart_id))
    } else {
      setSelectedIds([])
    }
  }

  // 单选
  const handleSelectItem = (cartId, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, cartId])
    } else {
      setSelectedIds(selectedIds.filter(id => id !== cartId))
    }
  }

  // 删除商品
  const handleRemoveItem = (cartId) => {
    cartStore.removeItem(cartId)
    message.success('已移除')
  }

  // 批量删除
  const handleRemoveSelected = () => {
    if (selectedIds.length === 0) {
      message.warning('请先选择要删除的商品')
      return
    }
    cartStore.removeItems(selectedIds)
    message.success('已移除选中商品')
  }

  // 清空购物车
  const handleClearCart = () => {
    cartStore.clearCart()
    message.success('购物车已清空')
  }

  // 去结算
  const handleCheckout = () => {
    if (selectedIds.length === 0) {
      message.warning('请先选择要结算的商品')
      return
    }

    // 将选中的商品ID存入localStorage，供确认订单页使用
    localStorage.setItem('checkout_goods_ids', JSON.stringify(
      selectedIds.map(id => items.find(item => item.cart_id === id)?.goods_id).filter(Boolean)
    ))
    navigate('/checkout')
  }

  // 是否全选
  const isAllSelected = items.length > 0 && selectedIds.length === items.filter(item => item.status === 1).length

  return (
    <ClientLayout>
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-header">
            <h2>购物车 ({items.length})</h2>
            {items.length > 0 && (
              <div className="cart-header-actions">
                <Button onClick={handleRemoveSelected} disabled={selectedIds.length === 0}>
                  删除选中
                </Button>
                <Popconfirm
                  title="确定清空购物车？"
                  onConfirm={handleClearCart}
                >
                  <Button>清空购物车</Button>
                </Popconfirm>
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <Card className="cart-empty-card">
              <Empty description="购物车是空的">
                <Button type="primary" onClick={() => navigate('/')}>
                  去逛逛
                </Button>
              </Empty>
            </Card>
          ) : (
            <>
              <div className="cart-list">
                {items.map(item => (
                  <Card key={item.cart_id} className={`cart-item-card ${item.status === -1 ? 'disabled' : ''}`}>
                    <div className="cart-item">
                      <Checkbox
                        checked={selectedIds.includes(item.cart_id)}
                        disabled={item.status === -1}
                        onChange={(e) => handleSelectItem(item.cart_id, e.target.checked)}
                      />

                      <div className="cart-item-cover">
                        {item.cover_url ? (
                          <Image src={item.cover_url} alt={item.name} width={120} height={68} />
                        ) : (
                          <div className="cart-item-cover-placeholder">课程封面</div>
                        )}
                      </div>

                      <div className="cart-item-info">
                        <h3 className="cart-item-name">{item.name}</h3>
                        <div className="cart-item-meta">
                          <span>学习{item.learn_time}天</span>
                          <span>服务{item.service_time}天</span>
                        </div>
                        {item.status === -1 && (
                          <span className="cart-item-status">已失效</span>
                        )}
                      </div>

                      <div className="cart-item-price">
                        ¥{formatPrice(item.course_price)}
                      </div>

                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveItem(item.cart_id)}
                      />
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="cart-footer">
                <div className="cart-footer-left">
                  <Checkbox
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  >
                    全选
                  </Checkbox>
                </div>

                <div className="cart-footer-right">
                  <div className="cart-summary">
                    <span>已选 <strong>{selectedCount}</strong> 件</span>
                    <span className="cart-total">
                      合计：<strong>¥{formatPrice(totalAmount)}</strong>
                    </span>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    disabled={selectedCount === 0}
                    onClick={handleCheckout}
                  >
                    去结算
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </ClientLayout>
  )
}

export default Cart
