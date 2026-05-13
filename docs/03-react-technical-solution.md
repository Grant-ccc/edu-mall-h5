# React 前端技术方案

## 1. 技术目标

前端采用 React 构建后台管理端与 C 端用户端。MVP 可采用单仓库单应用多入口，也可以按 `admin` 与 `customer` 拆成两个应用。考虑当前接口前缀、权限模型和业务边界，推荐采用 Monorepo + 双应用：

- `apps/admin-web`：管理后台。
- `apps/customer-web`：C 端用户端。
- `packages/shared`：通用工具、接口客户端、枚举、组件基础能力。

这样既能在 MVP 阶段共享接口与工具，又能在后续独立部署和独立演进。

## 2. 推荐技术栈

| 领域 | 选择 | 说明 |
| --- | --- | --- |
| UI 框架 | React + TypeScript | 类型安全、组件化、生态成熟 |
| 构建工具 | Vite | 开发启动快，适合 React SPA |
| 路由 | React Router | 支持嵌套路由、守卫式布局 |
| 服务端状态 | TanStack Query | 管理接口缓存、加载态、重试和失效 |
| 客户端状态 | Zustand | 管理 token、用户信息、权限、轻量 UI 状态 |
| UI 组件 | Ant Design | 后台效率高，C 端也可复用基础组件 |
| 表单 | React Hook Form 或 Ant Design Form | 后台复杂表单建议 AntD Form |
| 图表 | ECharts 或 Ant Design Charts | 订单统计、趋势图 |
| 视频播放 | HTML5 video + 自定义控制，后续接入 xgplayer/hls.js | MVP 先满足 MP4/对象存储 URL |
| 请求 | Axios 或 Fetch 封装 | token、错误码、AES 标记统一处理 |
| 代码生成 | openapi-typescript / Orval | 由 YAML 生成类型和请求方法 |
| 测试 | Vitest + Testing Library + Playwright | 单元、组件、关键链路 E2E |

## 3. 工程目录

```text
edu-mall-frontend/
  apps/
    admin-web/
      src/
        app/
        pages/
        routes/
        layouts/
        features/
        main.tsx
    customer-web/
      src/
        app/
        pages/
        routes/
        layouts/
        features/
        main.tsx
  packages/
    shared/
      src/
        api/
        auth/
        constants/
        formatters/
        hooks/
        permissions/
        types/
        upload/
        utils/
  openapi/
    admin.yaml
    customer.yaml
  package.json
  pnpm-workspace.yaml
```

## 4. 路由设计

### 4.1 后台路由

| 路径 | 页面 | 权限建议 |
| --- | --- | --- |
| `/admin/login` | 管理员登录 | 白名单 |
| `/admin/dashboard` | 工作台 | `dashboard:view` |
| `/admin/customers` | C 端用户 | `customer:user:list` |
| `/admin/users` | 管理员管理 | `admin:user:list` |
| `/admin/roles` | 角色管理 | `role:list` |
| `/admin/permissions` | 权限菜单 | `perm:list` |
| `/admin/lesson-categories` | 录播分类 | `lesson:category:list` |
| `/admin/lessons` | 录播课时 | `lesson:list` |
| `/admin/courses` | 课程商品 | `course:list` |
| `/admin/courses/:id/catalog` | 课程目录编排 | `course:catalog:info` |
| `/admin/orders` | 订单列表 | `order:list` |
| `/admin/orders/:id` | 订单详情 | `order:info` |
| `/admin/statistics/orders` | 订单统计 | `order:statistic` |

路由权限以服务端权限 code 为准，以上 code 是前端建议命名，最终需与 `permission.code` 初始化数据统一。

### 4.2 C 端路由

| 路径 | 页面 | 登录要求 |
| --- | --- | --- |
| `/` | 课程列表/首页 | 否 |
| `/courses` | 课程列表 | 否 |
| `/courses/:id` | 课程详情 | 否 |
| `/login` | 登录页 | 否 |
| `/cart` | 购物车 | 是 |
| `/checkout` | 确认订单 | 是 |
| `/pay/:orderId` | 支付页 | 是 |
| `/pay/result` | 支付结果 | 是 |
| `/me/courses` | 我的课程 | 是 |
| `/learn/:courseId/:lessonId` | 学习页 | 是，试看课时可按后端策略放开 |
| `/me/orders` | 我的订单 | 是 |
| `/me/orders/:id` | 订单详情 | 是 |
| `/me/settings` | 账号设置 | 是 |

