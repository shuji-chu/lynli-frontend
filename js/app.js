// ============================================================
// LynLi · 超级管理中枢 核心逻辑
// - 抽屉式导航（六大分类，RBAC 按角色显隐）
// - 登录路由: /api/v1/passport/auth/login（返回 token + role）
// - 大盘: /api/v1/admin/dashboard（MySQL 真实聚合 + 7 日趋势）
// - 员工: /api/v1/admin/users（真实成员列表）
// - 节点: /api/v1/public/nodes（servers 表真实节点）
// - 个人中心: /api/v1/user/info（动态拉取，不写死）
// - 验证码: 前端本地生成 4 位字符（canvas 绘制，点击刷新，本地校验）
// ============================================================
// 域名说明：web.lynli.me（面板，nginx 同源代理 /api/）与 tg.lynli.me（商城，独立站点）
// 是两套独立网站。仅 web.lynli.me 走同源 /api/v1，其余域名统一走 api.lynli.me
const API_BASE = (location.hostname === "web.lynli.me")
    ? "/api/v1"
    : "https://api.lynli.me/api/v1";

// ---------- 角色体系（RBAC） ----------
// 后端 users.role: admin / operator / support / user（网关映射 admin→super 权限）
const ROLE_LABELS = {
  super: "超级管理员", admin: "超级管理员",
  operator: "运营",
  support: "客服", service: "客服",
  user: "普通用户",
};
const ROLE_BADGE_CLASS = {
  super: "", admin: "",
  operator: "r-operator",
  support: "r-support", service: "r-support",
  user: "r-user",
};

function normalizeRole(r) {
  r = (r || "user").toString().trim().toLowerCase();
  if (r === "admin") return "super";       // 老板 = 超管
  if (r === "service") return "support";   // 客服
  if (r === "staff") return "operator";
  return r;
}
function currentRole() { return normalizeRole(localStorage.getItem("lynli_admin_role")); }
function roleLabel(r) { r = r || currentRole(); return ROLE_LABELS[r] || r; }
function roleBadgeClass(r) { r = r || currentRole(); return ROLE_BADGE_CLASS[r] || "r-user"; }

// ---------- 会话自愈与强制重登（修复旧会话缺 role / token 失效） ----------
// 后端为单会话机制：任一设备新登录会使旧 token 失效；
// 旧版本前端未存储 role，会导致角色显示"普通用户"并触发 RBAC 隐藏菜单。
function _isAuthFail(j) {
  return !!j && (j.status === "fail" || (j.data === null && /unauth/i.test(j.message || "")));
}
let _reLogging = false;
function _forceReLogin(msg) {
  if (_reLogging) return;
  _reLogging = true;
  if (window.LynliUser) { LynliUser.clear(); }
  else {
    ["lynli_admin", "lynli_admin_token", "lynli_admin_email", "lynli_admin_role", "lynli_admin_isadmin"]
      .forEach(k => localStorage.removeItem(k));
  }
  document.body.classList.remove("logged-in");
  showToast(msg || "登录状态已失效，请重新登录", "warn");
  setTimeout(() => location.reload(), 1400);
}
// 探活会话：返回 'ok' | 'auth_fail' | 'net_error'；role 缺失时自动探测管理权限自愈
async function _probeSession(tok) {
  try {
    const r = await fetch(`${API_BASE}/user/info`, { headers: { "Authorization": "Bearer " + tok } });
    const j = await r.json().catch(() => null);
    if (j && j.data) {
      if (!localStorage.getItem("lynli_admin_role")) {
        let role = "user";
        try {
          const ar = await fetch(`${API_BASE}/admin/dashboard`, { headers: { "Authorization": "Bearer " + tok } });
          const aj = await ar.json().catch(() => null);
          if (aj && aj.code === 1) role = "admin";
        } catch (e) { /* 探测失败按普通用户 */ }
        localStorage.setItem("lynli_admin_role", role);
      }
      return "ok";
    }
    return _isAuthFail(j) ? "auth_fail" : "auth_fail";
  } catch (e) {
    return "net_error";
  }
}

// ---------- 菜单图标（单色极简 SVG 线条） ----------
const ICONS = {
  grid: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  map: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 4L3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4z"/><path d="M9 4v13M15 6.5v13"/></svg>',
  logs: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h9l4 4v14a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M14 3v5h5"/><path d="M9 12h7M9 16h7"/></svg>',
  box: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>',
  receipt: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21V3z"/><path d="M9 8h6M9 12h6"/></svg>',
  database: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/></svg>',
  layers: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 17l9 5 9-5"/></svg>',
  globe: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 2.6 4 5.6 4 9s-1.2 6.4-4 9c-2.8-2.6-4-5.6-4-9s1.2-6.4 4-9z"/></svg>',
  sms: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 10h8M8 14h5"/></svg>',
  key: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="15" r="4"/><path d="M10.8 12.2L20 3M17 6l2.5 2.5M14.5 8.5L17 11"/></svg>',
  activity: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 8-6-16-3 8H2"/></svg>',
  dns: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="3.5"/></svg>',
  radar: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="M12 12l6-4"/></svg>',
  robot: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 7V4M9 4h6"/><circle cx="9" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1" fill="currentColor" stroke="none"/></svg>',
  ticket: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 8V6a1 1 0 011-1h16a1 1 0 011 1v2a3 3 0 000 6v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2a3 3 0 000-6z"/><path d="M12 6v12" stroke-dasharray="2 2"/></svg>',
  gift: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13"/><path d="M12 8S9.5 3 7.5 4.5C5.8 5.8 6.8 8 12 8zM12 8s2.5-5 4.5-3.5C18.2 5.8 17.2 8 12 8z"/></svg>',
  users: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3.1-5 7-5s7 1.5 7 5"/><circle cx="17" cy="9" r="2.8"/><path d="M16 15.5c2.8.3 5 1.6 5 4.5"/></svg>',
  shield: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3z"/><path d="M9 12l2 2 4-4"/></svg>',
  gear: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
  credit: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/></svg>',
  mail: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/></svg>',
  megaphone: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11v3a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1z"/><path d="M15 8a5 5 0 010 8M18 5.5a8.5 8.5 0 010 13"/></svg>',
  server: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01M11 7.5h4M11 16.5h4"/></svg>',
  user: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>',
  // ---- 阶段三：电商自动化 / 极客工具箱 / AI 营销 ----
  download: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12"/><path d="M8 11l4 4 4-4"/><path d="M4 19h16"/><path d="M4 19v2M20 19v2"/></svg>',
  truck: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 7h11v9H2z"/><path d="M13 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>',
  pricetag: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.6 13.4L11 3.8V2H9v2L2.6 8.4"/><path d="M6 8l8 8"/><circle cx="17.5" cy="17.5" r="3.5"/></svg>',
  scan: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7V4h3M20 7V4h-3M4 17v3h3M20 17v3h-3"/><rect x="8" y="8" width="8" height="8" rx="1"/></svg>',
  ip: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 2.6 4 5.6 4 9s-1.2 6.4-4 9c-2.8-2.6-4-5.6-4-9s1.2-6.4 4-9z"/></svg>',
  gauge: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 18a8 8 0 1116 0"/><path d="M12 14l4-4"/><circle cx="12" cy="14" r="1.4" fill="currentColor" stroke="none"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 18a4 4 0 000-8 6 6 0 00-11.6 1.6A3.5 3.5 0 006 18z"/><path d="M8 21l1-2M12 21l1-2M16 21l1-2"/></svg>',
  qrcode: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM19 19h2v2h-2z"/></svg>',
  poster: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.6"/><path d="M21 15l-5-5-9 9"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/><path d="M18.5 15.5l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4z"/></svg>',
  film: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 15h18M8 4v16M16 4v16"/></svg>',
};

