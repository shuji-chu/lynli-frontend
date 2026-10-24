// ============================================================
// SOCKS5 管理中枢 · 大中台版核心逻辑
// - 抽屉式导航 + 应用中心（六组菜单，RBAC 按角色显隐）
// - 登录路由: /api/v1/passport/auth/login（返回 token + role）
// - 大盘: /api/v1/admin/dashboard（MySQL 真实聚合 + 7 日趋势）
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

// ---------- 菜单图标（SVG） ----------
const ICONS = {
  grid: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  logs: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h9l4 4v14a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M14 3v5h5"/><path d="M9 12h7M9 16h7"/></svg>',
  box: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>',
  receipt: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21V3z"/><path d="M9 8h6M9 12h6"/></svg>',
  truck: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 4h13v12H1z"/><path d="M14 9h4l3 3v4h-7"/><circle cx="6" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/></svg>',
  layers: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 17l9 5 9-5"/></svg>',
  sms: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 10h8M8 14h5"/></svg>',
  globe: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 2.6 4 5.6 4 9s-1.2 6.4-4 9c-2.8-2.6-4-5.6-4-9s1.2-6.4 4-9z"/></svg>',
  activity: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 8-6-16-3 8H2"/></svg>',
  dns: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="3.5"/></svg>',
  robot: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 7V4M9 4h6"/><circle cx="9" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1" fill="currentColor" stroke="none"/></svg>',
  ticket: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 8V6a1 1 0 011-1h16a1 1 0 011 1v2a3 3 0 000 6v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2a3 3 0 000-6z"/><path d="M12 6v12" stroke-dasharray="2 2"/></svg>',
  bot: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="7" y="7" width="10" height="12" rx="2.5"/><path d="M12 7V4M9 19h6"/><circle cx="10" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="14" cy="12" r="1" fill="currentColor" stroke="none"/></svg>',
  user: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>',
  users: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3.1-5 7-5s7 1.5 7 5"/><circle cx="17" cy="9" r="2.8"/><path d="M16 15.5c2.8.3 5 1.6 5 4.5"/></svg>',
  shield: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3z"/><path d="M9 12l2 2 4-4"/></svg>',
  gear: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
};

// ---------- 应用中心菜单（六组；roles 为空 = 全员可见） ----------
const MENU_GROUPS = [
  { label: "📊 工作台", items: [
    { id: "dashboard", label: "数据大盘", icon: ICONS.grid },
    { id: "logs", label: "运行日志", icon: ICONS.logs, roles: ["super", "operator"] },
  ]},
  { label: "🛒 电商系统", items: [
    { id: "products", label: "商品管理", icon: ICONS.box, roles: ["super", "operator"] },
    { id: "orders", label: "订单管理", icon: ICONS.receipt, roles: ["super", "operator"] },
    { id: "logistics", label: "物流跟踪", icon: ICONS.truck, roles: ["super", "operator"] },
  ]},
  { label: "📦 发卡系统", items: [
    { id: "tgx", label: "TGX 号池", icon: ICONS.layers, roles: ["super", "operator"] },
    { id: "sms", label: "接码平台", icon: ICONS.sms, roles: ["super", "operator"] },
  ]},
  { label: "🌐 网络基建", items: [
    { id: "nodes", label: "节点管理", icon: ICONS.globe },
    { id: "probe", label: "服务器探针", icon: ICONS.activity, roles: ["super", "operator"] },
    { id: "dns", label: "域名解析", icon: ICONS.dns, roles: ["super", "operator"] },
  ]},
  { label: "🤖 客服与营销", items: [
    { id: "ai", label: "AI 对话", icon: ICONS.robot },
    { id: "tickets", label: "工单系统", icon: ICONS.ticket, roles: ["super", "operator", "support"] },
    { id: "bots", label: "机器人控制", icon: ICONS.bot, roles: ["super", "operator"] },
  ]},
  { label: "⚙️ 系统与权限", items: [
    { id: "profile", label: "个人中心", icon: ICONS.user },
    { id: "staff", label: "员工账号", icon: ICONS.users, roles: ["super"] },
    { id: "roles", label: "角色分配", icon: ICONS.shield, roles: ["super"] },
    { id: "settings", label: "系统设置", icon: ICONS.gear, roles: ["super"] },
  ]},
];
// 页面标题映射（顶栏显示）
const PAGE_TITLES = {
  dashboard: "数据大盘", logs: "运行日志", products: "商品管理", orders: "订单管理",
  logistics: "物流跟踪", tgx: "TGX 号池", sms: "接码平台", nodes: "节点管理",
  probe: "服务器探针", dns: "域名解析", ai: "AI 对话", tickets: "工单系统",
  bots: "机器人控制", profile: "个人中心", staff: "员工账号", roles: "角色分配",
  settings: "系统设置",
};

