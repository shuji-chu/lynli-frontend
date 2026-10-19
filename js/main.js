document.addEventListener('DOMContentLoaded', () => {
    // 密码显示/隐藏切换
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.innerHTML = type === 'password' 
                ? '<i class="fa-regular fa-eye-slash text-lg"></i>' 
                : '<i class="fa-regular fa-eye text-lg"></i>';
        });
    }

    // 表单提交拦截
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            console.log('准备请求后端:', username);
            
            // TODO: 接入你的 API 
            // const response = await fetch('https://spider.lynli.me/api/login', { ... })
        });
    }
});
