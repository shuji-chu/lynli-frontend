// 因为你的后端路径自带 /api/v1，这里只写域名
const API_BASE = "https://api.lynli.me";

// 无 emoji 高级 Toast
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
    const elUsers = document.getElementById('dash-users');
    const elOrders = document.getElementById('dash-orders');
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
            elUsers.innerText = data.total_users || 0; // 你的大盘后端返回的是总用户数
            elOrders.innerText = data.today_orders || 0;
        }
    } catch (err) {
        console.error("大盘请求失败:", err);
    }
}

// ========== 账号库（获取真实商品列表） ==========
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
    } catch(e) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--danger)">网络请求失败</td></tr>';
    }
}

// ========== 提取/购买账号 ==========
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
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ product_id: productId }) // 后端需要的是 product_id
        });
        const json = await res.json();
        
        if (json.code === 1) {
            // 你的后端发货返回的数据，如果是账号密码，通常是个对象或字符串
            const accountData = json.data.account || json.data.email || json.data.data || JSON.stringify(json.data);
            dataBox.innerText = accountData;
            showToast('提取成功', 'success');
            loadAccounts(); // 刷新库存
        } else {
            dataBox.innerText = '提取失败';
            showToast(json.msg || '提取失败', 'error');
        }
    } catch(e) {
        dataBox.innerText = '网络请求失败';
        showToast('网络请求异常', 'error');
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
}

function autoFillCaptcha() {
    const capInput = document.getElementById('captcha-input');
    if (capInput) capInput.value = currentCaptcha;
}

async function doLogin() {
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

    const btn = document.querySelector('.btn-primary'); // 登录按钮
    if(btn) btn.innerText = '登录中...';

    try {
        // 你后端的登录路径是 /api/v1/passport/auth/login
        const res = await fetch(`${API_BASE}/api/v1/passport/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user, password: pass }) // 根据 api_auth.py 推测字段
        });
        const json = await res.json();
        
        if (json.code === 1) {
            // 假设返回的 data 里带 token
            const token = json.data.token || (json.data.user && json.data.user.token) || json.token;
            if (token) localStorage.setItem('lynli_admin_token', token);
            localStorage.setItem('lynli_admin', 'true');
            
            document.getElementById('login-page').style.display = 'none';
            document.getElementById('main-app').style.display = 'flex';
            showToast('登录成功', 'success');
            fetchDashboardData();
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
    if (localStorage.getItem('lynli_admin') === 'true') {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
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
    
    if (pageId === 'accounts') {
        loadAccounts(); // 切换到账号库时拉取真实商品
    }
}

function doLogout() {
    localStorage.clear();
    location.reload();
}