## 5. 接口层设计

### 5.1 请求封装

统一封装 `request`：

- 自动拼接 baseURL：`/api/mall`。
- 从 auth store 读取 token，写入 header `token`。
- 统一解析 `Resp`：`code`、`msg`、`err_msg`、`is_aes`、`data`。
- HTTP 401 或业务未登录码：清理 token，跳登录。
- 业务错误：抛出带 `msg` 的异常，页面 Toast 展示。
- `is_aes=true`：预留 data 解密处理。

伪代码：

```ts
export async function request<T>(config: RequestConfig): Promise<T> {
  const response = await http.request<ApiResp<T>>(config);
  if (response.status === 401) {
    authStore.getState().logout();
    throw new AuthExpiredError();
  }
  const body = response.data;
  if (body.code !== 0) {
    throw new BusinessError(body.msg || body.err_msg);
  }
  return maybeDecrypt(body.data, body.is_aes);
}
```

### 5.2 OpenAPI 类型生成

建议将用户提供的两个 YAML 拷贝到 `openapi/` 后生成类型：

```text
openapi/admin.yaml
openapi/customer.yaml
```

生成策略：

- `packages/shared/src/api/generated/admin.ts`
- `packages/shared/src/api/generated/customer.ts`
- 不直接在页面中写裸 URL，统一通过 API 模块调用。

### 5.3 Query Key 规范

```ts
export const queryKeys = {
  adminUserList: (params: AdminUserListParams) => ['admin', 'users', params],
  permissionTree: () => ['admin', 'permissions'],
  roleList: (params: RoleListParams) => ['admin', 'roles', params],
  courseList: (params: CourseListParams) => ['courses', params],
  courseDetail: (id: number) => ['courses', id],
  orderList: (params: OrderListParams) => ['orders', params],
  orderDetail: (id: number) => ['orders', id],
};
```

变更后失效策略：

- 创建/更新/删除管理员：失效管理员列表。
- 更新权限：失效权限列表、当前用户权限。
- 角色授权：失效角色列表、当前用户权限。
- 课程更新：失效课程列表、课程详情、C 端课程列表。
- 支付/取消/退款：失效订单列表、订单详情、已购课程列表。

## 6. 状态管理

### 6.1 Auth Store

字段：

- `token`
- `user`
- `roles`
- `permissions`
- `menus`
- `loginRedirect`

方法：

- `setToken`
- `setUser`
- `setPermissions`
- `logout`
- `hasPermission(code)`

### 6.2 Customer Store

字段：

- `cartCount`
- `lastCheckoutCourseIds`
- `paymentPollingOrderId`
- `loginModalVisible`

服务端数据如课程、订单、购物车列表交给 TanStack Query，不放入全局 store。

## 7. 权限与菜单

后台权限处理流程：

1. 登录成功保存 token。
2. 请求当前管理员信息。
3. 请求当前管理员权限列表。
4. 将 `type=1` 的权限转为菜单树。
5. 将 `type=2` 的权限转为按钮权限集合。
6. 路由进入前匹配 `page_path` 或 route meta。
7. 页面按钮使用 `PermissionGuard` 包裹。

菜单构建规则：

- `parent_id=-1` 为一级菜单。
- 按 `sort` 升序。
- `status=-1` 不展示。
- `page_path` 为空的菜单不可点击，只作为分组。

## 8. 支付方案

### 8.1 支付创建

C 端先调用 `/customer/v1/order/calc_fee` 获取 `fee_uuid` 和金额明细，再调用 `/customer/v1/order/pay_now` 创建订单并获取微信支付参数。

根据 `trade_type` 展示：

- `NATIVE`：展示 `code_url` 二维码。
- `JSAPI` 或小程序：使用返回的 `appId/timeStamp/nonceStr/package/signType/paySign` 调起支付。

### 8.2 支付状态同步

前端不能以支付弹窗成功作为最终成功，必须以后端订单状态为准。

建议轮询策略：

- 支付页每 3 秒查询订单详情。
- 轮询最多 2 分钟。
- 状态进入已支付、已发货、已签收、已完成时停止并跳成功页。
- 用户离开支付页时停止轮询。
- 回到订单列表可继续支付待支付订单。

## 9. 学习播放器方案

MVP：