// ---------- 六大分类菜单（roles 为空 = 全员可见） ----------
const MENU_GROUPS = [
  { label: "工作台", icon: ICONS.grid, items: [
    { id: "dashboard", label: "数据大盘", icon: ICONS.grid },
    { id: "map", label: "全域可视化地图", icon: ICONS.map },
  ]},
  { label: "数字资产（TGX）", icon: ICONS.layers, items: [
    { id: "tgx", label: "TGX 账号库", icon: ICONS.database, roles: ["super", "operator"] },
    { id: "nodes", label: "节点与订阅", icon: ICONS.globe },
    { id: "apikeys", label: "API 接口市场", icon: ICONS.key, roles: ["super", "operator"] },
  ]},
  { label: "电商业务", icon: ICONS.box, items: [
    { id: "products", label: "商品管理", icon: ICONS.box, roles: ["super", "operator"] },
    { id: "orders", label: "订单与代发", icon: ICONS.receipt, roles: ["super", "operator"] },
  ], children: [
    { label: "电商自动化", icon: ICONS.download, items: [
      { id: "ecom-pull", label: "上游挂机拉单", icon: ICONS.download, roles: ["super", "operator"] },
      { id: "ecom-express", label: "快递追踪", icon: ICONS.truck, roles: ["super", "operator"] },
      { id: "ecom-price", label: "全网比价", icon: ICONS.pricetag, roles: ["super", "operator"] },
      { id: "ecom-sentinel", label: "哨兵监控", icon: ICONS.radar, roles: ["super", "operator"] },
      { id: "ecom-ocr", label: "财务OCR对账", icon: ICONS.scan, roles: ["super", "operator"] },
    ]},
  ]},
  { label: "网络与工具", icon: ICONS.server, items: [
    { id: "monitor", label: "节点监控", icon: ICONS.activity },
    { id: "dns", label: "域名管理", icon: ICONS.dns, roles: ["super", "operator"] },
    { id: "probe", label: "服务器探针", icon: ICONS.radar, roles: ["super", "operator"] },
  ], children: [
    { label: "极客工具箱", icon: ICONS.gauge, items: [
      { id: "geek-ip", label: "IP归属地查询", icon: ICONS.ip },
      { id: "geek-speed", label: "网络测速", icon: ICONS.gauge },
      { id: "geek-forex", label: "天气/汇率", icon: ICONS.cloud },
      { id: "geek-qrcode", label: "二维码生成", icon: ICONS.qrcode },
    ]},
  ]},
  { label: "营销与客服", icon: ICONS.megaphone, items: [
    { id: "poster", label: "海报生成器", icon: ICONS.poster },
    { id: "ai", label: "AI 客服", icon: ICONS.robot },
    { id: "tickets", label: "工单系统", icon: ICONS.ticket, roles: ["super", "operator", "support"] },
    { id: "distribution", label: "签到分销", icon: ICONS.gift, roles: ["super", "operator"] },
  ]},
  { label: "晴天支付", icon: ICONS.credit, items: [
    { id: "pay-dashboard", label: "支付大盘", icon: ICONS.grid, roles: ["super"] },
    { id: "pay-merchants", label: "商户审批", icon: ICONS.users, roles: ["super"] },
    { id: "pay-withdrawals", label: "提现审核", icon: ICONS.credit, roles: ["super"] },
  ]},
  { label: "系统设置", icon: ICONS.gear, items: [
    { id: "bots-matrix", label: "机器人矩阵", icon: ICONS.robot, roles: ["super"] },
    { id: "staff", label: "员工权限", icon: ICONS.users, roles: ["super"] },
    { id: "payment", label: "支付配置", icon: ICONS.credit, roles: ["super"] },
    { id: "mail", label: "邮件配置", icon: ICONS.mail, roles: ["super"] },
    { id: "profile", label: "个人中心", icon: ICONS.user },
  ]},
];
// 折叠状态持久化键
const DRAWER_FOLD_KEY = "lynli_drawer_folds";
function _drawerFolds() { try { return JSON.parse(localStorage.getItem(DRAWER_FOLD_KEY) || "{}"); } catch (e) { return {}; } }
function _saveDrawerFolds(f) { try { localStorage.setItem(DRAWER_FOLD_KEY, JSON.stringify(f)); } catch (e) {} }
// 一级分组折叠/展开
function toggleDrawerGroup(idx) {
    const el = document.querySelector(`.dgroup[data-g="${idx}"]`);
    if (!el) return;
    el.classList.toggle("collapsed");
    const f = _drawerFolds(); f["g" + idx] = el.classList.contains("collapsed"); _saveDrawerFolds(f);
}
// 嵌套子分组折叠/展开
function toggleDrawerSub(idx, si) {
    const el = document.querySelector(`.dsub[data-g="${idx}-${si}"]`);
    if (!el) return;
    el.classList.toggle("collapsed");
    const f = _drawerFolds(); f["s" + idx + "-" + si] = el.classList.contains("collapsed"); _saveDrawerFolds(f);
}
// 页面标题映射（顶栏显示）
const PAGE_TITLES = {
  dashboard: "数据大盘", map: "全域可视化地图",
  products: "商品管理", orders: "订单与代发",
  tgx: "TGX 账号库", nodes: "节点与订阅", apikeys: "API 接口市场",
  monitor: "节点监控", dns: "域名管理", probe: "服务器探针",
  ai: "AI 客服", tickets: "工单系统", distribution: "签到分销", poster: "海报生成器",
  "ecom-pull": "上游挂机拉单", "ecom-express": "快递追踪", "ecom-price": "全网比价",
  "ecom-sentinel": "哨兵监控", "ecom-ocr": "财务OCR对账",
  "geek-ip": "IP归属地查询", "geek-speed": "网络测速", "geek-forex": "天气/汇率", "geek-qrcode": "二维码生成",
  "pay-dashboard": "晴天支付 · 数据大盘", "pay-merchants": "晴天支付 · 商户审批", "pay-withdrawals": "晴天支付 · 提现审核",
  staff: "员工权限", payment: "支付配置", mail: "邮件配置",
  "bots-matrix": "机器人矩阵",
  profile: "个人中心",
};

