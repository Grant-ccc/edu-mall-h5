# 在线教育商城前端与业务方案交付物

本目录基于以下输入生成：

- B 站参考视频：`BV1zMDMB2ETW`，标题为「Go语言从零到实战，完整项目经验教程：Go语言在线教育商城实战，覆盖订单/支付/退款/学习进度全链路」。
- 后台接口文件：`/Users/junlang/Downloads/admin.yaml`
- 前台接口文件：`/Users/junlang/Downloads/customer.yaml`
- 你提供的需求分析、数据库设计与 Go/Gin/MySQL/Redis/Etcd 技术方案。

## 交付物清单

1. [产品与业务文档](./01-product-business-doc.md)
   - 业务目标、用户角色、范围边界、核心流程、状态模型、权限模型、MVP 与后续演进。

2. [前端设计与交互成果](./02-frontend-design-interaction.md)
   - 后台管理端与 C 端页面结构、关键页面布局、交互规则、异常态、空态、权限菜单、学习播放器体验。

3. [React 前端技术方案](./03-react-technical-solution.md)
   - React 工程架构、技术栈选型、路由权限、接口层、状态管理、支付轮询、上传、测试与部署方案。

4. [页面接口映射与数据字典](./04-api-route-mapping.md)
   - 后台/C 端页面到 API 的映射、关键 DTO、枚举、联调注意事项。

## 设计基调

- 后台管理端：参考视频中的教程项目方向，采用「Ant Design Pro 式」工作台结构，强调列表筛选、表单抽屉、树形权限、课程目录编排和订单处理效率。
- C 端用户端：采用课程商城 + 学习中心结构，强调从「浏览课程」到「购买支付」再到「继续学习」的闭环。
- 技术栈：React 为主，配合 TypeScript、Vite、React Router、TanStack Query、Ant Design、Zustand 等工具进行工程化落地。

## 已知说明

- B 站页面通过接口读取到视频元信息与分集标题，未逐帧抓取视频画面；交互设计按该视频的项目主题、分集模块与接口文件进行归纳。
- `admin.yaml` 与 `customer.yaml` 中均声明所有业务接口以 `/api/mall` 为全局前缀。
- 部分订单接口在 YAML 描述中已标注「router.go 缺少前导 /，运行态需确认」，联调前需要以后端实际路由为准。
