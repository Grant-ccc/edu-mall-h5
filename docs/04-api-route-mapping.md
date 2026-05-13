# 页面接口映射与数据字典

## 1. 通用约定

接口文件：

- 后台：`/Users/junlang/Downloads/admin.yaml`
- C 端：`/Users/junlang/Downloads/customer.yaml`

全局前缀：

```text
/api/mall
```

认证：

```text
Header: token
```

统一响应：

```ts
type Resp<T> = {
  code: number;
  msg: string;
  err_msg: string;
  is_aes: boolean;
  data: T | null;
};
```

分页：

```ts
type Pager = {
  page: number;
  limit: number;
  unlimited?: boolean;
};
```

## 2. 后台页面接口映射

### 2.1 管理员登录

| 页面动作 | 方法 | 接口 | 说明 |
| --- | --- | --- | --- |
| 获取滑块验证码 | GET | `/admin/v1/user/verify/captcha` | 白名单，需要 `once/ts/sign` |
| 校验滑块 | POST | `/admin/v1/user/verify/captcha/check` | 返回 `ticket` |
| 发送短信验证码 | POST | `/admin/v1/user/verify/smscode` | 依赖滑块 ticket |
| 手机号密码登录 | POST | `/admin/v1/user/mobile/password_login` | 返回 token 与管理员 |
| 手机号验证码登录 | POST | `/admin/v1/user/mobile/verify_login` | 返回 token 与管理员 |
| 飞书扫码登录 | POST | `/admin/v1/user/lark/qrcode_login` | 返回 token 与管理员 |
| 重置密码 | POST | `/admin/v1/user/mobile/reset_password` | 白名单 |

### 2.2 当前管理员与菜单

| 页面动作 | 方法 | 接口 | 说明 |
| --- | --- | --- | --- |
| 当前管理员信息 | GET | `/admin/v1/user/info` | 返回管理员与角色 |
| 当前权限列表 | GET | `/admin/v1/perm/my_perms` | 生成动态菜单与按钮权限 |
| 当前角色列表 | GET | `/admin/v1/role/my_roles` | 顶部角色展示 |
| 登出 | POST | `/admin/v1/user/logout` | 清理服务端登录态 |
| 绑定飞书 | POST | `/admin/v1/user/lark_bind` | 设置飞书 open_id |
| 解绑飞书 | POST | `/admin/v1/user/lark_unbind` | 解除绑定 |

### 2.3 C 端用户管理

| 页面动作 | 方法 | 接口 | 参数 |
| --- | --- | --- | --- |
| 用户列表 | GET | `/admin/v1/customer/user/list` | `page/limit/id/nick_name_kw/status/mobile` |
| 用户详情 | GET | `/admin/v1/customer/user/info` | `id` |

### 2.4 管理员管理

| 页面动作 | 方法 | 接口 | 说明 |
| --- | --- | --- | --- |
| 管理员列表 | GET | `/admin/v1/user/list` | 支持姓名、手机号、角色、状态筛选 |
| 创建管理员 | POST | `/admin/v1/user/create` | `CreateUserReq` |
| 更新管理员 | POST | `/admin/v1/user/update` | `UpdateUserReq` |
| 删除管理员 | POST | `/admin/v1/user/delete` | `DeleteUserReq` |

### 2.5 权限菜单

| 页面动作 | 方法 | 接口 | 说明 |
| --- | --- | --- | --- |
| 权限列表 | GET | `/admin/v1/perm/list` | 表格树数据 |
| 创建权限/菜单 | POST | `/admin/v1/perm/create` | 菜单或操作权限 |
| 批量更新权限/菜单 | POST | `/admin/v1/perm/update` | 可用于编辑与排序 |
| 删除权限/菜单 | POST | `/admin/v1/perm/delete` | 删除前二次确认 |

### 2.6 角色管理

| 页面动作 | 方法 | 接口 | 说明 |
| --- | --- | --- | --- |
| 角色列表 | GET | `/admin/v1/role/list` | 支持名称与状态筛选 |
| 创建角色 | POST | `/admin/v1/role/create` | `name/desc` |
| 更新角色 | POST | `/admin/v1/role/update` | `id/name/desc/status` |
| 设置角色权限 | POST | `/admin/v1/role/perm/sets` | `role_id/perm_ids` |

### 2.7 对象存储