// ---------- Toast 提示（黑金玻璃拟态，统一走这里，严禁原生 alert） ----------
function showToast(msg, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    let iconEl = toast.querySelector('.toast-icon');
    if (!iconEl) {
        iconEl = document.createElement('div');
        iconEl.className = 'toast-icon';
        toast.prepend(iconEl);
    }
    let textEl = toast.querySelector('.toast-text');
    if (!textEl) {
        textEl = document.createElement('div');
        textEl.id = 'toast-text';
        textEl.className = 'toast-text';
        toast.appendChild(textEl);
    }
    iconEl.innerHTML = '<span class="toast-dot"></span>';
    textEl.innerText = msg;
    toast.classList.remove('t-success', 't-error', 't-warn');
    if (type === 'success') toast.classList.add('t-success');
    if (type === 'error') toast.classList.add('t-error');
    if (type === 'warn') toast.classList.add('t-warn');
    toast.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ---------- 传统 4 位字符验证码（canvas 本地生成，深色配色） ----------
const CAPTCHA_CHARS = 'ACDEFGHJKMNPQRTUVWXY34679';
let captchaCode = '';

function _randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function genCaptchaCode(n = 4) {
    let s = '';
    for (let i = 0; i < n; i++) s += CAPTCHA_CHARS[_randInt(0, CAPTCHA_CHARS.length - 1)];
    return s;
}

function drawCaptcha() {
    captchaCode = genCaptchaCode();
    const canvas = document.getElementById('captcha-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // 蓝白主题：浅底 + 深蓝字符
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#f3f7ff');
    bg.addColorStop(1, '#e4ecfb');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 浅色噪点
    for (let i = 0; i < 60; i++) {
        ctx.fillStyle = `rgba(${_randInt(120, 170)},${_randInt(140, 190)},${_randInt(200, 245)},${Math.random() * 0.4 + 0.12})`;
        ctx.fillRect(_randInt(0, W), _randInt(0, H), 2, 2);
    }
    // 干扰曲线
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, _randInt(0, H));
        ctx.bezierCurveTo(W * 0.3, _randInt(0, H), W * 0.6, _randInt(0, H), W, _randInt(0, H));
        ctx.strokeStyle = `rgba(${_randInt(90, 140)},${_randInt(110, 160)},${_randInt(200, 240)},0.35)`;
        ctx.lineWidth = _randInt(1, 2);
        ctx.stroke();
    }

    // 深蓝字符（浅底上保证可读）
    const inks = ['#1e40af', '#2563eb', '#1d4ed8', '#3730a3', '#0e7490'];
    const cw = W / 4;
    for (let i = 0; i < captchaCode.length; i++) {
        ctx.save();
        const cx = cw * i + cw / 2 + _randInt(-4, 4);
        const cy = H / 2 + _randInt(-4, 4);
        ctx.translate(cx, cy);
        ctx.rotate((_randInt(-22, 22)) * Math.PI / 180);
        ctx.font = `bold ${_randInt(24, 30)}px "Segoe UI", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(37,99,235,.25)';
        ctx.shadowBlur = 4;
        ctx.fillStyle = inks[_randInt(0, inks.length - 1)];
        ctx.fillText(captchaCode[i], 0, 0);
        ctx.restore();
    }
}

function refreshCaptcha() {
    drawCaptcha();
    const input = document.getElementById('captcha-input');
    if (input) { input.value = ''; input.focus(); }
}

function checkCaptcha() {
    const input = document.getElementById('captcha-input');
    const val = (input?.value || '').trim().toUpperCase();
    return val.length === 4 && val === captchaCode;
}

// ---------- 登录按钮加载状态 ----------
function setLoginLoading(on) {
    const btn = document.getElementById('btn-login');
    if (!btn) return;
    btn.disabled = on;
    btn.classList.toggle('is-loading', on);
    btn.innerText = on ? '正在验证...' : '登 录';
}

// ---------- 登录 ----------
async function doLogin() {
    const account = document.getElementById('login-user')?.value.trim();
    const password = document.getElementById('login-pass')?.value.trim();

    if (!account || !password) { showToast('账号或密码没填', 'warn'); return; }
    if (!checkCaptcha()) {
        showToast('验证码错误，请重新输入', 'warn');
        refreshCaptcha();
        return;
    }

    setLoginLoading(true);
    showToast('正在连接后端...', 'info');

    try {
        const res = await fetch(`${API_BASE}/passport/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email: account, password: password })
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();

        if (json.data && json.data.token) {
            // 真实登录：token/role/isAdmin 立即入库；user_id/short_id/nickname/avatar
            // login 接口不返回，由 LynliUser.afterLogin 立即向 /user/info 补齐（唯一真实来源）
            showToast('登录成功，正在拉取账户信息', 'success');
            setLoginLoading(false);
            if (document.getElementById('remember-me')?.checked) {
                localStorage.setItem('lynli_admin', 'true');
            }
            await window.LynliUser.afterLogin(json.data, account);
            renderDrawer();
            enterMainApp();
        } else {
            showToast(json.message || '账号或密码错误', 'error');
            refreshCaptcha();
            setLoginLoading(false);
        }
    } catch (err) {
        console.error('登录报错详情:', err);
        let errMsg = '请求失败';
        if (err.message.includes('Failed to fetch')) {
            errMsg = '网络异常，请检查连接后重试';
        } else {
            errMsg = err.message;
        }
        showToast(`登录失败: ${errMsg}`, 'error');
        refreshCaptcha();
        setLoginLoading(false);
    }
}

// ---------- 抽屉导航：渲染六大分类（可折叠 + 嵌套子分组 + RBAC） ----------
const DG_ARROW = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>';
function renderDrawer() {
    const nav = document.getElementById('drawer-nav');
    if (!nav) return;
    let role = currentRole();
    // 自愈：旧会话缺 role 但后端标记过 isAdmin 时，按超管渲染
    if (role === 'user' && localStorage.getItem('lynli_admin_isadmin') === '1') role = 'super';

    const folds = _drawerFolds();
    const itemHtml = it => `
            <a class="drawer-item" data-page="${it.id}" href="javascript:void(0)" onclick="switchTab('${it.id}', this)">
              <span class="di-icon">${it.icon}</span>
              <span class="di-label">${it.label}</span>
            </a>`;

    let html = '';
    MENU_GROUPS.forEach((group, gi) => {
        const items = group.items.filter(it => !it.roles || it.roles.includes(role));
        const subs = (group.children || []).map(sub => ({
            ...sub,
            items: sub.items.filter(it => !it.roles || it.roles.includes(role)),
        })).filter(sub => sub.items.length);
        if (!items.length && !subs.length) return; // 整组无权限则隐藏
        const collapsed = folds["g" + gi] ? " collapsed" : "";
        html += `
        <div class="dgroup${collapsed}" data-g="${gi}">
          <a class="drawer-group-label dg-toggle" href="javascript:void(0)" onclick="toggleDrawerGroup(${gi})">
            <span class="dg-icon">${group.icon}</span><span class="dgt-label">${group.label}</span>
            <span class="dg-arrow">${DG_ARROW}</span>
          </a>
          <div class="dg-body">`;
        items.forEach(it => { html += itemHtml(it); });
        subs.forEach((sub, si) => {
            const scollapsed = folds["s" + gi + "-" + si] ? " collapsed" : "";
            html += `
            <div class="dsub${scollapsed}" data-g="${gi}-${si}">
              <a class="drawer-sub-label dg-toggle" href="javascript:void(0)" onclick="toggleDrawerSub(${gi}, ${si})">
                <span class="dg-icon">${sub.icon}</span><span class="dgt-label">${sub.label}</span>
                <span class="dg-arrow">${DG_ARROW}</span>
              </a>
              <div class="dg-body">`;
            sub.items.forEach(it => { html += itemHtml(it); });
            html += `</div>
            </div>`;
        });
        html += `</div>
        </div>`;
    });
    nav.innerHTML = html;

    // 抽屉头 + 顶栏：真实昵称 / 头像 / 角色（统一由 LynliUser 渲染，全站同步）
    if (window.LynliUser) {
        LynliUser.renderDrawerHead();
        LynliUser.renderTop();
    } else {
        const de = document.getElementById('drawer-email');
        if (de) de.innerText = localStorage.getItem('lynli_admin_email') || '--';
    }
}

