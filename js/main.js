import { api } from './api.js';

// 1. 页面一加载，先检查有没有 Token，有就直接进后台！
const token = localStorage.getItem('lynli_token');
if (token) {
    window.location.href = '/dashboard.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const userInput = document.getElementById('username');
    const passInput = document.getElementById('password');
    const rememberCb = document.getElementById('rememberPwd');

    // 2. 如果之前勾选过“记住密码”，自动填充
    const savedUser = localStorage.getItem('lynli_user');
    const savedPass = localStorage.getItem('lynli_pwd');
    if (savedUser && savedPass) {
        userInput.value = savedUser;
        passInput.value = savedPass;
        rememberCb.checked = true;
    }

    // 3. 登录逻辑
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.innerHTML = '登录中...';
        
        try {
            const res = await api.login(userInput.value, passInput.value);
            if (res.code === 200) {
                // 保存 Token
                localStorage.setItem('lynli_token', res.token);
                
                // 如果勾选了记住密码，保存账号密码；没勾选就清除
                if (rememberCb.checked) {
                    localStorage.setItem('lynli_user', userInput.value);
                    localStorage.setItem('lynli_pwd', passInput.value);
                } else {
                    localStorage.removeItem('lynli_user');
                    localStorage.removeItem('lynli_pwd');
                }

                window.location.href = '/dashboard.html';
            } else {
                alert(res.msg || '登录失败');
                btn.innerHTML = '安全登录';
            }
        } catch (err) {
            alert('网络错误，请重试');
            btn.innerHTML = '安全登录';
        }
    });
});