| 页面动作 | 方法 | 接口 | 说明 |
| --- | --- | --- | --- |
| 获取临时密钥 | POST | `/admin/v1/storage/get_temp_secret` | 封面、详情图、视频、附件上传 |

### 2.8 录播课时

| 页面动作 | 方法 | 接口 | 说明 |
| --- | --- | --- | --- |
| 创建分类 | POST | `/admin/v1/lesson/category/create` | 返回分类 ID |
| 更新分类 | POST | `/admin/v1/lesson/category/update` | 修改名称 |
| 删除分类 | POST | `/admin/v1/lesson/category/delete` | 支持多个 ID |
| 分类列表 | GET | `/admin/v1/lesson/category/list` | 构建分类树 |
| 更新分类排序 | POST | `/admin/v1/lesson/category/update_sort` | 拖拽排序 |
| 创建课时 | POST | `/admin/v1/lesson/create` | 视频、附件、章节 |
| 更新课时 | POST | `/admin/v1/lesson/update` | 编辑课时 |
| 移动课时 | POST | `/admin/v1/lesson/move` | 批量移动分类 |
| 更新状态 | POST | `/admin/v1/lesson/update_status` | 启用/禁用 |
| 课时列表 | POST | `/admin/v1/lesson/list` | 注意是 POST 查询 |
| 课时详情 | GET | `/admin/v1/lesson/info` | `lesson_id` |

### 2.9 课程商品

| 页面动作 | 方法 | 接口 | 说明 |
| --- | --- | --- | --- |
| 创建课程 | POST | `/admin/v1/course/create` | 课程商品基本信息 |
| 课程详情 | GET | `/admin/v1/course/info` | `id` |
| 更新课程 | POST | `/admin/v1/course/update` | 编辑基本信息 |
| 更新上下架 | POST | `/admin/v1/course/update_status` | `status=-1/1` |
| 课程列表 | GET | `/admin/v1/course/list` | 多条件筛选 |
| 添加目录 | POST | `/admin/v1/course/catalog/add` | 课程目录 |
| 更新目录 | POST | `/admin/v1/course/catalog/update` | 修改目录名 |
| 删除目录 | POST | `/admin/v1/course/catalog/delete` | 删除目录 |
| 更新目录排序 | POST | `/admin/v1/course/catalog/update_sort` | 目录与课时排序 |
| 目录详情 | GET | `/admin/v1/course/catalog/info` | 课程目录树 |
| 添加课时到目录 | POST | `/admin/v1/course/catalog/add_lesson` | 批量添加 |
| 移除目录课时 | POST | `/admin/v1/course/catalog/remove_lesson` | 批量移除 |
| 更新目录课时 | POST | `/admin/v1/course/catalog/update_lesson` | 名称、试看、展示时间 |

### 2.10 订单与统计

| 页面动作 | 方法 | 接口 | 说明 |
| --- | --- | --- | --- |
| 订单列表 | POST | `/admin/v1/order/list` | YAML 提示运行态需确认前导 `/` |
| 订单详情 | GET | `/admin/v1/order/info` | `order_id` |
| 订单统计 | GET | `/admin/v1/order/statistic` | 日期类型、商品、时间范围 |
| 订单退款 | POST | `/admin/v1/order/refund` | 金额、原因、明细 ID |
| 后台取消订单 | POST | `/admin/v1/order/cancel` | 待支付订单取消 |

## 3. C 端页面接口映射

### 3.1 登录注册

| 页面动作 | 方法 | 接口 | 说明 |
| --- | --- | --- | --- |
| 获取滑块验证码 | GET | `/customer/v1/user/verify/captcha` | 白名单 |
| 校验滑块 | POST | `/customer/v1/user/verify/captcha/check` | 返回 ticket |
| 发送短信验证码 | POST | `/customer/v1/user/verify/smscode` | 返回调试验证码字段 |
| 小程序登录 | POST | `/customer/v1/user/applet/login` | app_code、code、platform |
| 手机号密码登录 | POST | `/customer/v1/user/mobile/password_login` | 返回 token |
| 手机号验证码登录/注册 | POST | `/customer/v1/user/mobile/verify_login` | 自动注册 |
| 重置密码 | POST | `/customer/v1/user/mobile/reset_password` | 验证码校验 |
| 获取微信扫码登录二维码 | POST | `/customer/v1/user/wechat/qrcode_login` | 返回 qrcode_url |
| 查询微信扫码状态 | GET | `/customer/v1/user/wechat/qrcode_status` | 轮询 scene_token |
| 微信扫码确认 | POST | `/customer/v1/user/wechat/scan_confirm` | 移动端确认场景 |