// ---------- 抽屉开关 ----------
function toggleDrawer(force) {
  
    const drawer = document.getElementById('drawer');
    const mask = document.getElementById('drawer-mask');
    if (!drawer || !mask) return;
    const open = (typeof force === 'boolean') ? force : !drawer.classList.contains('open');
    drawer.classList.toggle('open', open);
    mask.classList.toggle('show', open);
}

// ---------- 平滑进入主控制台 ----------
function enterMainApp() {
    const loginPage = document.getElementById('login-page');
    const mainApp = document.getElementById('main-app');
    renderDrawer();
    document.body.classList.add('logged-in'); // AI 悬浮窗登录后可见
    loginPage.classList.add('page-leaving');
    setTimeout(() => {
        loginPage.style.display = 'none';
        loginPage.classList.remove('page-leaving');
        mainApp.style.display = 'block';
        mainApp.classList.add('page-entering');
        setTimeout(() => mainApp.classList.remove('page-entering'), 450);
        // 动态拉取个人中心 + 大盘真实数据
        if (typeof loadProfile === 'function') loadProfile();
        if (typeof fetchDashboardData === 'function') fetchDashboardData();
    }, 420);
}

// ---------- 子页面切换（抽屉导航） ----------
function switchTab(tab, el) {
    window.scrollTo(0, 0); // 切换页面瞬间回到顶部
    document.querySelectorAll('.drawer-item').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');
    else {
        const target = document.querySelector(`.drawer-item[data-page="${tab}"]`);
        if (target) target.classList.add('active');
    }
    document.querySelectorAll('.sub-page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page-' + tab);
    if (page) {
        page.classList.add('active');
        Array.from(page.children).forEach((child, i) => {
            child.style.setProperty('--d', i);
        });
    }
    // 顶栏标题
    const tp = document.getElementById('topbar-page');
    if (tp) tp.innerText = PAGE_TITLES[tab] || tab;
    // 选中后自动收起抽屉（避免遮挡内容区操作，如地图图层切换器）
    toggleDrawer(false);
    // 懒加载各业务页真实数据
    if (tab === 'map') {
        setTimeout(() => { if (typeof initNodeMap === 'function') initNodeMap(); }, 80);
    }
    if (tab === 'products' && typeof ShopAdmin !== 'undefined') ShopAdmin.load();
    if (tab === 'orders' && typeof ShopAdmin !== 'undefined') ShopAdmin.loadOrders();
    if (tab === 'tgx' && typeof loadAccountPool === 'function') loadAccountPool();
    if (tab === 'nodes' && typeof loadNodeCards === 'function') loadNodeCards();
    if (tab === 'monitor' && typeof loadMonitor === 'function') loadMonitor();
    if (tab === 'dns' && typeof loadDns === 'function') loadDns();
    if (tab === 'staff' && typeof loadStaff === 'function') loadStaff();
    if (tab === 'bots-matrix' && typeof BotMX !== 'undefined') BotMX.load();
    if (tab === 'profile' && typeof loadProfile === 'function') loadProfile();
    if (tab === 'dashboard' && typeof fetchDashboardData === 'function') fetchDashboardData();
    // 极客工具箱：真实交互页进入即加载默认数据（天气/汇率自动加载）
    if (tab.indexOf('geek-') === 0 && typeof Geek !== 'undefined') Geek.enter(tab);
    // 阶段三：业务占位页进入即真实探测后端空壳接口
    if (typeof loadBizPage === 'function' && BIZ_TABS.indexOf(tab) >= 0) {
        setTimeout(() => loadBizPage(tab), 60);
    }
    // 系统配置中枢：邮件/支付配置页进入即真实拉取后端配置（非假数据）
    if (tab === 'mail' && typeof MailCfg === 'object') MailCfg.load();
    if (tab === 'payment' && typeof PayCfg === 'object') PayCfg.load();
    // 运营四页：API 分发 / 服务器探针 / 工单 / 签到分销（进入即真实拉取）
    if (tab === 'apikeys' && typeof ApiKeys === 'object') ApiKeys.load();
    if (tab === 'probe' && typeof Probe === 'object') Probe.load();
    if (tab === 'tickets' && typeof Tickets === 'object') Tickets.load();
    if (tab === 'distribution' && typeof Distribution === 'object') Distribution.load();
    // 电商自动化五模块：进入即加载真实数据（ecom-pages.js）
    if (tab.indexOf('ecom-') === 0 && typeof Ecom === 'object') Ecom.enter(tab);
    // 晴天支付平台三页：进入即真实拉取（payplat.js，仅超管）
    if (tab === 'pay-dashboard' && typeof PayPlat === 'object') PayPlat.tab('dashboard');
    if (tab === 'pay-merchants' && typeof PayPlat === 'object') PayPlat.tab('merchants');
    if (tab === 'pay-withdrawals' && typeof PayPlat === 'object') PayPlat.tab('withdrawals');
}

// 阶段三业务占位页签（极客工具箱：进入时探测后端接口联调状态）
const BIZ_TABS = ['geek-ip', 'geek-speed', 'geek-forex', 'geek-qrcode'];

// ---------- 按钮涟漪微动效（事件委托） ----------
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn || btn.disabled || btn.classList.contains('is-loading')) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
});

