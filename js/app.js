// ============================================================
// SOCKS5 管理中枢 - 核心逻辑
// 登录路由: /api/v1/passport/auth/login  (后端 api_auth.py)
// 验证码: 前端本地生成 4 位字符（canvas 绘制，点击刷新，本地校验）
// ============================================================
// 域名说明：web.lynli.me（面板，nginx 同源代理 /api/）与 tg.lynli.me（商城，独立站点）
// 是两套独立网站。仅 web.lynli.me 走同源 /api/v1，其余域名统一走 api.lynli.me
const API_BASE = (location.hostname === "web.lynli.me")
    ? "/api/v1"
    : "https://api.lynli.me/api/v1";

// ---------- Toast 提示（统一走这里，不再使用原生 alert） ----------
// 防御式实现：页面 HTML 里可能已存在 #toast 节点但结构不完整，缺什么补什么
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
// 去掉易混淆字符：0/O、1/I/L、2/Z、5/S、8/B
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

    // 背景：浅蓝渐变
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#eef4ff');
    bg.addColorStop(1, '#dbe7ff');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 干扰噪点
    for (let i = 0; i < 60; i++) {
        ctx.fillStyle = `rgba(${_randInt(100, 180)},${_randInt(130, 200)},255,${Math.random() * 0.5 + 0.2})`;
        ctx.fillRect(_randInt(0, W), _randInt(0, H), 2, 2);
    }
    // 干扰曲线
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, _randInt(0, H));
        ctx.bezierCurveTo(W * 0.3, _randInt(0, H), W * 0.6, _randInt(0, H), W, _randInt(0, H));
        ctx.strokeStyle = `rgba(${_randInt(60, 120)},${_randInt(100, 160)},235,0.45)`;
        ctx.lineWidth = _randInt(1, 2);
        ctx.stroke();
    }

    // 4 个字符：随机蓝色、随机旋转、随机基线
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
        // 真实路由：/api/v1/passport/auth/login，字段为 email + password
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
        console.log("后端返回:", json);

        if (json.data && json.data.token) {
            localStorage.setItem('lynli_admin_token', json.data.token);
            localStorage.setItem('lynli_admin_email', account);
            if (document.getElementById('remember-me')?.checked) {
                localStorage.setItem('lynli_admin', 'true');
            }
            showToast('登录成功', '👋');
            setLoginLoading(false);
            // 平滑过渡到主控制台
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

// ---------- 平滑进入主控制台 ----------
function enterMainApp() {
    const loginPage = document.getElementById('login-page');
    const mainApp = document.getElementById('main-app');
    loginPage.classList.add('page-leaving');
    setTimeout(() => {
        loginPage.style.display = 'none';
        loginPage.classList.remove('page-leaving');
        mainApp.style.display = 'flex';
        mainApp.classList.add('page-entering');
        setTimeout(() => mainApp.classList.remove('page-entering'), 450);
        // 填充个人中心邮箱
        const email = localStorage.getItem('lynli_admin_email') || '';
        const pe = document.getElementById('profile-email');
        if (pe) pe.innerText = email || 'admin@lynli.me';
        if (typeof fetchDashboardData === 'function') fetchDashboardData();
    }, 420);
}

// ---------- 子页面切换（侧边栏导航） ----------
function switchTab(tab, el) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');
    document.querySelectorAll('.sub-page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page-' + tab);
    if (page) {
        page.classList.add('active');
        // 为直接子元素设置错峰延迟变量
        Array.from(page.children).forEach((child, i) => {
            child.style.setProperty('--d', i);
        });
    }
    // 地图页懒加载：容器可见后再初始化，Leaflet 才能正确计算尺寸
    if (tab === 'map') {
        setTimeout(() => { if (typeof initNodeMap === 'function') initNodeMap(); }, 80);
    }
    if (tab === 'accounts' && typeof loadAccounts === 'function') loadAccounts();
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

// ---------- 数据大盘（真实数据：节点 / 商品 / 套餐 / 账户流量） ----------
async function fetchDashboardData() {
    const [nodesR, productsR, plansR, infoR] = await Promise.allSettled([
        fetch(`${API_BASE}/public/nodes`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/account/products`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/user/plan/fetch`).then(r => r.json()).catch(() => null),
        (async () => {
            const tok = localStorage.getItem('lynli_admin_token');
            if (!tok) return null;
            const r = await fetch(`${API_BASE}/user/info`, { headers: { 'Authorization': 'Bearer ' + tok } });
            return r.json().catch(() => null);
        })(),
    ]);

    const nodes = (nodesR.value && nodesR.value.code === 1) ? (nodesR.value.data || []) : [];
    const products = (productsR.value && productsR.value.code === 1) ? (productsR.value.data || []) : [];
    // 套餐接口响应无 code 字段，data 为数组即可用
    const plans = (plansR.value && Array.isArray(plansR.value.data)) ? plansR.value.data : [];
    const info = (infoR.value && infoR.value.data) ? infoR.value.data : {};

    const online = nodes.filter(n => n.status === 'online' || n.enabled === 1).length;

    // KPI（真实数据 + 滚动动画）
    countUp(document.getElementById('dash-nodes'), nodes.length);
    document.getElementById('dash-nodes-foot').innerText = `${online} 个在线`;
    countUp(document.getElementById('dash-products'), products.length);
    countUp(document.getElementById('dash-plans'), plans.length);
    const traffic = document.getElementById('dash-traffic');
    if (traffic) traffic.innerText = fmtBytes(info.transferEnable);

    // 图表（ECharts 失败时静默降级，不影响 KPI）
    try {
        await loadECharts();
        if (!window.echarts) return;
        renderTrendChart(plans);
        renderBarChart(products);
    } catch (e) { /* 图表降级 */ }
}

// ---------- 折线图：套餐流量额度分布（真实数据） ----------
function renderTrendChart(plans) {
    const box = document.getElementById('chart-trend');
    if (!box || !window.echarts) return;
    let chart = echarts.getInstanceByDom(box);
    if (!chart) chart = echarts.init(box);

    const names = plans.map(p => p.name || '套餐');
    const data = plans.map(p => {
        const b = Number(p.transfer_enable || p.traffic || 0);
        return b > 1e9 ? +(b / 1073741824).toFixed(0) : +(b / 1048576).toFixed(0); // GB
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

// ---------- 柱状图：商品库存分布（真实数据） ----------
function renderBarChart(products) {
    const box = document.getElementById('chart-bar');
    if (!box || !window.echarts) return;
    let chart = echarts.getInstanceByDom(box);
    if (!chart) chart = echarts.init(box);

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

// ---------- 账号库：卡片式列表 + 状态指示灯 ----------
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

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- 退出 ----------
function doLogout() {
    localStorage.removeItem('lynli_admin');
    localStorage.removeItem('lynli_admin_token');
    localStorage.removeItem('lynli_admin_email');
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
});

window.onload = function () {
    drawCaptcha();
    if (localStorage.getItem('lynli_admin') === 'true') {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        const email = localStorage.getItem('lynli_admin_email') || '';
        const pe = document.getElementById('profile-email');
        if (pe) pe.innerText = email || 'admin@lynli.me';
        fetchDashboardData();
    }
};
