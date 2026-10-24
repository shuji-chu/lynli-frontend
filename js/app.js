const API_BASE = "https://api.lynli.me";

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toast-text');
    if (!toast || !text) return;
    toast.className = 'toast show' + (type === 'error' ? ' is-error' : type === 'warning' ? ' is-warning' : '');
    text.innerText = msg;
    clearTimeout(window._toastTimer);
    // 报错信息停留 10 秒
    window._toastTimer = setTimeout(() => { toast.classList.remove('show'); }, type === 'error' ? 10000 : 3000);
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
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email: user, password: pass })
        });

        // 如果服务器返回了错误状态码（如 403, 500, 502），直接抓取响应文本
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`状态码:${res.status} 报错:${errText.substring(0, 30)}`);
        }

        const json = await res.json();
        if (json.code === 1) {
            const token = json.data.token || json.data.auth_data?.auth || json.data.access_token || json.token;
            if (token) {
                localStorage.setItem('lynli_admin_token', token);
                localStorage.setItem('lynli_admin', 'true');
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('main-app').style.display = 'flex';
                showToast('登录成功', 'success');
                // 成功后执行大盘拉取
                if (typeof fetchDashboardData === 'function') fetchDashboardData();
            } else {
                throw new Error('登录成功但无Token');
            }
        } else {
            throw new Error(json.msg || '账号或密码错误');
        }
    } catch(e) {
        // 把真正的错误直接弹出来
        showToast(e.message, 'error');
        if(btn) btn.innerText = '登 录';
    }
}

// 恢复其他必要的基础函数
function refreshCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let res = '';
    for (let i = 0; i < 4; i++) res += chars[Math.floor(Math.random() * 36)];
    const capEl = document.getElementById('captcha-img');
    if (capEl) { capEl.innerText = res; capEl.style.color = '#2563eb'; capEl.style.fontSize = '20px'; capEl.style.fontWeight = 'bold'; }
    const capInput = document.getElementById('captcha-input');
    if (capInput) capInput.value = res;
}

window.onload = function() {
    if (localStorage.getItem('lynli_admin_token')) {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        if (typeof fetchDashboardData === 'function') fetchDashboardData();
    } else {
        document.getElementById('login-page').style.display = 'flex';
        refreshCaptcha();
    }
}
async function fetchDashboardData() {
    const elRev = document.getElementById('dash-revenue');
    if (!elRev) return;
    try {
        const token = localStorage.getItem('lynli_admin_token') || '';
        const res = await fetch(`${API_BASE}/api/v1/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) {
            const json = await res.json();
            if (json.code === 1 && json.data) {
                elRev.innerText = `¥ ${json.data.today_income || '0.00'}`;
                document.getElementById('dash-users').innerText = json.data.total_users || 0;
                document.getElementById('dash-orders').innerText = json.data.today_orders || 0;
            }
        }
    } catch (err) { console.log(err); }
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
                        <td>${item.title}</td>
                        <td>¥ ${item.price}</td>
                        <td>${item.stock}</td>
                        <td><button class="btn btn-ghost btn-sm" onclick="extractAccount('${item.id}')">拿号</button></td>
                    </tr>
                `;
            });
        }
    } catch(e) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:red">网络错误</td></tr>'; }
}

async function extractAccount(productId) {
    const resultBox = document.getElementById('extract-result');
    const dataBox = document.getElementById('extract-data');
    if(!resultBox || !dataBox) return;
    resultBox.style.display = 'block';
    dataBox.innerText = '正在提取...';
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
            dataBox.innerText = '提取失败'; showToast(json.msg || '提取失败', 'error');
        }
    } catch(e) { dataBox.innerText = '网络请求失败'; }
}

function switchTab(pageId, el) {
    document.querySelectorAll('.sub-page').forEach(page => page.classList.remove('active'));
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');
    if (el) { document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active')); el.classList.add('active'); }
    if (pageId === 'accounts') loadAccounts();
}

function doLogout() { localStorage.clear(); location.reload(); }
