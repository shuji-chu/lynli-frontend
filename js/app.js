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
        if (typeof fetchDashboardData === 'function') fetchDashboardData();
    }, 420);
}

// ---------- 子页面切换（侧边栏导航） ----------
function switchTab(tab, el) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');
    document.querySelectorAll('.sub-page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page-' + tab);
    if (page) page.classList.add('active');
    // 地图页懒加载：容器可见后再初始化，Leaflet 才能正确计算尺寸
    if (tab === 'map') {
        setTimeout(() => { if (typeof initNodeMap === 'function') initNodeMap(); }, 80);
    }
    if (tab === 'accounts' && typeof loadAccounts === 'function') loadAccounts();
}

// ---------- 账号库商品列表（真实数据：account_products 表，只读展示） ----------
async function loadAccounts() {
    const tbody = document.getElementById('account-list');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">加载中...</td></tr>';
    try {
        const res = await fetch(`${API_BASE}/account/products`);
        const json = await res.json();
        const list = (json.code === 1 && json.data) ? json.data : [];
        if (!list.length) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">暂无商品</td></tr>';
            return;
        }
        tbody.innerHTML = list.map(p => `
            <tr>
                <td>${escapeHtml(p.title || '-')}</td>
                <td style="color:#2563eb; font-weight:700;">¥${Number(p.price || 0).toFixed(2)}</td>
                <td>${p.stock > 0 ? p.stock : '<span style="color:#ef4444;">售罄</span>'}</td>
                <td style="color:#94a3b8;">—</td>
            </tr>`).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#ef4444;">加载失败，请重试</td></tr>';
        showToast('商品列表加载失败', '❌');
    }
}

// ---------- 数据大盘 ----------
async function fetchDashboardData() {
    console.log("准备请求大盘数据...");
}

// ---------- 退出 ----------
function doLogout() {
    localStorage.removeItem('lynli_admin');
    localStorage.removeItem('lynli_admin_token');
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
        fetchDashboardData();
    }
};