// ---------- 工具 ----------
function fmtBytes(bytes) {
    if (!bytes || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0, n = Number(bytes);
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    return (i === 0 ? n.toFixed(0) : n.toFixed(1)) + ' ' + units[i];
}

function fmtTime(ts) {
    if (!ts) return '--';
    const d = new Date(Number(ts) * 1000);
    if (isNaN(d.getTime())) return '--';
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// KPI 数字滚动动画
function countUp(el, target, duration = 900) {
    if (!el) return;
    const to = Number(target) || 0;
    const t0 = performance.now();
    function frame(t) {
        const p = Math.min((t - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.innerText = Math.round(to * eased).toLocaleString();
        if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

// ---------- ECharts 动态加载（多 CDN 容灾 + 单源超时） ----------
const ECHARTS_CDNS = [
  "https://cdnjs.cloudflare.com/ajax/libs/echarts/5.5.0/echarts.min.js",
  "https://unpkg.com/echarts@5.5.0/dist/echarts.min.js",
  "https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js",
];
let _echartsLoading = null;
function _loadScriptWithTimeout(url, ms = 8000) {
  return new Promise((resolve) => {
    const s = document.createElement("script");
    const timer = setTimeout(() => { s.remove(); resolve(false); }, ms);
    s.onload = () => { clearTimeout(timer); resolve(true); };
    s.onerror = () => { clearTimeout(timer); s.remove(); resolve(false); };
    s.src = url;
    document.head.appendChild(s);
  });
}
function loadECharts() {
  if (window.echarts) return Promise.resolve();
  if (_echartsLoading) return _echartsLoading;
  _echartsLoading = (async () => {
    for (const url of ECHARTS_CDNS) {
      const ok = await _loadScriptWithTimeout(url);
      if (ok && window.echarts) return;
    }
  })();
  return _echartsLoading;
}

// ---------- 数据大盘（真实数据） ----------
async function fetchDashboardData() {
    const tok = localStorage.getItem('lynli_admin_token');
    const [nodesR, productsR, plansR, infoR, dashR] = await Promise.allSettled([
        fetch(`${API_BASE}/public/nodes`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/account/products`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/user/plan/fetch`).then(r => r.json()).catch(() => null),
        (async () => {
            if (!tok) return null;
            const r = await fetch(`${API_BASE}/user/info`, { headers: { 'Authorization': 'Bearer ' + tok } });
            return r.json().catch(() => null);
        })(),
        // 管理端大盘（MySQL 真实聚合 + 7 日趋势；无权限时静默降级）
        (async () => {
            if (!tok) return null;
            const r = await fetch(`${API_BASE}/admin/dashboard`, { headers: { 'Authorization': 'Bearer ' + tok } });
            return r.json().catch(() => null);
        })(),
    ]);

    const nodes = (nodesR.value && nodesR.value.code === 1) ? (nodesR.value.data || []) : [];
    const products = (productsR.value && productsR.value.code === 1) ? (productsR.value.data || []) : [];
    const plans = (plansR.value && Array.isArray(plansR.value.data)) ? plansR.value.data : [];
    const info = (infoR.value && infoR.value.data) ? infoR.value.data : {};
    const dash = (dashR.value && dashR.value.code === 1) ? (dashR.value.data || null) : null;

    // token 失效检测（单会话机制：旧 token 被新登录废止）→ 强制重登
    if (tok && infoR.value && _isAuthFail(infoR.value)) { _forceReLogin('登录状态已失效，请重新登录'); return; }

    const online = nodes.filter(n => n.status === 'online' || n.enabled === 1).length;

    // ---- KPI：管理端真实聚合优先，公开接口兜底 ----
    countUp(document.getElementById('dash-users'), dash ? dash.total_users : 0);
    document.getElementById('dash-users-foot').innerText = dash ? `今日新增 ${dash.today_new_users}` : '今日新增 --';
    countUp(document.getElementById('dash-paid'), dash ? dash.paid_users : 0);
    document.getElementById('dash-paid-foot').innerText =
        (dash && dash.total_users) ? `付费转化率 ${(dash.paid_users / dash.total_users * 100).toFixed(1)}%` : '付费转化率 --';
    countUp(document.getElementById('dash-orders'), dash ? dash.total_orders : 0);
    document.getElementById('dash-orders-foot').innerText = dash ? `今日 ${dash.today_orders} 单 · 已付 ${dash.paid_orders}` : '今日 -- 单';
    const inc = document.getElementById('dash-income');
    if (inc) inc.innerText = dash ? '¥' + Number(dash.today_income || 0).toFixed(2) : '--';
    document.getElementById('dash-income-foot').innerText = dash ? `累计 ¥${Number(dash.total_income || 0).toFixed(2)}` : '累计 ¥--';
    countUp(document.getElementById('dash-nodes'), dash ? dash.nodes_online : nodes.length);
    document.getElementById('dash-nodes-foot').innerText = dash ? `共 ${dash.nodes_total} 个节点 · ${online || dash.nodes_online} 在线` : `${online} 个在线`;
    countUp(document.getElementById('dash-products'), dash ? dash.total_products : products.length);
    document.getElementById('dash-products-foot').innerText = dash ? `有货 ${dash.products_in_stock} 件` : '账号库实时库存';
    countUp(document.getElementById('dash-plans'), dash ? dash.total_plans : plans.length);
    const traffic = document.getElementById('dash-traffic');
    if (traffic) traffic.innerText = fmtBytes(info.transferEnable);

    // 副标题：问候 + 角色
    const sub = document.getElementById('dash-subtitle');
    if (sub) {
        const h = new Date().getHours();
        const hello = h < 6 ? '夜深了' : h < 12 ? '上午好' : h < 18 ? '下午好' : '晚上好';
        sub.innerText = `${hello}，${roleLabel()} · 实时核心指标 · 自动刷新`;
    }

    // ---- 图表（ECharts 失败时静默降级，不影响 KPI） ----
    try {
        await loadECharts();
        if (!window.echarts) return;
        if (dash && Array.isArray(dash.trend_days) && dash.trend_days.length) {
            renderTrendChart(dash.trend_days, dash.trend_income);   // 近 7 日营收（折线）
            renderBarChart(dash.trend_days, dash.trend_users);      // 近 7 日新增用户（柱状）
        } else {
            renderPlanChart(plans);
            renderStockChart(products);
        }
    } catch (e) { /* 图表降级 */ }

    // ---- 工作台首屏：全域可视化地图 ----
    try {
        if (typeof initDashMap === 'function') initDashMap();
    } catch (e) { /* 地图降级 */ }
}

// ---------- 折线图：近 7 日营收趋势（真实聚合） ----------
function renderTrendChart(days, income) {
    const box = document.getElementById('chart-trend');
    if (!box || !window.echarts) return;
    let chart = echarts.getInstanceByDom(box);
    if (!chart) chart = echarts.init(box);

    const badge = document.getElementById('chart-trend-badge');
    if (badge) badge.innerText = '近 7 日营收';

    chart.setOption({
        grid: { left: 52, right: 18, top: 26, bottom: 36 },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(13,17,38,.92)', borderWidth: 0,
            textStyle: { color: '#eef1fa', fontSize: 12 },
            valueFormatter: v => '¥' + Number(v || 0).toFixed(2)
        },
        xAxis: {
            type: 'category', data: days, boundaryGap: false,
            axisLine: { lineStyle: { color: 'rgba(255,255,255,.14)' } },
            axisTick: { show: false },
            axisLabel: { color: '#8b93b8', fontSize: 11 }
        },
        yAxis: {
            type: 'value', name: '营收 (¥)',
            nameTextStyle: { color: '#8b93b8', fontSize: 11 },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,.07)' } },
            axisLabel: { color: '#8b93b8', fontSize: 11 }
        },
        series: [{
            name: '营收', type: 'line', data: income, smooth: true,
            symbol: 'circle', symbolSize: 8,
            lineStyle: { width: 3, color: '#5b8cff' },
            itemStyle: { color: '#5b8cff', borderColor: '#fff', borderWidth: 2 },
            areaStyle: {
                color: {
                    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [{ offset: 0, color: 'rgba(91,140,255,.3)' }, { offset: 1, color: 'rgba(91,140,255,.02)' }]
                }
            },
            animationDuration: 900, animationEasing: 'cubicOut'
        }]
    }, true);
    setTimeout(() => chart.resize(), 60);
}

// ---------- 柱状图：近 7 日新增用户（真实聚合） ----------
function renderBarChart(days, users) {
    const box = document.getElementById('chart-bar');
    if (!box || !window.echarts) return;
    let chart = echarts.getInstanceByDom(box);
    if (!chart) chart = echarts.init(box);

    const badge = document.getElementById('chart-bar-badge');
    if (badge) badge.innerText = '近 7 日新增';

    chart.setOption({
        grid: { left: 40, right: 14, top: 26, bottom: 36 },
        tooltip: {
            trigger: 'axis', axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(13,17,38,.92)', borderWidth: 0,
            textStyle: { color: '#eef1fa', fontSize: 12 }
        },
        xAxis: {
            type: 'category', data: days,
            axisLine: { lineStyle: { color: 'rgba(255,255,255,.14)' } },
            axisTick: { show: false },
            axisLabel: { color: '#8b93b8', fontSize: 10, interval: 0, rotate: 30 }
        },
        yAxis: {
            type: 'value', name: '人',
            nameTextStyle: { color: '#8b93b8', fontSize: 11 },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,.07)' } },
            axisLabel: { color: '#8b93b8', fontSize: 11 }
        },
        series: [{
            name: '新增用户', type: 'bar', data: users, barMaxWidth: 26,
            itemStyle: {
                borderRadius: [6, 6, 0, 0],
                color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#7c6cff' }, { offset: 1, color: '#5b8cff' }] }
            },
            emphasis: { itemStyle: { color: '#5b8cff' } },
            animationDelay: idx => idx * 90,
            animationDuration: 700
        }]
    }, true);
    setTimeout(() => chart.resize(), 60);
}

// ---------- 降级图表：套餐流量额度分布 ----------
function renderPlanChart(plans) {
    const box = document.getElementById('chart-trend');
    if (!box || !window.echarts) return;
    let chart = echarts.getInstanceByDom(box);
    if (!chart) chart = echarts.init(box);
    const badge = document.getElementById('chart-trend-badge');
    if (badge) badge.innerText = '套餐流量额度';

    const names = plans.map(p => p.name || '套餐');
    const data = plans.map(p => {
        const b = Number(p.transfer_enable || p.traffic || 0);
        return b > 1e9 ? +(b / 1073741824).toFixed(0) : +(b / 1048576).toFixed(0);
    });
    chart.setOption({
        grid: { left: 46, right: 18, top: 26, bottom: 36 },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(13,17,38,.92)', borderWidth: 0,
            textStyle: { color: '#eef1fa', fontSize: 12 },
            valueFormatter: v => v + ' GB'
        },
        xAxis: {
            type: 'category', data: names, boundaryGap: false,
            axisLine: { lineStyle: { color: 'rgba(255,255,255,.14)' } },
            axisTick: { show: false },
            axisLabel: { color: '#8b93b8', fontSize: 11, interval: 0, rotate: names.length > 5 ? 30 : 0 }
        },
        yAxis: {
            type: 'value', name: 'GB',
            nameTextStyle: { color: '#8b93b8', fontSize: 11 },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,.07)' } },
            axisLabel: { color: '#8b93b8', fontSize: 11 }
        },
        series: [{
            name: '流量额度', type: 'line', data, smooth: true,
            symbol: 'circle', symbolSize: 8,
            lineStyle: { width: 3, color: '#5b8cff' },
            itemStyle: { color: '#5b8cff', borderColor: '#fff', borderWidth: 2 },
            areaStyle: {
                color: {
                    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [{ offset: 0, color: 'rgba(91,140,255,.3)' }, { offset: 1, color: 'rgba(91,140,255,.02)' }]
                }
            },
            animationDuration: 900, animationEasing: 'cubicOut'
        }]
    }, true);
    setTimeout(() => chart.resize(), 60);
}

// ---------- 降级图表：商品库存分布 ----------
function renderStockChart(products) {
    const box = document.getElementById('chart-bar');
    if (!box || !window.echarts) return;
    let chart = echarts.getInstanceByDom(box);
    if (!chart) chart = echarts.init(box);
    const badge = document.getElementById('chart-bar-badge');
    if (badge) badge.innerText = '商品库存';

    const names = products.map(p => (p.title || '商品').slice(0, 6));
    const data = products.map(p => Number(p.stock || 0));
    chart.setOption({
        grid: { left: 40, right: 14, top: 26, bottom: 36 },
        tooltip: {
            trigger: 'axis', axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(13,17,38,.92)', borderWidth: 0,
            textStyle: { color: '#eef1fa', fontSize: 12 }
        },
        xAxis: {
            type: 'category', data: names,
            axisLine: { lineStyle: { color: 'rgba(255,255,255,.14)' } },
            axisTick: { show: false },
            axisLabel: { color: '#8b93b8', fontSize: 10, interval: 0, rotate: names.length > 4 ? 28 : 0 }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: 'rgba(255,255,255,.07)' } },
            axisLabel: { color: '#8b93b8', fontSize: 11 }
        },
        series: [{
            name: '库存', type: 'bar', data, barMaxWidth: 26,
            itemStyle: {
                borderRadius: [6, 6, 0, 0],
                color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#7c6cff' }, { offset: 1, color: '#5b8cff' }] }
            },
            emphasis: { itemStyle: { color: '#5b8cff' } },
            animationDelay: idx => idx * 90,
            animationDuration: 700
        }]
    }, true);
    setTimeout(() => chart.resize(), 60);
}

