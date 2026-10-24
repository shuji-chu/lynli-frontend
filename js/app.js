// ============================================================
// SOCKS5 管理中枢 - 核心逻辑
// 登录路由: /api/v1/passport/auth/login  (后端 api_auth.py)
// 真实验证码: /api/v1/auth/captcha       (后端 api_captcha.py, 点字母式)
// ============================================================
// 同源优先：面板部署在 web.lynli.me 时走 /api/v1 同源路径（nginx 代理到 7001），
// 彻底避免跨域预检；GitHub Pages 等其他环境回退到 api.lynli.me
const API_BASE = (location.hostname.endsWith("lynli.me") && location.hostname !== "api.lynli.me")
    ? "/api/v1"
    : "https://api.lynli.me/api/v1";

// ---------- Toast 提示（统一走这里，不再使用原生 alert） ----------
function showToast(msg, icon = 'ℹ️') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = '<div class="toast-icon"></div><div class="toast-text" id="toast-text"></div>';
        document.body.appendChild(toast);
    }
    toast.querySelector('.toast-icon').innerText = icon;
    document.getElementById('toast-text').innerText = msg;
    toast.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ---------- 真实验证码（点字母式） ----------
let captchaId = null;
let captchaPassed = false;

async function loadCaptcha() {
    captchaPassed = false;
    const input = document.getElementById('captcha-input');
    if (input) input.value = '';
    try {
        const res = await fetch(`${API_BASE}/auth/captcha`, { method: 'GET' });
        const json = await res.json();
        if (json.code === 1 && json.data) {
            captchaId = json.data.id;
            const img = document.getElementById('captcha-img');
            if (img) img.src = json.data.image;
            const hint = document.getElementById('captcha-hint');
            if (hint) hint.innerText = `（${json.data.hint}，点击图片刷新）`;
        } else {
            showToast('验证码加载失败', '❌');
        }
    } catch (err) {
        console.error('验证码加载错误:', err);
        showToast('验证码加载失败，请检查网络', '📡');
    }
}

async function onCaptchaClick(evt) {
    const img = document.getElementById('captcha-img');
    const rect = img.getBoundingClientRect();
    // 换算成图片原始坐标
    const scaleX = (img.naturalWidth || rect.width) / rect.width;
    const scaleY = (img.naturalHeight || rect.height) / rect.height;
    const x = (evt.clientX - rect.left) * scaleX;
    const y = (evt.clientY - rect.top) * scaleY;

    if (!captchaId) { await loadCaptcha(); return; }

    try {
        const res = await fetch(`${API_BASE}/auth/captcha/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: captchaId, x, y })
        });
        const json = await res.json();
        if (json.code === 1 && json.data && json.data.pass) {
            captchaPassed = true;
            const input = document.getElementById('captcha-input');
            if (input) input.value = '已通过';
            showToast('验证码已通过', '✅');
        } else {
            showToast(json.message || '点错了，请重试', '❌');
            await loadCaptcha();
        }
    } catch (err) {
        console.error('验证码校验错误:', err);
        showToast('验证码校验失败，请重试', '📡');
        await loadCaptcha();
    }
}

// ---------- 登录 ----------
async function doLogin() {
    const account = document.getElementById('login-user')?.value.trim();
    const password = document.getElementById('login-pass')?.value.trim();

    if (!account || !password) { showToast('账号或密码没填', '⚠️'); return; }
    if (!captchaPassed) { showToast('请先点击图片中的字母完成验证', '🔐'); return; }

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
            setTimeout(() => {
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('main-app').style.display = 'flex';
                if (typeof fetchDashboardData === 'function') fetchDashboardData();
            }, 500);
        } else {
            showToast(json.message || '账号或密码错误', '❌');
            await loadCaptcha();
        }
    } catch (err) {
        console.error('登录报错详情:', err);
        let errMsg = '请求失败';
        if (err.message.includes('Failed to fetch')) {
            errMsg = '跨域被拦截或后端服务没开';
        } else {
            errMsg = err.message;
        }
        showToast(`报错: ${errMsg}`, '📡');
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

window.onload = function () {
    loadCaptcha();
    if (localStorage.getItem('lynli_admin') === 'true') {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        fetchDashboardData();
    }
};