// ---------- Toast 提示（统一走这里，不再使用原生 alert） ----------
function showToast(msg, icon = 'ℹ️') {
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
    iconEl.innerText = icon;
    textEl.innerText = msg;
    toast.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ---------- 传统 4 位字符验证码（canvas 本地生成，点击刷新） ----------
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

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#eef4ff');
    bg.addColorStop(1, '#dbe7ff');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 60; i++) {
        ctx.fillStyle = `rgba(${_randInt(100, 180)},${_randInt(130, 200)},255,${Math.random() * 0.5 + 0.2})`;
        ctx.fillRect(_randInt(0, W), _randInt(0, H), 2, 2);
    }
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, _randInt(0, H));
        ctx.bezierCurveTo(W * 0.3, _randInt(0, H), W * 0.6, _randInt(0, H), W, _randInt(0, H));
        ctx.strokeStyle = `rgba(${_randInt(60, 120)},${_randInt(100, 160)},235,0.45)`;
        ctx.lineWidth = _randInt(1, 2);
        ctx.stroke();
    }

    const blues = ['#1d4ed8', '#2563eb', '#1e40af', '#3b82f6'];
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
        ctx.fillStyle = blues[_randInt(0, blues.length - 1)];
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

    if (!account || !password) { showToast('账号或密码没填', '⚠️'); return; }
    if (!checkCaptcha()) {
        showToast('验证码错误，请重新输入', '🔐');
        refreshCaptcha();
        return;
    }

    setLoginLoading(true);
    showToast('正在连接后端...', '⏳');

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
            localStorage.setItem('lynli_admin_token', json.data.token);
            localStorage.setItem('lynli_admin_email', account);
            localStorage.setItem('lynli_admin_role', json.data.role || 'user');
            if (document.getElementById('remember-me')?.checked) {
                localStorage.setItem('lynli_admin', 'true');
            }
            showToast('登录成功', '👋');
            setLoginLoading(false);
            enterMainApp();
        } else {
            showToast(json.message || '账号或密码错误', '❌');
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
        showToast(`登录失败: ${errMsg}`, '📡');
        refreshCaptcha();
        setLoginLoading(false);
    }
}

