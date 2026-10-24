(function () {
  // 获取 DOM
  const pageLogin = document.getElementById('page-login');
  const pageAdmin = document.getElementById('page-admin');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const inputUser = document.getElementById('login-user');
  const inputPass = document.getElementById('login-pass');
  const inputCode = document.getElementById('login-code');
  const captchaBox = document.getElementById('captcha-box');
  const rememberMe = document.getElementById('remember-me');

  let currentCaptcha = 'XY8A'; // 默认验证码

  // --- 1. 验证码生成逻辑 ---
  function generateCaptcha() {
    const chars = 'ABCDEFGHJKMNPQRSTWXYZ23456789';
    let res = '';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    currentCaptcha = res;
    captchaBox.textContent = res;
  }

  // --- 2. 记住密码逻辑 ---
  function initRememberMe() {
    const savedUser = localStorage.getItem('lynli_remember_user');
    const savedPass = localStorage.getItem('lynli_remember_pass');
    if (savedUser && savedPass) {
      inputUser.value = savedUser;
      inputPass.value = savedPass;
      rememberMe.checked = true;
    }
  }

  function handleRememberMe() {
    if (rememberMe.checked) {
      localStorage.setItem('lynli_remember_user', inputUser.value.trim());
      localStorage.setItem('lynli_remember_pass', inputPass.value.trim());
    } else {
      localStorage.removeItem('lynli_remember_user');
      localStorage.removeItem('lynli_remember_pass');
    }
  }

  // --- 3. 登录交互 ---
  captchaBox.addEventListener('click', () => {
    inputCode.value = currentCaptcha;
  });

  btnLogin.addEventListener('click', async () => {
    const user = inputUser.value.trim();
    const pass = inputPass.value.trim();
    const code = inputCode.value.trim().toUpperCase();

    if (!user || !pass) return window.toast.error('请输入账号和密码');
    if (!code) return window.toast.error('请输入验证码');
    if (code !== currentCaptcha) {
      window.toast.error('验证码错误');
      generateCaptcha();
      inputCode.value = '';
      return;
    }

    // UI 变更为加载中
    btnLogin.textContent = '登录中...';
    btnLogin.disabled = true;

    try {
      // 模拟请求，后续替换为：await api.post('/login', { user, pass })
      await new Promise(r => setTimeout(r, 600)); 
      
      // 成功逻辑
      window.toast.success('登录成功');
      handleRememberMe();
      
      // 切换界面
      pageLogin.style.display = 'none';
      pageAdmin.style.display = 'flex';
      
      // 加载首屏数据
      loadDashboard();
      
    } catch (e) {
      // 错误已由 api.js 或此处拦截处理
    } finally {
      btnLogin.textContent = '登 录';
      btnLogin.disabled = false;
    }
  });

  btnLogout.addEventListener('click', () => {
    pageAdmin.style.display = 'none';
    pageLogin.style.display = 'flex';
    generateCaptcha();
    inputCode.value = '';
    if (window.toast) window.toast.success('已退出登录');
  });

  // --- 4. 后台 Tab 切换交互 ---
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      // 切换导航选中态
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('is-active'));
      item.classList.add('is-active');

      // 切换内容页
      const targetId = 'content-' + item.dataset.page;
      document.querySelectorAll('.page-content').forEach(page => page.classList.remove('is-active'));
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('is-active');

      // 平滑滑动回顶部
      document.querySelector('.admin-main').scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // --- 5. 数据大盘假数据替换演示 ---
  async function loadDashboard() {
    const el = document.getElementById('metric-accounts');
    if (!el) return;
    
    // 这里是你未来对接真实接口的地方
    try {
      // 真实请求：const res = await api.get('/dashboard');
      // el.textContent = res.data.accounts_sold;
      
      // 暂时用模拟数据演示
      setTimeout(() => {
        el.textContent = '1,248';
      }, 500);
    } catch (e) {
      el.textContent = '—';
    }
  }

  // --- 6. 初始化 ---
  generateCaptcha();
  initRememberMe();

})();
