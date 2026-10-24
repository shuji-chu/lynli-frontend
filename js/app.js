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

// ========== 数据大盘 ==========
async function fetchDashboardData() {
    const elRev = document.getElementById('dash-revenue');
    const elUsers = document.getElementById('dash-users');
    const elOrders = document.getElementById('dash-orders');
    
    if (!elRev) return;
    elRev.innerText = '...'; elUsers.innerText = '...'; elOrders.innerText = '...';

    try {
        const token = localStorage.getItem('lynli_admin_token') || '';
        const res = await fetch(`${API_BASE}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.code === 1) {
            const data = json.data || {};
            elRev.innerText = `¥ ${data.revenue || '0.00'}`;
            elUsers.innerText = data.users_today || 0;
            elOrders.innerText = data.orders_today || 0;
        } else {
            elRev.innerText = '¥ --'; elUsers.innerText = '--'; elOrders.innerText = '--';
        }
    } catch (err) {
        elRev.innerText = '¥ --'; elUsers.innerText = '--'; elOrders.innerText = '--';
    }
}

// ========== 账号库：拉取列表 ==========
async function loadAccounts() {
    const tbody = document.getElementById('account-list');
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-tertiary)">正在获取账号池...</td></tr>';
    
    try {
        const token = localStorage.getItem('lynli_admin_token') || '';
        // 注意：如果你的接口路径不是 /admin/accounts，请修改这里
        const res = await fetch(`${API_BASE}/admin/accounts`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        const json = await res.json();
        
        if (json.code === 1 && json.data) {
            renderAccounts(json.data);
        } else {
            mockAccounts();
        }
    } catch(e) {
        mockAccounts();
    }
}

function renderAccounts(list) {
    const tbody = document.getElementById('account-list');
    if(!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-tertiary)">暂无商品</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    list.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td style="font-weight:500">${item.name || item.title || 'TGX 账号'}</td>
                <td class="text-primary" style="font-weight:600">¥ ${item.price || '0.00'}</td>
                <td>${item.stock !== undefined ? item.stock : '充足'}</td>
                <td><button class="btn btn-ghost btn-sm" onclick="extractAccount('${item.id}')">拿号</button></td>
            </tr>
        `;
    });
}

// 备用展示数据（如果接口没通，让你先拿两个邮箱测试）
function mockAccounts() {
    const tbody = document.getElementById('account-list');
    tbody.innerHTML = `
        <tr><td style="font-weight:500">Outlook 稳定老号 (演示)</td><td class="text-primary" style="font-weight:600">¥ 5.00</td><td>128</td><td><button class="btn btn-ghost btn-sm" onclick="extractAccount('1')">拿号</button></td></tr>
        <tr><td style="font-weight:500">TGX 直登号 (演示)</td><td class="text-primary" style="font-weight:600">¥ 2.50</td><td>45</td><td><button class="btn btn-ghost btn-sm" onclick="extractAccount('2')">拿号</button></td></tr>
    `;
}

// ========== 账号库：提取账号 ==========
async function extractAccount(id) {
    const resultBox = document.getElementById('extract-result');
    const dataBox = document.getElementById('extract-data');
    resultBox.style.display = 'block';
    dataBox.innerText = '正在从池子中提取，请稍候...';

    try {
        const token = localStorage.getItem('lynli_admin_token') || '';
        // 注意：提取接口如果是 /admin/accounts/extract，请自行替换
        const res = await fetch(`${API_BASE}/admin/accounts/extract`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ product_id: id, count: 1 })
        });
        const json = await res.json();
        
        if (json.code === 1 && json.data) {
            // 兼容不同返回字段名
            const acc = json.data.account || json.data.email || json.data.data || JSON.stringify(json.data);
            dataBox.innerText = acc;
            showToast('提取成功', 'success');
            loadAccounts(); // 提取后库存会变，自动刷新列表
        } else {
            dataBox.innerText = 'lynli_demo_' + Math.floor(Math.random()*1000) + '@outlook.com | Pass: Lynli888!';
            showToast('接口未通，已下发演示数据', 'warning');
        }
    } catch(e) {
        dataBox.innerText = 'lynli_demo_' + Math.floor(Math.random()*1000) + '@outlook.com | Pass: Lynli888!';
        showToast('网络异常，已下发演示数据', 'warning');
    }
}

// ========== 基础交互 ==========
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
        showToast('登录成功', 'success');
        fetchDashboardData(); // 进入后台拉取大盘
    }, 300);
}

window.onload = function() {
    refreshCaptcha();
    if (localStorage.getItem('lynli_admin') === 'true') {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        fetchDashboardData();
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

    // 如果切换到账号库，自动请求数据
    if (pageId === 'accounts') {
        loadAccounts();
    }
}

function doLogout() {
    localStorage.removeItem('lynli_admin');
    localStorage.removeItem('lynli_admin_token');
    location.reload();
}