### 3.2 用户中心

| 页面动作 | 方法 | 接口 | 说明 |
| --- | --- | --- | --- |
| 当前用户信息 | GET | `/customer/v1/user/info` | 用户、手机号、微信、小程序绑定 |
| 修改密码 | POST | `/customer/v1/user/change_password` | 可要求重新登录 |
| 修改密码验证码 | POST | `/customer/v1/user/change_password/smscode` | 依赖滑块 ticket |
| 获取微信绑定二维码 | POST | `/customer/v1/user/wechat/qrcode_bind` | 账号设置页 |
| 解绑微信 | POST | `/customer/v1/user/wechat/unbind` | 需判断是否可解绑 |

### 3.3 课程与学习

| 页面动作 | 方法 | 接口 | 说明 |
| --- | --- | --- | --- |
| 课程列表 | GET | `/customer/v1/course/list` | C 端固定查询启用课程 |
| 课程详情 | GET | `/customer/v1/course/detail` | 包含目录与课时 |
| 课时信息 | GET | `/customer/v1/course/lesson/info` | 试看/已购播放前获取 |
| 学习进度 | GET | `/customer/v1/course/lesson/learn_info` | 断点续播 |
| 上报学习进度 | POST | `/customer/v1/course/lesson/learn_report` | 播放中定时上报 |
| 已购课程 | GET | `/customer/v1/course/purchased/list` | 我的课程 |
| 继续学习 | GET | `/customer/v1/course/continue/list` | 首页/学习中心入口 |

### 3.4 购物车

| 页面动作 | 方法 | 接口 | 说明 |
| --- | --- | --- | --- |
| 加入购物车 | POST | `/customer/v1/cart/add_goods` | `goods_id` |
| 删除购物车商品 | POST | `/customer/v1/cart/remove_goods` | `cart_id` 对应请求中的 `id` |
| 购物车列表 | GET | `/customer/v1/cart/list_goods` | YAML 提示 `goods_name_kw` 运行态需确认 |

### 3.5 订单与支付

| 页面动作 | 方法 | 接口 | 说明 |
| --- | --- | --- | --- |
| 计算订单价格 | POST | `/customer/v1/order/calc_fee` | 返回 `fee_uuid` |
| 立即创建并支付 | POST | `/customer/v1/order/pay_now` | 返回微信支付参数 |
| 待支付订单继续支付 | POST | `/customer/v1/order/pay_later` | 根据订单 ID |
| 取消订单 | POST | `/customer/v1/order/cancel` | 待支付订单 |
| 我的订单列表 | GET | `/customer/v1/order/list` | 多状态筛选 |
| 订单详情 | GET | `/customer/v1/order/info` | YAML 提示运行态需确认前导 `/` |

### 3.6 微信回调

| 回调 | 方法 | 接口 | 说明 |
| --- | --- | --- | --- |
| 支付结果回调 | POST | `/customer/v1/wechat/callback/payment` | 服务端使用，前端不调用 |
| 退款结果回调 | POST | `/customer/v1/wechat/callback/refund` | 服务端使用，前端不调用 |

## 4. 关键 DTO 摘要

### 4.1 课程

```ts
type CourseDto = {
  id: number;
  name: string;
  course_price: number;
  service_time: number;
  learn_time: number;
  status: number;
  features: string[];
  update_status: number;
  has_purchased: boolean;
  cover_url: string;
  detail_cover_url: string;
  detail: string;
};
```

### 4.2 课程详情

```ts
type CourseDetailDto = CourseDto & {
  total_duration: number;
  lesson_count: number;
  catalogs: CatalogDto[];
};
```

### 4.3 目录课时

```ts
type CatalogLessonDto = {
  id: number;
  lesson_id: number;
  index: number;
  name: string;
  lesson_name: string;
  video_url: string;
  duration: number;
  status: number;
  show_time: number;
  enable_trial: number;
};
```

### 4.4 订单

```ts
type OrderDto = {
  id: number;
  user_id: number;
  status: number;
  order_source: number;
  order_amount: number;
  discount_amount: number;
  payment_amount: number;
  trade_no: string;
  inner_trade_no: string;
  payment_at: number;
  refund_amount: number;
  create_at: number;
  user_name: string;
  user_mobile: string;
};
```

