const API_BASE = "https://api.lynli.me";

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toast-text');
    if (!toast || !text) return;
    toast.className = 'toast show' + (type === 'error' ? ' is-error' : '');
    text.innerText = msg;
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

async function fetchDashboardData() {
    const elRev = document.getElementById('dash-revenue');
    if (!elRev) return;
    try {
        const token = localStorage.getItem('lynli_admin_token') || '';
        const res = await fetch(`${API_BASE}/api/v1/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.code === 1 && json.data) {
            elRev.innerText = `¥ ${json.data.today_income || '0.00'}`;
            document.getElementById('dash-users').innerText = json.data.total_users || 0;
            document.getElementById('dash-orders').innerText = json.data.today_orders || 0;
        }
    } catch (err) { console.error(err); }
}

async function loadAccounts() {
    const tbody = document.getElementById('account-list');
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">获取中...</td></tr>';
    try {
        const res = await fetch(`${API_BASE}/api/v1/account/products`);
        const json = await res.json();
        if (json.code === 1 && json.data) {
            tbody.innerHTML = '';
            if (json.data.length === 0) { 
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">暂无商品</td></tr>'; 
                return; 
            }
            json.data.forEach(item => {
                tbody.innerHTML += `
                    <tr>
                        <td>${item.title}</td>
                        <td style="color:var(--blue-primary);font-weight:600;">¥ ${item.price}</td>
                        <td>${item.stock}</td>
                        <td><button class="btn btn-ghost btn-sm" style="border:1px solid var(--border-subtle);background:none;color:var(--blue-primary);" onclick="extractAccount('${item.id}')">拿号</button></td>
                    </tr>
                `;
            });
        }
    } catch(e) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:red;">网络错误</td></tr>'; }
}

async function extractAccount(productId) {
    try {
        const token = localStorage.getItem('lynli_admin_token') || '';
        const res = await fetch(`${API_BASE}/api/v1/account/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ product_id: productId })
        });
        const json = await res.json();
        if (json.code === 1) {
            showToast('拿号成功: ' + (json.data.account || json.data.email), 'success');
            loadAccounts();
        } else {
            showToast(json.msg || '拿号失败', 'error');
        }
    } catch(e) { showToast('网络错误', 'error'); }
}

let currentCaptcha = '';
function refreshCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let res = '';
    for (let i = 0; i < 4; i++) res += chars[Math.floor(Math.random() * 36)];
    currentCaptcha = res;
    const capEl = document.getElementById('captcha-img');
    if (capEl) capEl.innerText = res;
    const capInput = document.getElementById('captcha-input');
    if (capInput) capInput.value = currentCaptcha;
}

function autoFillCaptcha() {
    document.getElementById('captcha-input').value = currentCaptcha;
}

async function doLogin() {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    if (!user || !pass) return showToast('请输入账号和密码', 'warning');

    const btn = document.querySelector('.btn-primary');
    btn.innerText = '登录中...';

    try {
        const res = await fetch(`${API_BASE}/api/v1/passport/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user, password: pass })
        });
        
        if (!res.ok) {
            throw new Error(`状态码 ${res.status}`);
        }

        const json = await res.json();
        if (json.code === 1) {
            const token = json.data.token || json.data.auth_data?.auth || json.token;
            localStorage.setItem('lynli_admin_token', token);
            document.getElementById('login-page').style.display = 'none';
            document.getElementById('main-app').style.display = 'flex';
            showToast('登录成功', 'success');
            fetchDashboardData();
        } else {
            showToast(json.msg || '账号密码错误', 'error');
            btn.innerText = '登 录';
        }
    } catch(e) {
        showToast('连接失败: ' + e.message, 'error');
        btn.innerText = '登 录';
    }
}

window.onload = function() {
    if (localStorage.getItem('lynli_admin_token')) {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        fetchDashboardData();
    } else {
        document.getElementById('login-page').style.display = 'flex';
        refreshCaptcha();
    }
}

function switchTab(pageId, el) {
    document.querySelectorAll('.sub-page').forEach(page => page.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    el.classList.add('active');
    if (pageId === 'accounts') loadAccounts();
}

function doLogout() { localStorage.clear(); location.reload(); }