- 使用 HTML5 `video` 播放 `video_url`。
- 初始化时读取 `learn_info`，设置 `currentTime=play_position`。
- `timeupdate` 节流上报，间隔 15 到 30 秒。
- `pause`、`ended`、`visibilitychange`、路由离开时补报。
- 章节点击设置 `currentTime=begin_position`。
- 附件列表直接展示下载或预览链接。

后续：

- 接入 xgplayer 或 hls.js 支持 HLS、倍速、清晰度、弹幕、水印。
- 增加防录屏水印、试看时长限制。

## 10. 上传方案

后台上传视频、封面、详情图和附件时调用 `/admin/v1/storage/get_temp_secret` 获取对象存储临时密钥。

上传流程：

1. 用户选择文件。
2. 前端传 `scene/file_name/file_size/file_type/client_ip` 获取临时密钥。
3. 前端直传对象存储。
4. 上传成功后保存 `key/file_url/file_name` 到表单。
5. 业务表单提交给课程或课时接口。

注意：

- 大视频上传需要进度条、取消上传、失败重试。
- 表单提交前校验上传状态。
- 文件类型和大小前端预校验，后端最终校验。

## 11. 错误处理

| 错误 | 处理 |
| --- | --- |
| 401 | 清理登录态，跳转登录 |
| 403 或无权限业务码 | 展示无权限页或隐藏按钮 |
| 网络超时 | Toast + 重试按钮 |
| 表单校验失败 | 定位到字段并展示错误 |
| 支付超时 | 提示可在订单列表继续支付 |
| 上传失败 | 保留表单内容，允许重试 |
| 订单状态变更冲突 | 刷新订单详情后提示最新状态 |

## 12. 枚举管理

前端统一维护枚举，不在页面硬编码：

- `OrderStatus`
- `OrderSource`
- `RefundStatus`
- `UserStatus`
- `CourseStatus`
- `CourseUpdateStatus`
- `PermissionType`
- `Sex`
- `ServiceTime`
- `LearnTime`
- `PayPlatform`

枚举输出：

- label
- color
- allowedActions
- description

## 13. 测试方案

### 13.1 单元测试

- 金额格式化。
- 时间格式化。
- 权限树构建。
- 订单状态 action 判断。
- OpenAPI 响应解析。

### 13.2 组件测试

- 登录表单 Tab 切换。
- 权限按钮隐藏/显示。
- 课程卡片已购买/未购买状态。
- 支付二维码页轮询停止逻辑。
- 视频播放器进度上报节流。

### 13.3 E2E

后台：

- 管理员登录。
- 创建角色并授权。
- 创建课程与目录。
- 查看订单并发起退款。

C 端：

- 手机号验证码登录。
- 浏览课程、加入购物车、确认订单。
- 支付页展示二维码。
- 已购课程进入学习页，进度上报。

## 14. 部署方案

推荐：

- `admin-web` 和 `customer-web` 独立构建。
- Nginx 分别托管静态资源。
- `/api/mall` 反向代理到 Go Gin 服务。
- 静态资源开启 hash 缓存。
- HTML 禁止强缓存。
- 环境变量区分 dev/test/prod。

Nginx 路由：

```text
/admin/*       -> admin-web index.html
/*             -> customer-web index.html
/api/mall/*    -> backend service
```

## 15. 安全要点

- token 存储优先考虑 httpOnly Cookie；若当前后端只支持 header token，则本地存储需配合 XSS 防护。
- 富文本详情渲染需要 XSS 清洗。
- 支付回调只由服务端处理，前端仅展示结果。
- 权限控制以后端为准，前端隐藏按钮只做体验优化。
- 手机号、open_id 等敏感字段展示时按角色脱敏。

## 16. 联调注意事项

- `admin.yaml` 和 `customer.yaml` 的全局前缀为 `/api/mall`。
- header 名称为 `token`，不是 `Authorization`。
- 响应统一为 `Resp` 包装，微信回调除外。
- 金额单位为分，时间多数为毫秒时间戳，少量表结构为 `datetime`。
- 部分订单路由在 YAML 描述中标注前导 `/` 需确认，联调前以后端实际 router 为准。
- `UpdateCatalogLessonReq` 中 `name` 字段描述提到代码 tag 疑似笔误，提交前需和后端确认字段名。

## 17. 参考资料

- React 官方文档：https://react.dev/
- Vite 官方文档：https://vite.dev/
- React Router 官方文档：https://reactrouter.com/
- TanStack Query 官方文档：https://tanstack.com/query/latest
- Ant Design 官方文档：https://ant.design/
