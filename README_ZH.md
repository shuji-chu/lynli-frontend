# LynLi 超级管理中枢（lynli-frontend）

## 一句话总结
本项目是 **web.lynli.me 管理后台专属前端**——零框架、零构建的单页应用（原生 HTML/CSS/JS），统筹 LynLi 全部业务的超级大中台。面向客户的售卖前台不在此仓库（独立仓库 lynli-shop）。

## 技术栈
- 原生 HTML5 / CSS3 / JavaScript（ES6+），无 Vue/React，无构建步骤
- 深色蓝紫主题 + 动态流光光影背景 + 毛玻璃（backdrop-filter）UI
- Leaflet 卫星影像地图（全域可视化）+ ECharts 趋势图表（多 CDN 容灾）
- 单色 SVG 线条图标（Lucide 风格），全站无 Emoji
- 黑金玻璃拟态 Toast，严禁原生 alert

## 目录结构
```
index.html        SPA 唯一入口（登录页 + 中台外壳 + AI 悬浮窗）
css/style.css     深色主题全部样式（设计令牌 / 光影背景 / 毛玻璃 / 地图 / Toast）
js/app.js         核心逻辑：抽屉导航（六大分类 RBAC）、登录鉴权、数据大盘、
                  各业务页真实数据拉取、个人中心、Toast、验证码
js/map-page.js    全域可视化地图：卫星影像、发光节点/机房 Marker、
                  图层切换（节点分布/电商物流/服务器机房）、真实地理定位
js/ai-widget.js   全局 AI 客服悬浮窗（智谱 GLM 多轮对话）
favicon.png       品牌图标
apple-touch-icon.png
.github/workflows/deploy.yml   push 后自动构建部署 GitHub Pages
```

## 业务版图（抽屉六大分类，按角色 RBAC 显隐）
- **工作台**：数据大盘、全域可视化地图、系统日志
- **电商业务**：商品管理、订单代发
- **TGX 业务**：TGX 账号库、节点与订阅、接码池、API 分发
- **网络基建**：节点监控、域名管理、服务器探针
- **营销与客服**：AI 客服、工单、签到分销
- **系统设置**：员工账号权限分配、支付配置、邮件配置、个人中心

## 接口约定
- web.lynli.me 走同源 `/api/v1`（Nginx 反代）；其他域走 `https://api.lynli.me/api/v1`
- 登录：`POST /api/v1/passport/auth/login` → 返回 `token` + `role` + `isAdmin`
- 会话为**单 token 机制**（新登录会使旧 token 失效），前端已做探活自愈与强制重登
- 大盘：`/api/v1/admin/dashboard`；成员：`/api/v1/admin/users`；节点：`/api/v1/public/nodes`；个人信息：`/api/v1/user/info`；AI：`/api/v1/ai/chat`

## 部署
push 到 main → GitHub Actions 自动构建 → GitHub Pages → web.lynli.me（Nginx 反代 + Cloudflare）。
静态资源带 `?v=` 版本戳用于穿透 CDN 缓存，改版时需升级版本戳。