// ---------- TGX 业务 · TGX 账号库：真实库存表格 ----------
async function loadAccountPool() {
    const tbody = document.querySelector('#tgx-pool-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="empty-tip">加载中...</td></tr>';
    try {
        const res = await fetch(`${API_BASE}/account/products`);
        const json = await res.json();
        const list = (json.code === 1 && json.data) ? json.data : [];
        if (!list.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-tip">账号库暂无库存</td></tr>';
            return;
        }
        tbody.innerHTML = list.map(p => {
            const inStock = Number(p.stock) > 0;
            const type = /TG|电报|飞机/.test(p.title || '') ? 'TG 账号' : (/节点|套餐|订阅/.test(p.title || '') ? '节点订阅' : '账号商品');
            return `
            <tr>
              <td>${escapeHtml(p.title || '未命名')}</td>
              <td><span class="tag-live">${type}</span></td>
              <td class="text-primary" style="font-weight:700">¥${Number(p.price || 0).toFixed(2)}</td>
              <td>${Number(p.stock || 0)}</td>
              <td>${inStock ? '<span class="tag-live">有货</span>' : '<span class="tag-off">缺货</span>'}</td>
            </tr>`;
        }).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-tip">加载失败，请重试</td></tr>';
        showToast('账号库加载失败', 'error');
    }
}

// ---------- TGX 业务 · 节点与订阅：真实节点卡片 ----------
async function loadNodeCards() {
    const grid = document.getElementById('node-card-list');
    if (!grid) return;
    grid.innerHTML = '<div class="empty-tip">加载中...</div>';
    try {
        const res = await fetch(`${API_BASE}/public/nodes`);
        const json = await res.json();
        const nodes = (json.code === 1 && json.data) ? json.data : [];
        if (!nodes.length) {
            grid.innerHTML = '<div class="empty-tip">暂无节点数据</div>';
            return;
        }
        grid.innerHTML = nodes.map((n, i) => {
            const live = n.status === 'online';
            return `
            <div class="product-card" style="--d:${i}">
              <div class="pc-head">
                <div class="pc-title">${escapeHtml(n.name || '未命名节点')}</div>
                <span class="stock-light ${live ? 'live' : 'out'}"><i></i>${live ? '在线' : '离线'}</span>
              </div>
              <p class="pc-desc">${escapeHtml(n.region_name || n.region || '--')} · ${escapeHtml(n.ip || '--')}</p>
              <div class="pc-foot">
                <span style="font-size:12px; color:var(--text-tertiary)">${escapeHtml(n.domain || '暂无域名')}</span>
                <button class="btn btn-primary btn-sm" onclick="switchTab('map')">地图查看</button>
              </div>
            </div>`;
        }).join('');
    } catch (e) {
        grid.innerHTML = '<div class="empty-tip">加载失败，请重试</div>';
        showToast('节点列表加载失败', 'error');
    }
}

// ---------- 网络基建 · 节点监控：真实状态表 ----------
async function loadMonitor() {
    const tbody = document.querySelector('#monitor-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="empty-tip">加载中...</td></tr>';
    try {
        const res = await fetch(`${API_BASE}/public/nodes`);
        const json = await res.json();
        const nodes = (json.code === 1 && json.data) ? json.data : [];
        if (!nodes.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-tip">暂无节点数据</td></tr>';
            return;
        }
        tbody.innerHTML = nodes.map(n => {
            const live = n.status === 'online';
            return `
            <tr>
              <td style="font-weight:600">${escapeHtml(n.name || '--')}</td>
              <td>${escapeHtml(n.ip || '--')}</td>
              <td>${escapeHtml(n.region_name || n.region || '--')}</td>
              <td>${live ? '<span class="tag-live">在线</span>' : '<span class="tag-off">离线</span>'}</td>
              <td style="color:var(--text-tertiary)">${Number(n.lat || 0).toFixed(2)}, ${Number(n.lng || 0).toFixed(2)}</td>
            </tr>`;
        }).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-tip">加载失败，请重试</td></tr>';
        showToast('节点监控加载失败', 'error');
    }
}

// ---------- 网络基建 · 域名管理：真实解析表 ----------
async function loadDns() {
    const tbody = document.querySelector('#dns-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" class="empty-tip">加载中...</td></tr>';
    try {
        const res = await fetch(`${API_BASE}/public/nodes`);
        const json = await res.json();
        const nodes = (json.code === 1 && json.data) ? json.data : [];
        const withDomain = nodes.filter(n => n.domain);
        if (!withDomain.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-tip">暂无已解析域名</td></tr>';
            return;
        }
        tbody.innerHTML = withDomain.map(n => `
            <tr>
              <td style="font-weight:600">${escapeHtml(n.domain)}</td>
              <td>${escapeHtml(n.ip || '--')}</td>
              <td>${escapeHtml(n.region_name || n.region || '--')}</td>
              <td><span class="tag-warn">节点接入</span></td>
            </tr>`).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-tip">加载失败，请重试</td></tr>';
        showToast('域名列表加载失败', 'error');
    }
}

// ---------- 系统设置 · 员工账号权限分配：真实成员表 ----------
async function loadStaff() {
    const tbody = document.querySelector('#staff-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="empty-tip">加载中...</td></tr>';
    const tok = localStorage.getItem('lynli_admin_token');
    const me = (localStorage.getItem('lynli_admin_email') || '').toLowerCase();
    if (!tok) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-tip">未登录，无法加载成员列表</td></tr>';
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/admin/users`, { headers: { 'Authorization': 'Bearer ' + tok } });
        const json = await res.json();
        const users = (json.code === 1 && json.data) ? json.data : [];
        if (!users.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-tip">暂无成员数据</td></tr>';
            return;
        }
        tbody.innerHTML = users.map(u => {
            const isMe = (u.email || '').toLowerCase() === me;
            const used = Number(u.u || 0) + Number(u.d || 0);
            const perm = isMe ? '<span class="tag-warn">超级管理员</span>' : '<span class="tag-off">普通用户</span>';
            const banned = Number(u.banned) === 1;
            const state = banned ? '<span class="tag-off">已封禁</span>' : '<span class="tag-live">正常</span>';
            const expire = u.expired_at ? fmtTime(u.expired_at) : '永久有效';
            return `
            <tr>
              <td style="color:var(--text-tertiary)">${u.id}</td>
              <td style="font-weight:600">${escapeHtml(u.email || '--')}${isMe ? ' <span style="color:var(--gold);font-size:11px">(当前账号)</span>' : ''}</td>
              <td>${perm}</td>
              <td>${fmtBytes(used)}</td>
              <td style="color:var(--text-tertiary)">${expire}</td>
              <td>${state}</td>
            </tr>`;
        }).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-tip">加载失败，请重试</td></tr>';
        showToast('成员列表加载失败', 'error');
    }
}

// ---------- 个人中心：动态拉取真实用户数据（唯一来源 /user/info） ----------
async function loadProfile() {
    const u = window.getUserInfo ? getUserInfo() : { email: '--', role: 'user', nickname: '', avatar: '' };
    const role = currentRole();

    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    const roleEl = document.getElementById('profile-role');
    const avEl = document.getElementById('profile-avatar');
    // 昵称优先，无昵称且为管理员显示「老板」，否则邮箱前缀（与顶栏/抽屉完全一致，绝不暴露长邮箱）
    const showName = window.LynliUser ? LynliUser.displayName(u) : ((u.nickname && u.nickname.trim()) || (u.email || '用户').split('@')[0]);
    if (nameEl) nameEl.innerText = showName;
    if (emailEl) emailEl.innerText = u.email || '--';
    if (roleEl) roleEl.innerHTML = `<span class="role-badge ${roleBadgeClass(role)}">${roleLabel(role)}</span>`;
    if (avEl) {
        if (u.avatar) {
            avEl.innerHTML = `<img src="${u.avatar}" alt="avatar" referrerpolicy="no-referrer"
                onerror="this.onerror=null;this.parentNode.innerHTML='<span class=\\'avatar-fallback\\'>${(showName[0] || 'U').toUpperCase()}</span>'">`;
        } else {
            avEl.innerHTML = `<span class="avatar-fallback">${(showName[0] || 'U').toUpperCase()}</span>`;
        }
        avEl.title = '点击更换头像';
    }

    const tok = localStorage.getItem('lynli_admin_token');
    if (!tok) return;
    try {
        const res = await fetch(`${API_BASE}/user/info`, { headers: { 'Authorization': 'Bearer ' + tok } });
        const json = await res.json();
        const d = (json && json.data) ? json.data : null;
        if (!d) {
            // token 失效（单会话机制下旧 token 会被新登录废止）→ 强制重登
            if (_isAuthFail(json)) { _forceReLogin('登录状态已失效，请重新登录'); return; }
            showToast('用户信息拉取失败', 'warn');
            return;
        }
        // 回写真实字段到全局缓存（顶栏/抽屉/子站同步）
        if (window.LynliUser) {
            LynliUser.patch({
                email: d.email || '', short_id: String(d.shortId ?? d.short_id ?? '') || '',
                nickname: d.nickname || '', avatar: d.avatarURL || d.avatar || '',
            });
        }
        if (emailEl) emailEl.innerText = d.email || u.email;
        if (nameEl && d.nickname) nameEl.innerText = d.nickname;
        if (avEl && d.avatarURL) {
            avEl.innerHTML = `<img src="${d.avatarURL}" alt="avatar" referrerpolicy="no-referrer"
                onerror="this.onerror=null;this.parentNode.innerHTML='<span class=\\'avatar-fallback\\'>${((d.nickname || showName)[0] || 'U').toUpperCase()}</span>'">`;
        }
        const t = document.getElementById('profile-traffic');
        if (t) t.innerText = fmtBytes(d.transferEnable ?? d.transfer_enable);
        const ex = document.getElementById('profile-expire');
        if (ex) ex.innerText = (d.expiredAt ?? d.expired_at) ? fmtTime(d.expiredAt ?? d.expired_at) : '永久有效';
        const cr = document.getElementById('profile-created');
        if (cr) cr.innerText = (d.createdAt ?? d.created_at) ? fmtTime(d.createdAt ?? d.created_at) : '--';
        const ll = document.getElementById('profile-lastlogin');
        if (ll) ll.innerText = (d.lastLoginAt ?? d.last_login_at) ? fmtTime(d.lastLoginAt ?? d.last_login_at) : '--';
        const sid = document.getElementById('profile-shortid');
        if (sid) sid.innerText = (d.shortId ?? d.short_id) ? '#' + (d.shortId ?? d.short_id) : '未设置';
        const bal = document.getElementById('profile-balance');
        if (bal) bal.innerText = '¥' + Number(d.balance || 0).toFixed(2);
    } catch (e) {
        showToast('用户信息拉取失败', 'warn');
    }
}

// ---------- 退出 ----------
function doLogout() {
    if (window.LynliUser) LynliUser.clear();
    else {
        localStorage.removeItem('lynli_admin');
        localStorage.removeItem('lynli_admin_token');
        localStorage.removeItem('lynli_admin_email');
        localStorage.removeItem('lynli_admin_role');
    }
    document.body.classList.remove('logged-in');
    location.reload();
}

// ---------- 回车提交登录 ----------
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const lp = document.getElementById('login-page');
        if (lp && lp.style.display !== 'none' && !document.getElementById('btn-login')?.disabled) {
            doLogin();
        }
    }
    // Esc 关闭抽屉 / AI 窗
    if (e.key === 'Escape') {
        if (document.getElementById('drawer')?.classList.contains('open')) toggleDrawer(false);
        if (typeof toggleAiChat === 'function' && document.getElementById('ai-window')?.classList.contains('open')) toggleAiChat(false);
    }
});

// ---------- 大盘 KPI 卡片：点击跳转对应业务页（任务3：让卡片活起来） ----------
// 总用户数/付费用户 → 用户列表(staff)；总订单/今日营收 → 订单记录(orders)；
// 全球节点 → 节点管理(nodes)；在售商品 → TGX账号库(tgx)
(function bindKpiCards() {
    document.querySelectorAll('.stat-card[data-goto]').forEach(card => {
        card.setAttribute('role', 'button');
        card.tabIndex = 0;
        const go = () => switchTab(card.getAttribute('data-goto'));
        card.addEventListener('click', go);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
        });
    });
})();

window.onload = async function () {
    drawCaptcha();
    if (localStorage.getItem('lynli_admin') === 'true') {
        const tok = localStorage.getItem('lynli_admin_token');
        if (!tok) { _forceReLogin('登录状态异常，请重新登录'); return; }
        // 会话探活：token 失效则强制重登；role 缺失则自动探测管理权限自愈
        const st = await _probeSession(tok);
        if (st === 'auth_fail') { _forceReLogin('登录状态已过期，请重新登录'); return; }
        if (st === 'net_error') {
            // 网络异常：不踢出，按已有信息降级进入（个人中心会再次提示）
            if (!localStorage.getItem('lynli_admin_role')) localStorage.setItem('lynli_admin_role', 'user');
        }
        // 全局用户信息同步：以 /user/info 为唯一真实来源刷新缓存并广播全站
        if (window.LynliUser) { LynliUser.renderAll(); LynliUser.refresh(true); }
        renderDrawer();
        document.body.classList.add('logged-in'); // AI 悬浮窗登录后可见
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        if (typeof loadProfile === 'function') loadProfile();
        if (typeof fetchDashboardData === 'function') fetchDashboardData();
        if (typeof initDashMap === 'function') setTimeout(initDashMap, 200);
    }
};


// ===== 全局图片懒加载与骨架屏处理 =====
document.addEventListener('DOMContentLoaded', () => {
  const addLazyLoad = () => {
    document.querySelectorAll('img:not([loading])').forEach(img => {
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      img.classList.add('img-skeleton');
      img.addEventListener('load', () => img.classList.remove('img-skeleton'));
      img.addEventListener('error', () => img.classList.remove('img-skeleton'));
    });
  };
  
  addLazyLoad();
  
  // 劫持 DOM 变化，任何新插入的图片自动懒加载
  const observer = new MutationObserver((mutations) => {
    let hasNewImg = false;
    mutations.forEach(m => {
      if (m.addedNodes.length) {
        m.addedNodes.forEach(n => {
          if (n.nodeName === 'IMG' || (n.querySelectorAll && n.querySelectorAll('img').length)) {
            hasNewImg = true;
          }
        });
      }
    });
    if (hasNewImg) setTimeout(addLazyLoad, 50);
  });
  observer.observe(document.body, { childList: true, subtree: true });
});
