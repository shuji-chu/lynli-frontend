let currentCaptcha = '';
function refreshCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let res = '';
    for (let i = 0; i < 4; i++) res += chars[Math.floor(Math.random() * 36)];
    currentCaptcha = res;
    document.getElementById('captcha-img').innerText = res;
}
refreshCaptcha();

function doLogin() {
    const captcha = document.getElementById('captcha-input').value.trim();
    if (captcha.toUpperCase() !== currentCaptcha.toUpperCase()) {
        alert('验证码错误'); refreshCaptcha(); return;
    }
    if (document.getElementById('remember-me').checked) {
        localStorage.setItem('lynli_admin', 'true');
    }
    document.getElementById('login-page').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
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