### 4.5 支付参数

```ts
type OrderPayNowRespData = {
  order_id: number;
  appId: string;
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
  code_url: string;
  trade_type: string;
};
```

## 5. 枚举字典

### 5.1 用户状态

| 值 | 名称 |
| --- | --- |
| 1 | 正常 |
| -1 | 禁用 |

### 5.2 权限类型

| 值 | 名称 | 前端用途 |
| --- | --- | --- |
| 1 | 菜单 | 动态菜单与路由 |
| 2 | 操作 | 按钮与动作权限 |

### 5.3 课程状态

| 值 | 名称 |
| --- | --- |
| 1 | 上架 |
| -1 | 下架 |

### 5.4 课程更新状态

| 值 | 名称 |
| --- | --- |
| 1 | 更新中 |
| 2 | 已完结 |

### 5.5 订单状态

| 值 | 名称 | C 端允许动作 | 后台允许动作 |
| --- | --- | --- | --- |
| -1 | 已取消 | 查看详情 | 查看详情 |
| 1 | 待支付 | 继续支付、取消 | 取消 |
| 2 | 已支付/待发货 | 查看详情 | 退款、后续发货扩展 |
| 3 | 已退款 | 查看退款记录 | 查看退款记录 |
| 4 | 已发货 | 查看详情/确认收货扩展 | 退款 |
| 5 | 已签收 | 查看详情 | 退款策略视业务 |
| 6 | 已完成 | 查看详情 | 查看详情 |

### 5.6 订单来源

| 值 | 名称 |
| --- | --- |
| 1 | 用户下单 |
| 2 | 管理后台 |
| 3 | 系统赠送 |

### 5.7 退款状态

| 值 | 名称 |
| --- | --- |
| 0 | 无退款 |
| 1 | 退款中 |
| 2 | 退款完成 |
| 3 | 退款异常 |

### 5.8 确认收货方式

| 值 | 名称 |
| --- | --- |
| 1 | 用户确认收货 |
| 99 | 发货后自动确认收货 |

## 6. 页面级联调清单

### 6.1 后台登录

- 滑块验证码是否需要 `once/ts/sign` 三个参数。
- 登录成功业务 `code` 是否为 `0`。
- token 过期 HTTP 状态和业务码。
- 飞书扫码登录回调前端地址和 `redirect_uri` 配置。

### 6.2 权限菜单

- `permission.code` 的初始化规范。
- 菜单权限 `page_path` 是否和前端路由一一对应。
- 操作权限 code 是否返回给当前用户。
- 禁用权限是否仍返回。

### 6.3 课程与课时

- `features` 在数据库中为 varchar，接口为数组，确认序列化规则。
- `detail` 富文本格式是 HTML、Markdown 还是纯文本。
- 视频 URL 是否有过期时间，播放器是否需要刷新签名。
- 试看课时接口权限由后端判断还是前端判断。

### 6.4 订单支付

- `calc_fee` 的 `fee_uuid` 过期时间和重复提交规则。
- `pay_now` 是否一定创建新订单，刷新页面后如何恢复。
- Native 支付是否通过订单详情轮询即可获得最终状态。
- 支付成功后课程权益发放对应状态是 `2`、`4`、`5` 还是 `6`。

### 6.5 退款

- 后台发起退款的可退状态范围。
- 部分退款后订单主状态如何展示。
- 课程权益在退款完成后是否回收。
- 退款回调异常后的人工处理入口。

## 7. 已发现需确认点

| 来源 | 问题 | 建议 |
| --- | --- | --- |
| `admin.yaml` | 订单相关路由描述提示 router.go 缺少前导 `/` | 联调前以后端实际路由为准 |
| `customer.yaml` | `/customer/v1/order/info` 描述提示 router.go 缺少前导 `/` | 联调前确认路由 |
| `customer.yaml` | 购物车 `goods_name_kw` 代码 DTO 缺少 form tag | 联调确认是否能筛选 |
| `admin.yaml` | `UpdateCatalogLessonReq.name` 描述提到 json tag 疑似笔误 | 前后端确认提交字段 |
| 数据库设计 | `orders.status` 同时出现已签收/已收货/已完成语义 | 统一产品文案和状态流 |
| 数据库设计 | 虚拟商品支付后状态流和权益发放时机 | 建议后端明确支付成功到权益发放的幂等状态 |
