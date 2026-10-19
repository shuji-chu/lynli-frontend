import { api } from './api.js';
if (localStorage.getItem('token')) window.location.href = '/dashboard.html';
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerHTML = '登录中...';
    try {
        const res = await api.login(document.getElementById('username').value, document.getElementById('password').value);
        if (res.code === 200) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user_info', JSON.stringify(res.user));
            window.location.href = '/dashboard.html';
        } else alert(res.msg);
    } catch (err) { alert('网络错误'); }
    btn.innerHTML = '安全登录';
});
