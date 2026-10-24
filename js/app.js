// ========== 全局配置 ==========
const API_BASE = "https://api.lynli.me/api/v1";

// 高级 Toast 提示
function showToast(msg, icon = 'ℹ️') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.querySelector('.toast-icon').innerText = icon;
    document.getElementById('toast-text').innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ========== 验证码逻辑 ==========
let currentCaptcha = '';
function refreshCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let res = '';
    for (let i = 0; i < 4; i++) res += chars[Math.floor(Math.random() * 36)];
    currentCaptcha = res;
    document.getElementById('captcha-img').innerText = res;
}
refreshCaptcha();

function autoFillCaptcha() {
    document.getElementById('captcha-input').value = currentCaptcha;
    showToast('已自动填充验证码', '✨');
}

// ========== 真实登录请求 ==========
async function doLogin() {
    const account = document.getElementById('account-input').value.trim();
    const password = document.getElementById('password-input').value.trim();
    const captcha = document.getElementById('captcha-input').value.trim();

    if (!account || !password) { showToast('请输入账号和密码', '⚠️'); return; }
    if (captcha.toUpperCase() !== currentCaptcha.toUpperCase()) {
        showToast('验证码错误，请重试', '❌'); 
        refreshCaptcha(); 
        document.getElementById('captcha-input').value = '';
        return;
    }

    // 模拟登录按钮 Loading 状态
    const btn = document.querySelector('button[onclick=\"doLogin()\"]');
    const originalText = btn.innerText;
    btn.innerText = '登录中...';
    btn.disabled = true;

    try {
        // 请求后端的登录接口 (根据你 api_user.py 里的真实路径修改)
        const res = await fetch(`${API_BASE}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: account, password: password })
        });
        const json = await res.json();

        if (json.code === 1 || json.success) {
            // 登录成功，保存真实 token
            const token = json.data.token || json.token;
            localStorage.setItem('lynli_admin_token', token);
            if (document.getElementById('remember-me').checked) {
                localStorage.setItem('lynli_admin', 'true');
            }
            
            showToast('欢迎回来，Boss', '👋');
            
            // 切换页面
            document.getElementById('login-page').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('main-app').style.display = 'flex';
                // 登录成功后，拉取大盘和账号库数据
                fetchDashboardData(); 
                fetchAccountData();
            }, 400);
        } else {
            showToast(json.msg || '账号或密码错误', '❌');
            refreshCaptcha(); 
        }
    } catch (err) {
        console.error('登录失败:', err);
        showToast('网络请求失败，请检查后端', '📡');
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// ========== 拉取真实大盘数据 ==========
async function fetchDashboardData() {
    try {
        const token = localStorage.getItem('lynli_admin_token') || '';
        const res = await fetch(`${API_BASE}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.code === 1) {
            const data = json.data || {};
            // 替换为你真实的 DOM ID
            if(document.getElementById('dash-revenue')) 
                document.getElementById('dash-revenue').innerText = `¥ ${data.revenue || '0.00'}`;
            if(document.getElementById('dash-users')) 
                document.getElementById('dash-users').innerText = data.users_today || '0';
        }
    } catch (err) {
        console.error("大盘数据请求失败:", err);
    }
}

// ========== 拉取真实账号库数据 (TGX业务) ==========
async function fetchAccountData() {
    const listContainer = document.getElementById('account-list');
    if (!listContainer) return; // 如果没在账号库页面，跳过

    try {
        const token = localStorage.getItem('lynli_admin_token') || '';
        // 请求你后端 api_account.py 提供的接口
        const res = await fetch(`${API_BASE}/account/pool`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (json.code === 1 && json.data) {
            listContainer.innerHTML = ''; // 清空假数据
            // 循环渲染真实数据 (注意这里要写死防XSS，因为用户输入可能不安全，但在Termux里直接写InnerHTML也行)
            json.data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'account-item'; // 用你CSS里的类名
                div.innerHTML = `
                    <div class="item-title">${item.title || 'TGX账号'}</div>
                    <div class="item-price">¥ ${item.price || '0.00'}</div>
                    <div class="item-stock">库存: ${item.stock || 0}</div>
                `;
                listContainer.appendChild(div);
            });
        }
    } catch (err) {
        console.error("账号库数据请求失败:", err);
    }
}

// ========== 页面初始化 ==========
window.onload = function() {
    if (localStorage.getItem('lynli_admin') === 'true') {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        fetchDashboardData(); 
        fetchAccountData();
    }
}

// ========== Tab 切换与退出 ==========
function switchTab(pageId, el) {
    document.querySelectorAll('.sub-page').forEach(page => page.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    if (el) {
        document.querySelectorAll('.tab-item').forEach(item => item.classList.remove('active'));
        el.classList.add('active');
    }
    // 切到对应页面时，请求对应数据
    if (pageId === 'account') fetchAccountData();
    if (pageId === 'dashboard') fetchDashboardData();
}

function doLogout() {
    localStorage.removeItem('lynli_admin');
    localStorage.removeItem('lynli_admin_token');
    location.reload();
}
