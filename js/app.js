// 注意：如果你的接口不是 /api/v1，请修改这里
const API_BASE = "https://api.lynli.me/api/v1";

function showToast(msg, icon = 'ℹ️') {
    const toast = document.getElementById('toast');
    if (!toast) { alert(msg); return; } // 兜底：如果连toast都没了，用原生弹窗
    toast.querySelector('.toast-icon').innerText = icon;
    document.getElementById('toast-text').innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

// 验证码
let currentCaptcha = '';
function refreshCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let res = '';
    for (let i = 0; i < 4; i++) res += chars[Math.floor(Math.random() * 36)];
    currentCaptcha = res;
    const el = document.getElementById('captcha-img');
    if (el) el.innerText = res;
}
refreshCaptcha();

function autoFillCaptcha() {
    const input = document.getElementById('captcha-input');
    if(input) {
        input.value = currentCaptcha;
        showToast('已自动填充验证码', '✨');
    }
}

// 登录逻辑（增强错误捕获）
async function doLogin() {
    const account = document.getElementById('account-input')?.value.trim();
    const password = document.getElementById('password-input')?.value.trim();
    const captcha = document.getElementById('captcha-input')?.value.trim();

    if (!account || !password) { showToast('账号或密码没填', '⚠️'); return; }
    if (!captcha || captcha.toUpperCase() !== currentCaptcha.toUpperCase()) {
        showToast('验证码错误', '❌'); 
        refreshCaptcha(); 
        return;
    }

    showToast('正在连接后端...', '⏳');

    try {
        // 注意：如果后端字段是 account 不是 username，请把下面 username 改掉
        const res = await fetch(`${API_BASE}/user/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            // 尝试发送两种通用字段名兼容
            body: JSON.stringify({ 
                username: account,
                account: account, 
                password: password 
            })
        });

        // 检查 HTTP 状态码
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const json = await res.json();
        console.log("后端返回:", json);

        if (json.code === 1 || json.success || json.code === 200) {
            const token = json.data?.token || json.token;
            if (token) localStorage.setItem('lynli_admin_token', token);
            if (document.getElementById('remember-me')?.checked) {
                localStorage.setItem('lynli_admin', 'true');
            }
            showToast('登录成功', '👋');
            setTimeout(() => {
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('main-app').style.display = 'flex';
                if(typeof fetchDashboardData === 'function') fetchDashboardData(); 
            }, 500);
        } else {
            // 后端返回了错误（比如密码错误）
            showToast(json.msg || json.message || '账号或密码错误', '❌');
        }
    } catch (err) {
        // 捕获网络错误、跨域错误、JSON解析错误
        console.error('登录报错详情:', err);
        let errMsg = '请求失败';
        if (err.message.includes('Failed to fetch')) {
            errMsg = '跨域被拦截或后端服务没开';
        } else {
            errMsg = err.message;
        }
        showToast(`报错: ${errMsg}`, '📡');
    }
}

// 模拟数据大盘请求（先跑通登录再管这个）
async function fetchDashboardData() {
    console.log("准备请求大盘数据...");
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
