// 高级 Toast 提示
function showToast(msg, icon = 'ℹ️') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.querySelector('.toast-icon').innerText = icon;
    document.getElementById('toast-text').innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// 验证码逻辑
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

function doLogin() {
    const captcha = document.getElementById('captcha-input').value.trim();
    if (!captcha) { showToast('请输入验证码', '⚠️'); return; }
    if (captcha.toUpperCase() !== currentCaptcha.toUpperCase()) {
        showToast('验证码错误，请重试', '❌'); 
        refreshCaptcha(); 
        document.getElementById('captcha-input').value = '';
        return;
    }
    if (document.getElementById('remember-me').checked) {
        localStorage.setItem('lynli_admin', 'true');
    }
    document.getElementById('login-page').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        showToast('欢迎回来，Boss', '👋');
    }, 400);
}

window.onload = function() {
    if (localStorage.getItem('lynli_admin') === 'true') {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
    }
}

function switchTab(pageId, el) {
    document.querySelectorAll('.sub-page').forEach(page => page.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    if (el) {
        document.querySelectorAll('.tab-item').forEach(item => item.classList.remove('active'));
        el.classList.add('active');
    }
}

function doLogout() {
    localStorage.removeItem('lynli_admin');
    location.reload();
}
// Force update
