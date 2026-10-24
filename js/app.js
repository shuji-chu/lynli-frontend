const API_BASE = "https://api.lynli.me/api/v1";
const ENDPOINTS = {
    dashboard: '/admin/dashboard',
    accountList: '/admin/accounts',
    accountExtract: '/admin/accounts/extract'
};

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toast-text');
    if (!toast || !text) return;
    toast.className = 'toast show' + (type === 'error' ? ' is-error' : type === 'warning' ? ' is-warning' : '');
    text.innerText = msg;
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 2500);
}

// 数据大盘
async function fetchDashboardData() {
    const elRev = document.getElementById('dash-revenue');
    if (!elRev) return;
    
    try {
        const token = localStorage.getItem('lynli_admin_token') || '';
        const res = await fetch(`${API_BASE}${ENDPOINTS.dashboard}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.code === 1) {
            const data = json.data || {};
            elRev.innerText = `¥ ${data.revenue || '0.00'}`;
            document.getElementById('dash-users').innerText = data.users_today || 0;
            document.getElementById('dash-orders').innerText = data.orders_today || 0;
        }
    } catch (err) {}
}

// 账号库
async function loadAccounts() {
    const tbody = document.getElementById('account-list');
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">获取中...</td></tr>';
    
    try {
        const token = localStorage.getItem('lynli_admin_token') || '';
        const res = await fetch(`${API_BASE}${ENDPOINTS.accountList}`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        const json = await res.json();
        if (json.code === 1 && json.data && json.data.length > 0) {
            tbody.innerHTML = '';
            json.data.forEach(item => {
                tbody.innerHTML += `
                    <tr>
                        <td style="font-weight:500">${item.name || item.title || 'SOCKS5 账号'}</td>
                        <td class="text-primary" style="font-weight:600">¥ ${item.price || '0.00'}</td>
                        <td>${item.stock !== undefined ? item.stock : '充足'}</td>
                        <td><button class="btn btn-ghost btn-sm" onclick="extractAccount('${item.id}')">拿号</button></td>
                    </tr>
                `;
            });
        } else {
            mockAccounts();
        }
    } catch(e) {
        mockAccounts();
    }
}

function mockAccounts() {
    const tbody = document.getElementById('account-list');
    tbody.innerHTML = `
        <tr><td style="font-weight:500">Outlook 稳定老号 (演示)</td><td class="text-primary" style="font-weight:600">¥ 5.00</td><td>128</td><td><button class="btn btn-ghost btn-sm" onclick="extractAccount('1')">拿号</button></td></tr>
        <tr><td style="font-weight:500">TGX 直登号 (演示)</td><td class="text-primary" style="font-weight:600">¥ 2.50</td><td>45</td><td><button class="btn btn-ghost btn-sm" onclick="extractAccount('2')">拿号</button></td></tr>
    `;
}

async function extractAccount(id) {
    const resultBox = document.getElementById('extract-result');
    const dataBox = document.getElementById('extract-data');
    resultBox.style.display = 'block';
    dataBox.innerText = '正在从池子中提取，请稍候...';

    try {
        const token = localStorage.getItem('lynli_admin_token') || '';
        const res = await fetch(`${API_BASE}${ENDPOINTS.accountExtract}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ product_id: id, count: 1 })
        });
        const json = await res.json();
        if (json.code === 1 && json.data) {
            dataBox.innerText = json.data.account || json.data.email || json.data.data || JSON.stringify(json.data);
            showToast('提取成功', 'success');
            loadAccounts();
        } else {
            dataBox.innerText = 'socks5_demo_' + Math.floor(Math.random()*1000) + '@outlook.com | Pass: Socks888!';
        }
    } catch(e) {
        dataBox.innerText = 'socks5_demo_' + Math.floor(Math.random()*1000) + '@outlook.com | Pass: Socks888!';
    }
}

// 验证码
let currentCaptcha = '';
function refreshCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let res = '';
    for (let i = 0; i < 4; i++) res += chars[Math.floor(Math.random() * 36)];
    currentCaptcha = res;
    const capEl = document.getElementById('captcha-img');
    if (capEl) {
        capEl.innerText = res;
        capEl.style.color = '#2563eb';
        capEl.style.fontSize = '20px';
        capEl.style.fontWeight = 'bold';
    }
}

function autoFillCaptcha() {
    const capInput = document.getElementById('captcha-input');
    if (capInput) capInput.value = currentCaptcha;
}

// 🔥 登录逻辑：强制写入本地，保证刷新永远不掉线
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

    // 强制存状态！无需勾选记住密码也能永久登录
    localStorage.setItem('lynli_admin', 'true');
    localStorage.setItem('lynli_user', user);
    
    const loginPage = document.getElementById('login-page');
    loginPage.style.opacity = '0';
    
    setTimeout(() => {
        loginPage.style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        showToast('登录成功', 'success');
        fetchDashboardData();
    }, 300);
}

// 🔥 网页加载：只要本地有登录标记，直接跳过登录页
window.onload = function() {
    const isLogged = localStorage.getItem('lynli_admin') === 'true';
    const loginPage = document.getElementById('login-page');
    const mainApp = document.getElementById('main-app');
    
    if (isLogged) {
        if (loginPage) loginPage.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';
        fetchDashboardData();
    } else {
        refreshCaptcha();
    }
}

function switchTab(pageId, el) {
    document.querySelectorAll('.sub-page').forEach(page => page.classList.remove('active'));
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');
    
    if (el) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        el.classList.add('active');
    }
    document.querySelector('.admin-main').scrollTo({ top: 0, behavior: 'smooth' });

    if (pageId === 'accounts') {
        loadAccounts();
    }
}

function doLogout() {
    localStorage.removeItem('lynli_admin');
    localStorage.removeItem('lynli_admin_token');
    location.reload();
}
