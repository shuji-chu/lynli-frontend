const API_BASE = "https://api.lynli.me/api/v1";

function showToast(msg, icon = 'ℹ️') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.querySelector('.toast-icon').innerText = icon;
    document.getElementById('toast-text').innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// 验证码生成
let currentCaptcha = '';
function refreshCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let res = '';
    for (let i = 0; i < 4; i++) res += chars[Math.floor(Math.random() * 36)];
    currentCaptcha = res;
    const el = document.getElementById('captcha-img');
    if (el) {
        el.innerText = res;
    } else {
        console.warn("⚠️ 找不到 id='captcha-img' 的节点，请检查 HTML");
    }
}

// 初始化时调用
refreshCaptcha();

function autoFillCaptcha() {
    const input = document.getElementById('captcha-input');
    if(input) {
        input.value = currentCaptcha;
        showToast('已自动填充验证码', '✨');
    }
}

// 登录逻辑
async function doLogin() {
    const account = document.getElementById('account-input')?.value.trim();
    const password = document.getElementById('password-input')?.value.trim();
    const captcha = document.getElementById('captcha-input')?.value.trim();

    if (!account || !password) { showToast('请输入账号和密码', '⚠️'); return; }
    if (!captcha || captcha.toUpperCase() !== currentCaptcha.toUpperCase()) {
        showToast('验证码错误或为空', '❌'); 
        refreshCaptcha(); 
        if(document.getElementById('captcha-input')) document.getElementById('captcha-input').value = '';
        return;
    }

    showToast('正在登录...', '⏳');

    try {
        const res = await fetch(`${API_BASE}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: account, password: password })
        });
        const json = await res.json();

        if (json.code === 1 || json.success) {
            const token = json.data?.token || json.token;
            localStorage.setItem('lynli_admin_token', token);
            if (document.getElementById('remember-me')?.checked) {
                localStorage.setItem('lynli_admin', 'true');
            }
            
            showToast('欢迎回来', '👋');
            
            document.getElementById('login-page').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('main-app').style.display = 'flex';
                fetchDashboardData(); 
            }, 400);
        } else {
            showToast(json.msg || '账号或密码错误', '❌');
            refreshCaptcha(); 
        }
    } catch (err) {
        showToast('网络请求失败', '📡');
    }
}

// 数据请求（带防御机制）
async function fetchDashboardData() {
    try {
        const token = localStorage.getItem('lynli_admin_token') || '';
        const res = await fetch(`${API_BASE}/admin/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } });
        const json = await res.json();
        if (json.code === 1) {
            const data = json.data || {};
            const revEl = document.getElementById('dash-revenue');
            const userEl = document.getElementById('dash-users');
            if(revEl) revEl.innerText = `¥ ${data.revenue || '0.00'}`;
            if(userEl) userEl.innerText = data.users_today || '0';
        }
    } catch (err) { console.error("大盘数据请求失败", err); }
}

window.onload = function() {
    if (localStorage.getItem('lynli_admin') === 'true') {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        fetchDashboardData(); 
    }
}

function doLogout() {
    localStorage.removeItem('lynli_admin');
    localStorage.removeItem('lynli_admin_token');
    location.reload();
}
