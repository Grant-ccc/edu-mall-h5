import { Link } from 'react-router-dom'
import { Tag, Button } from 'antd'
import { PlayCircleOutlined } from '@ant-design/icons'
import './index.css'

/**
 * 课程卡片组件
 */
function CourseCard({ course, onAddCart, onBuyNow }) {
  const {
    id,
    name,
    cover_url,
    course_price,
    features = [],
    learn_time,
    service_time,
    update_status,
    has_purchased
  } = course

  // 价格显示（分转元）
  const priceYuan = (course_price / 100).toFixed(2)

  // 更新状态标签
  const updateStatusMap = {
    1: { text: '更新中', color: 'processing' },
    2: { text: '已完结', color: 'success' }
  }
  const updateStatusInfo = updateStatusMap[update_status] || { text: '', color: '' }

  // 特色标签颜色
  const featureColors = ['blue', 'green', 'orange', 'purple']

  return (
    <div className="course-card">
      <Link to={`/courses/${id}`} className="course-card-link">
        {/* 封面 */}
        <div className="course-card-cover">
          {cover_url ? (
            <img src={cover_url} alt={name} />
          ) : (
            <div className="course-card-cover-placeholder">
              <PlayCircleOutlined style={{ fontSize: 48, color: '#ccc' }} />
            </div>
          )}
          {/* 更新状态标签 */}
          {updateStatusInfo.text && (
            <Tag color={updateStatusInfo.color} className="course-card-status-tag">
              {updateStatusInfo.text}
            </Tag>
          )}
        </div>

        {/* 内容 */}
        <div className="course-card-content">
          {/* 标题 */}
          <h3 className="course-card-title">{name}</h3>

          {/* 特色标签 */}
          {features.length > 0 && (
            <div className="course-card-features">
              {features.slice(0, 3).map((feature, index) => (
                <Tag
                  key={index}
                  color={featureColors[index % featureColors.length]}
                  className="course-card-feature-tag"
                >
                  {feature}
                </Tag>
              ))}
            </div>
          )}

          {/* 时长信息 */}
          <div className="course-card-meta">
            {learn_time && <span>学习{learn_time}天</span>}
            {service_time && <span>服务{service_time}天</span>}
          </div>

          {/* 价格 */}
          <div className="course-card-price">
            <span className="course-card-price-current">¥{priceYuan}</span>
          </div>
        </div>
      </Link>

      {/* 操作按钮 */}
      <div className="course-card-actions">
        {has_purchased ? (
          <Link to={`/learn/${id}`}>
            <Button type="primary" className="course-card-btn" icon={<PlayCircleOutlined />}>
              去学习
            </Button>
          </Link>
        ) : (
          <>
            <Button
              className="course-card-btn"
              onClick={() => onAddCart && onAddCart(course)}
            >
              加入购物车
            </Button>
            <Button
              type="primary"
              className="course-card-btn"
              onClick={() => onBuyNow && onBuyNow(course)}
            >
              立即购买
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default CourseCard
