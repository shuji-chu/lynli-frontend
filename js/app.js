const API_BASE = "https://api.lynli.me";

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toast-text');
    if (!toast || !text) return;
    toast.className = 'toast show' + (type === 'error' ? ' is-error' : type === 'warning' ? ' is-warning' : '');
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
            const data = json.data;
            elRev.innerText = `¥ ${data.today_income || '0.00'}`;
            document.getElementById('dash-users').innerText = data.total_users || 0;
            document.getElementById('dash-orders').innerText = data.today_orders || 0;
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
            if (json.data.length === 0) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">暂无商品</td></tr>'; return; }
            json.data.forEach(item => {
                tbody.innerHTML += `
                    <tr>
                        <td style="font-weight:500">${item.title}</td>
                        <td class="text-primary" style="font-weight:600">¥ ${item.price}</td>
                        <td>${item.stock}</td>
                        <td><button class="btn btn-ghost btn-sm" onclick="extractAccount('${item.id}')">拿号</button></td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--danger)">${json.msg || '加载失败'}</td></tr>`;
        }
    } catch(e) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--danger)">网络请求失败</td></tr>'; }
}

async function extractAccount(productId) {
    const resultBox = document.getElementById('extract-result');
    const dataBox = document.getElementById('extract-data');
    if(!resultBox || !dataBox) return;
    resultBox.style.display = 'block';
    dataBox.innerText = '正在从池子提取...';
    try {
        const token = localStorage.getItem('lynli_admin_token') || '';
        const res = await fetch(`${API_BASE}/api/v1/account/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ product_id: productId })
        });
        const json = await res.json();
        if (json.code === 1) {
            dataBox.innerText = json.data.account || json.data.email || JSON.stringify(json.data);
            showToast('提取成功', 'success');
            loadAccounts();
        } else {
            dataBox.innerText = '提取失败';
            showToast(json.msg || '提取失败', 'error');
        }
    } catch(e) { dataBox.innerText = '网络请求失败'; }
}

// 验证码逻辑：生成后自动填入输入框
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
    // 自动填入验证码，免去手动输入
    const capInput = document.getElementById('captcha-input');
    if (capInput) capInput.value = currentCaptcha;
}

// 登录逻辑：只有拿到 token 才算成功
async function doLogin() {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    if (!user || !pass) return showToast('请输入账号和密码', 'warning');

    const btn = document.querySelector('.btn-primary');
    if(btn) btn.innerText = '登录中...';

    try {
        const res = await fetch(`${API_BASE}/api/v1/passport/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user, password: pass })
        });
        const json = await res.json();
        
        if (json.code === 1) {
            // 尝试获取 token 的所有可能字段
            const token = json.data.token || json.data.auth_data?.auth || json.data.access_token || json.token;
            if (token) {
                localStorage.setItem('lynli_admin_token', token);
                localStorage.setItem('lynli_admin', 'true');
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('main-app').style.display = 'flex';
                showToast('登录成功', 'success');
                fetchDashboardData();
            } else {
                showToast('登录成功但未返回Token', 'error');
                if(btn) btn.innerText = '登 录';
            }
        } else {
            showToast(json.msg || '登录失败', 'error');
            if(btn) btn.innerText = '登 录';
        }
    } catch(e) {
        showToast('服务器连接失败', 'error');
        if(btn) btn.innerText = '登 录';
    }
}

// 初始化：严格校验 Token
window.onload = function() {
    const token = localStorage.getItem('lynli_admin_token');
    // 必须有真实 Token 才直接进后台
    if (token && token !== 'undefined' && token !== 'null') {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        fetchDashboardData();
    } else {
        // 没有 Token 就强制清空状态并显示登录页
        localStorage.clear();
        document.getElementById('login-page').style.display = 'flex';
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
    if (pageId === 'accounts') loadAccounts();
}

function doLogout() {
    localStorage.clear();
    location.reload();
}
