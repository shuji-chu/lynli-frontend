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

// ========== 数据大盘 ==========
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
    } catch (err) {
        console.error("大盘拉取失败", err);
    }
}

// ========== 账号库（纯真实数据，没有就是没有） ==========
async function loadAccounts() {
    const tbody = document.getElementById('account-list');
    if(!tbody) return;
    
    // 表头恢复成商品列表的结构
    document.querySelector('.table thead').innerHTML = '<tr><th>商品名称</th><th>价格</th><th>库存</th><th>操作</th></tr>';
    
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-tertiary)">正在从数据库拉取...</td></tr>';
    
    try {
        // 直接请求你已有的真实接口
        const res = await fetch(`${API_BASE}/api/v1/account/products`);
        const json = await res.json();
        
        if (json.code === 1) {
            tbody.innerHTML = '';
            const list = json.data || [];
            
            if (list.length === 0) {
                // 数据库里没上架商品，就老老实实显示空
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-tertiary)">您还没有上架任何商品</td></tr>';
                return;
            }
            
            // 有商品才渲染
            list.forEach(item => {
                tbody.innerHTML += `
                    <tr>
                        <td style="font-weight:500">${item.title}</td>
                        <td class="text-primary" style="font-weight:600">¥ ${item.price}</td>
                        <td>${item.stock} 个</td>
                        <td><button class="btn btn-ghost btn-sm" onclick="extractAccount('${item.id}')">测试拿号</button></td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--danger)">接口报错: ${json.msg || '未知错误'}</td></tr>`;
        }
    } catch(e) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--danger)">网络请求失败，无法连接后端</td></tr>';
    }
}

// ========== 拿号（真实购买扣费逻辑） ==========
async function extractAccount(productId) {
    const resultBox = document.getElementById('extract-result');
    const dataBox = document.getElementById('extract-data');
    if(!resultBox || !dataBox) return;
    
    resultBox.style.display = 'block';
    dataBox.innerText = '正在扣费提取...';

    try {
        const token = localStorage.getItem('lynli_admin_token') || '';
        const res = await fetch(`${API_BASE}/api/v1/account/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ product_id: productId })
        });
        const json = await res.json();
        
        if (json.code === 1) {
            dataBox.innerText = json.data.account || json.data.email || json.data.data || JSON.stringify(json.data);
            showToast('提取成功', 'success');
            loadAccounts(); // 刷新库存
        } else {
            dataBox.innerText = '提取失败：' + (json.msg || '未知错误');
            showToast(json.msg || '提取失败', 'error');
        }
    } catch(e) {
        dataBox.innerText = '网络请求失败';
        showToast('网络请求失败', 'error');
    }
}

// ========== 登录逻辑 ==========
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
    const capInput = document.getElementById('captcha-input');
    if (capInput) capInput.value = currentCaptcha;
}

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

// ========== 初始化 ==========
window.onload = function() {
    const token = localStorage.getItem('lynli_admin_token');
    if (token && token !== 'undefined' && token !== 'null') {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        fetchDashboardData();
    } else {
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
