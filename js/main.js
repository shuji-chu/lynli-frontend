import { api } from './api.js';
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 登录中...';
            try {
                const data = await api.login(
                    document.getElementById('username').value,
                    document.getElementById('password').value
                );
                if (data.code === 200) {
                    localStorage.setItem('lynli_token', data.token);
                    window.location.href = '/dashboard.html'; 
                } else {
                    alert(data.msg || '登录失败');
                    submitBtn.innerHTML = originalText;
                }
            } catch (err) {
                alert('网络错误，请检查后端是否启动');
                submitBtn.innerHTML = originalText;
            }
        });
    }
});
