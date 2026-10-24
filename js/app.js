// ========== 全局配置 ==========
const API_BASE = "https://api.lynli.me/api/v1";

// 无 emoji 的高级 Toast
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toast-text');
    if (!toast || !text) return;
    
    toast.className = 'toast show' + (type === 'error' ? ' is-error' : type === 'warning' ? ' is-warning' : '');
    text.innerText = msg;
    
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 2500);
}

// ========== 获取真实数据大盘 ==========
async function fetchDashboardData() {
    const elRev = document.getElementById('dash-revenue');
    const elUsers = document.getElementById('dash-users');
    const elOrders = document.getElementById('dash-orders');
    
    if (!elRev) return;
    elRev.innerText = '加载中...';
    elUsers.innerText = '加载中...';
    elOrders.innerText = '加载中...';

    try {
        const token = localStorage.getItem('lynli_admin_token') || '';
        const res = await fetch(`${API_BASE}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();

        // 按照你后端真实的 code === 1 判定
        if (json.code === 1) {
            const data = json.data || {};
            elRev.innerText = `¥ ${data.revenue || '0.00'}`;
            elUsers.innerText = data.users_today || 0;
            elOrders.innerText = data.orders_today || 0;
        } else {
            elRev.innerText = '¥ --';
            elUsers.innerText = '--';
            elOrders.innerText = '--';
            showToast(json.msg || '获取数据失败', 'error');
        }
    } catch (err) {
        console.error("大盘数据请求失败:", err);
        elRev.innerText = '¥ --';
        elUsers.innerText = '--';
        elOrders.innerText = '--';
        showToast('网络请求失败', 'error');
    }
}

// ========== 验证码逻辑 ==========
let currentCaptcha = '';
function refreshCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let res = '';
    for (let i = 0; i < 4; i++) res += chars[Math.floor(Math.random() * 36)];
    currentCaptcha = res;
    const capEl = document.getElementById('captcha-img');
    if (capEl) capEl.innerText = res;
}

function autoFillCaptcha() {
    const capInput = document.getElementById('captcha-input');
    if (capInput) capInput.value = currentCaptcha;
}

// ========== 登录逻辑 ==========
function doLogin() {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const captcha = document.getElementById('captcha-input').value.trim();

    if (!user || !pass) return showToast('请输入账号和密码', 'warning');
    if (!captcha) return showToast('请输入验证码', 'warning');
    if (captcha.toUpperCase() !== currentCaptcha.toUpperCase()) {
        showToast('验证码错误', 'error'); 
        refreshCaptcha(); 
        document.getElementById('captcha-input').value = '';
        return;
    }

    if (document.getElementById('remember-me').checked) {
        localStorage.setItem('lynli_admin', 'true');
    }
    
    const loginPage = document.getElementById('login-page');
    loginPage.style.opacity = '0';
    
    setTimeout(() => {
        loginPage.style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        showToast('欢迎回来', 'success');
        fetchDashboardData(); // 登录后立刻拉取真实数据
    }, 300);
}

// ========== 页面初始化 ==========
window.onload = function() {
    refreshCaptcha();
    if (localStorage.getItem('lynli_admin') === 'true') {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        fetchDashboardData();
    }
}

// Tab 切换
function switchTab(pageId, el) {
    document.querySelectorAll('.sub-page').forEach(page => page.classList.remove('active'));
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');
    
    if (el) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        el.classList.add('active');
    }
    // 切换时滑动回顶部
    document.querySelector('.admin-main').scrollTo({ top: 0, behavior: 'smooth' });
}

// 退出登录
function doLogout() {
    localStorage.removeItem('lynli_admin');
    localStorage.removeItem('lynli_admin_token');
    location.reload();
}