// ---------- 抽屉导航：渲染应用中心（RBAC） ----------
function renderDrawer() {
    const nav = document.getElementById('drawer-nav');
    if (!nav) return;
    const role = currentRole();
    const email = localStorage.getItem('lynli_admin_email') || '--';

    let html = '';
    MENU_GROUPS.forEach(group => {
        const items = group.items.filter(it => !it.roles || it.roles.includes(role));
        if (!items.length) return; // 整组无权限则隐藏
        html += `<div class="drawer-group-label">${group.label}</div>`;
        items.forEach(it => {
            html += `
            <a class="drawer-item" data-page="${it.id}" href="javascript:void(0)" onclick="switchTab('${it.id}', this)">
              <span class="di-icon">${it.icon}</span>
              <span class="di-label">${it.label}</span>
            </a>`;
        });
    });
    nav.innerHTML = html;

    // 抽屉头 + 顶栏：账号与角色
    const de = document.getElementById('drawer-email');
    if (de) de.innerText = email;
    const dr = document.getElementById('drawer-role');
    if (dr) { dr.innerText = roleLabel(role); dr.className = 'role-badge ' + roleBadgeClass(role); }
    const tu = document.getElementById('topbar-user');
    if (tu) tu.innerText = email;
    const tr = document.getElementById('topbar-role');
    if (tr) { tr.innerText = roleLabel(role); tr.className = 'role-badge ' + roleBadgeClass(role); }
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
    document.querySelectorAll('.drawer-item').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');
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
    // 小屏：选完自动收起抽屉
    if (window.innerWidth <= 768) toggleDrawer(false);
    // 懒加载
    if (tab === 'nodes') {
        setTimeout(() => { if (typeof initNodeMap === 'function') initNodeMap(); }, 80);
    }
    if (tab === 'products' && typeof loadAccounts === 'function') loadAccounts();
    if (tab === 'profile' && typeof loadProfile === 'function') loadProfile();
    if (tab === 'dashboard' && typeof fetchDashboardData === 'function') fetchDashboardData();
}

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
            backgroundColor: 'rgba(17,24,39,.92)', borderWidth: 0,
            textStyle: { color: '#fff', fontSize: 12 },
            valueFormatter: v => '¥' + Number(v || 0).toFixed(2)
        },
        xAxis: {
            type: 'category', data: days, boundaryGap: false,
            axisLine: { lineStyle: { color: '#e5e7eb' } },
            axisTick: { show: false },
            axisLabel: { color: '#6b7280', fontSize: 11 }
        },
        yAxis: {
            type: 'value', name: '营收 (¥)',
            nameTextStyle: { color: '#9ca3af', fontSize: 11 },
            splitLine: { lineStyle: { color: '#f1f5f9' } },
            axisLabel: { color: '#9ca3af', fontSize: 11 }
        },
        series: [{
            name: '营收', type: 'line', data: income, smooth: true,
            symbol: 'circle', symbolSize: 8,
            lineStyle: { width: 3, color: '#2563eb' },
            itemStyle: { color: '#2563eb', borderColor: '#fff', borderWidth: 2 },
            areaStyle: {
                color: {
                    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [{ offset: 0, color: 'rgba(37,99,235,.28)' }, { offset: 1, color: 'rgba(37,99,235,.02)' }]
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
            backgroundColor: 'rgba(17,24,39,.92)', borderWidth: 0,
            textStyle: { color: '#fff', fontSize: 12 }
        },
        xAxis: {
            type: 'category', data: days,
            axisLine: { lineStyle: { color: '#e5e7eb' } },
            axisTick: { show: false },
            axisLabel: { color: '#6b7280', fontSize: 10, interval: 0, rotate: 30 }
        },
        yAxis: {
            type: 'value', name: '人',
            nameTextStyle: { color: '#9ca3af', fontSize: 11 },
            splitLine: { lineStyle: { color: '#f1f5f9' } },
            axisLabel: { color: '#9ca3af', fontSize: 11 }
        },
        series: [{
            name: '新增用户', type: 'bar', data: users, barMaxWidth: 26,
            itemStyle: {
                borderRadius: [6, 6, 0, 0],
                color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#93c5fd' }] }
            },
            emphasis: { itemStyle: { color: '#2563eb' } },
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
            backgroundColor: 'rgba(17,24,39,.92)', borderWidth: 0,
            textStyle: { color: '#fff', fontSize: 12 },
            valueFormatter: v => v + ' GB'
        },
        xAxis: {
            type: 'category', data: names, boundaryGap: false,
            axisLine: { lineStyle: { color: '#e5e7eb' } },
            axisTick: { show: false },
            axisLabel: { color: '#6b7280', fontSize: 11, interval: 0, rotate: names.length > 5 ? 30 : 0 }
        },
        yAxis: {
            type: 'value', name: 'GB',
            nameTextStyle: { color: '#9ca3af', fontSize: 11 },
            splitLine: { lineStyle: { color: '#f1f5f9' } },
            axisLabel: { color: '#9ca3af', fontSize: 11 }
        },
        series: [{
            name: '流量额度', type: 'line', data, smooth: true,
            symbol: 'circle', symbolSize: 8,
            lineStyle: { width: 3, color: '#2563eb' },
            itemStyle: { color: '#2563eb', borderColor: '#fff', borderWidth: 2 },
            areaStyle: {
                color: {
                    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [{ offset: 0, color: 'rgba(37,99,235,.28)' }, { offset: 1, color: 'rgba(37,99,235,.02)' }]
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
            backgroundColor: 'rgba(17,24,39,.92)', borderWidth: 0,
            textStyle: { color: '#fff', fontSize: 12 }
        },
        xAxis: {
            type: 'category', data: names,
            axisLine: { lineStyle: { color: '#e5e7eb' } },
            axisTick: { show: false },
            axisLabel: { color: '#6b7280', fontSize: 10, interval: 0, rotate: names.length > 4 ? 28 : 0 }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: '#f1f5f9' } },
            axisLabel: { color: '#9ca3af', fontSize: 11 }
        },
        series: [{
            name: '库存', type: 'bar', data, barMaxWidth: 26,
            itemStyle: {
                borderRadius: [6, 6, 0, 0],
                color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#93c5fd' }] }
            },
            emphasis: { itemStyle: { color: '#2563eb' } },
            animationDelay: idx => idx * 90,
            animationDuration: 700
        }]
    }, true);
    setTimeout(() => chart.resize(), 60);
}

// ---------- 商品管理：卡片式列表 + 状态指示灯 ----------
async function loadAccounts() {
    const grid = document.getElementById('account-list');
    if (!grid) return;
    grid.innerHTML = '<div class="empty-tip">加载中...</div>';
    try {
        const res = await fetch(`${API_BASE}/account/products`);
        const json = await res.json();
        const list = (json.code === 1 && json.data) ? json.data : [];
        if (!list.length) {
            grid.innerHTML = '<div class="empty-tip">暂无在售商品</div>';
            return;
        }
        grid.innerHTML = list.map((p, i) => {
            const inStock = Number(p.stock) > 0;
            return `
            <div class="product-card" style="--d:${i}">
              <div class="pc-head">
                <div class="pc-title">${escapeHtml(p.title || '未命名商品')}</div>
              </div>
              <p class="pc-desc">${escapeHtml((p.desc || '暂无描述').slice(0, 60))}</p>
              <div class="pc-foot">
                <span class="pc-price">¥${Number(p.price || 0).toFixed(2)}<small> /件</small></span>
                <span class="stock-light ${inStock ? 'live' : 'out'}"><i></i>${inStock ? '有货 ' + p.stock : '已售罄'}</span>
              </div>
            </div>`;
        }).join('');
    } catch (e) {
        grid.innerHTML = '<div class="empty-tip">加载失败，请重试</div>';
        showToast('商品列表加载失败', '❌');
    }
}

// ---------- 个人中心：动态拉取真实用户数据 ----------
async function loadProfile() {
    const tok = localStorage.getItem('lynli_admin_token');
    const email = localStorage.getItem('lynli_admin_email') || '--';
    const role = currentRole();

    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    const roleEl = document.getElementById('profile-role');
    if (nameEl) nameEl.innerText = role === 'super' ? '超级管理员' : (roleLabel(role) || '用户');
    if (emailEl) emailEl.innerText = email;
    if (roleEl) roleEl.innerHTML = `<span class="role-badge ${roleBadgeClass(role)}">${roleLabel(role)}</span>`;

    if (!tok) return;
    try {
        const res = await fetch(`${API_BASE}/user/info`, { headers: { 'Authorization': 'Bearer ' + tok } });
        const json = await res.json();
        const u = (json && json.data) ? json.data : null;
        if (!u) return;
        if (emailEl) emailEl.innerText = u.email || email;
        const t = document.getElementById('profile-traffic');
        if (t) t.innerText = fmtBytes(u.transferEnable);
        const ex = document.getElementById('profile-expire');
        if (ex) ex.innerText = u.expiredAt ? fmtTime(u.expiredAt) : '永久有效';
        const cr = document.getElementById('profile-created');
        if (cr) cr.innerText = fmtTime(u.createdAt);
        const ll = document.getElementById('profile-lastlogin');
        if (ll) ll.innerText = u.lastLoginAt ? fmtTime(u.lastLoginAt) : '--';
    } catch (e) {
        showToast('用户信息拉取失败', '⚠️');
    }
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- 退出 ----------
function doLogout() {
    localStorage.removeItem('lynli_admin');
    localStorage.removeItem('lynli_admin_token');
    localStorage.removeItem('lynli_admin_email');
    localStorage.removeItem('lynli_admin_role');
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

window.onload = function () {
    drawCaptcha();
    if (localStorage.getItem('lynli_admin') === 'true') {
        renderDrawer();
        document.body.classList.add('logged-in'); // AI 悬浮窗登录后可见
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        if (typeof loadProfile === 'function') loadProfile();
        if (typeof fetchDashboardData === 'function') fetchDashboardData();
    }
};
