# LYNLI PRO 综合管理后台前端 (lynli-frontend) 项目说明

## 一句话总结
本项目是一个现代化、无框架的后台管理系统前端（SPA），基于原生 JavaScript ES Modules 开发，主要为 LYNLI 系列业务（如电商、节点代理等）提供可视化管理界面。

## 技术栈
- 核心：原生 HTML5、CSS3、JavaScript (ES6 Modules)。
- 架构：零构建、零外部框架依赖（无 Vue/React），采用原生 Router 与 Store 模式。
- 网络请求：基于 Fetch API 封装。
- 界面风格：现代后台管理布局，包含数据大屏、工单客服、商品订单等。

## 核心目录与文件
- `index.html`：SPA 唯一入口，挂载点。
- `js/app.js`：应用主逻辑与初始化。
- `js/router.js`：原生前端路由控制。
- `js/store.js`：全局状态管理。
- `js/api.js`：网络请求封装（**核心配置**）。
- `js/views/`：存放所有业务页面的视图逻辑。
- `css/`：全局样式与 CSS 变量。

## 业务模块说明 (js/views/)
- `login.js`：登录页
- `layout.js`：全局布局（侧边栏、顶部导航）
- `dashboard.js`：仪表盘（数据看板）
- `bigscreen.js`：数据大屏可视化
- `ai-copilot.js`：AI 助手/副驾驶
- `chat.js` / `crm.js`：客服聊天与客户关系管理
- `products.js` / `orders.js` / `purchases.js`：商品、订单、采购管理
- `finance.js`：财务结算
- `marketing.js`：营销活动
- `logistics.js`：物流管理
- `suppliers.js`：供应商管理
- `proxy.js`：代理/节点业务管理
- `spider.js`：爬虫/数据采集模块
- `aftersales.js`：售后工单
- `organization.js` / `roles.js` / `profile.js`：组织架构、角色权限与个人中心
- `system.js`：系统设置

## 接口配置与运行
1. 修改接口地址：
   打开 `js/api.js`，修改 `const BASE_URL = "/api";` 为你的后端实际 API 地址（如 `https://api.example.com`）。后端建议搭配 `Lynli-Panel` 或 `guanli`。
2. 本地运行：
   由于使用了 ES Modules，不能直接双击 HTML 打开，需启动本地静态服务器（如 `python3 -m http.server` 或 `npx serve`）。
3. 部署：
   直接将该目录下所有文件上传至 Nginx、Vercel 或 Cloudflare Pages 即可。
