import { useState, useEffect } from 'react'
import { Tree, Button, Modal, Form, Input, Space, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined, FolderAddOutlined } from '@ant-design/icons'
import lessonStore from '../../stores/lessonStore'
import './index.css'

function CategoryTree({ selectedCategoryId, onSelect, showActions = true }) {
  const [categories, setCategories] = useState([])
  const [treeData, setTreeData] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [form] = Form.useForm()

  // 加载分类数据
  useEffect(() => {
    const loadData = () => {
      const state = lessonStore.getState()
      setCategories(state.categories)
      setTreeData(buildTreeData(state.categories))
    }

    lessonStore.fetchCategories().then(loadData).catch(() => {})

    const unsubscribe = lessonStore.subscribe(loadData)
    return unsubscribe
  }, [])

  // 构建树形数据
  const buildTreeData = (categoryList, parentId = -1) => {
    return categoryList
      .filter(c => c.parent_id === parentId)
      .sort((a, b) => a.sort - b.sort)
      .map(c => ({
        key: c.id,
        title: (
          <div className="category-tree-node">
            <span className="category-name">{c.name}</span>
            {showActions && (
              <Space className="category-actions" size={0}>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(c)
                  }}
                />
                <Popconfirm
                  title="确定删除该分类？"
                  onConfirm={(e) => {
                    e?.stopPropagation()
                    handleDelete(c.id)
                  }}
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              </Space>
            )}
          </div>
        ),
        icon: <FolderOutlined />,
        children: buildTreeData(categoryList, c.id)
      }))
  }

  // 打开添加弹窗
  const handleAdd = (parentId = -1, level = 1) => {
    setEditingCategory(null)
    form.resetFields()
    form.setFieldsValue({ parent_id: parentId, level })
    setModalVisible(true)
  }

  // 打开编辑弹窗
  const handleEdit = (category) => {
    setEditingCategory(category)
    form.setFieldsValue({ name: category.name })
    setModalVisible(true)
  }

  // 保存分类
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (editingCategory) {
        const result = await lessonStore.updateCategory({ id: editingCategory.id, name: values.name })
        if (result.success) {
          message.success('更新成功')
        } else {
          message.error(result.message)
        }
      } else {
        const result = await lessonStore.createCategory({
          name: values.name,
          parent_id: values.parent_id || -1,
          level: values.level || 1
        })
        if (result.success) {
          message.success('创建成功')
        } else {
          message.error(result.message)
        }
      }
      setModalVisible(false)
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  // 删除分类
  const handleDelete = async (id) => {
    const result = await lessonStore.deleteCategory([id])
    if (result.success) {
      message.success('删除成功')
    } else {
      message.error(result.message)
    }
  }

  // 选择分类
  const handleSelect = (keys) => {
    if (keys.length > 0 && onSelect) {
      onSelect(keys[0])
    } else if (onSelect) {
      onSelect(null)
    }
  }

  return (
    <div className="category-tree-container">
      {/* 头部操作 */}
      {showActions && (
        <div className="category-tree-header">
          <span>课时分类</span>
          <Button
            type="text"
            size="small"
            icon={<FolderAddOutlined />}
            onClick={() => handleAdd()}
          />
        </div>
      )}

      {/* 全部选项 */}
      <div
        className={`category-all-item ${selectedCategoryId === null ? 'selected' : ''}`}
        onClick={() => onSelect?.(null)}
      >
        <FolderOutlined style={{ marginRight: 8 }} />
        <span>全部分类</span>
      </div>

      {/* 分类树 */}
      {treeData.length > 0 ? (
        <Tree
          showIcon
          treeData={treeData}
          selectedKeys={selectedCategoryId ? [selectedCategoryId] : []}
          onSelect={handleSelect}
          className="category-tree"
        />
      ) : (
        <div className="category-empty">
          <span>暂无分类</span>
          {showActions && (
            <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => handleAdd()}>
              添加分类
            </Button>
          )}
        </div>
      )}

      {/* 添加/编辑弹窗 */}
      <Modal
        title={editingCategory ? '编辑分类' : '添加分类'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="分类名称"
            name="name"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" maxLength={50} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CategoryTree