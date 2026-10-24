(function () {
  const pageLogin = document.getElementById('page-login');
  const pageAdmin = document.getElementById('page-admin');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const inputUser = document.getElementById('login-user');
  const inputPass = document.getElementById('login-pass');
  const inputCode = document.getElementById('login-code');
  const captchaBox = document.getElementById('captcha-box');
  const rememberMe = document.getElementById('remember-me');

  let currentCaptcha = 'XY8A';

  function generateCaptcha() {
    const chars = 'ABCDEFGHJKMNPQRSTWXYZ23456789';
    let res = '';
    for (let i = 0; i < 4; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    currentCaptcha = res;
    captchaBox.textContent = res;
  }

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

  captchaBox.addEventListener('click', () => { inputCode.value = currentCaptcha; });

  btnLogin.addEventListener('click', async () => {
    const user = inputUser.value.trim();
    const pass = inputPass.value.trim();
    const code = inputCode.value.trim().toUpperCase();

    if (!user || !pass) return window.toast.error('请输入账号和密码');
    if (!code) return window.toast.error('请输入验证码');
    if (code !== currentCaptcha) {
      window.toast.error('验证码错误');
      generateCaptcha(); inputCode.value = ''; return;
    }

    btnLogin.textContent = '登录中...'; btnLogin.disabled = true;

    try {
      // 真实登录请求（替换为你的真实 login 接口，如果后端暂未通，先注释掉这行用 setTimeout 演示）
      // const res = await api.post('/login', { username: user, password: pass });
      // api.setToken(res.token);
      await new Promise(r => setTimeout(r, 500)); // 演示用，等后端好了一删即可
      
      window.toast.success('登录成功');
      handleRememberMe();
      pageLogin.style.display = 'none';
      pageAdmin.style.display = 'flex';
      
      // 进入后台立刻请求真实数据
      loadDashboard();
    } catch (e) {
      // 错误由 api.js 拦截
    } finally {
      btnLogin.textContent = '登 录'; btnLogin.disabled = false;
    }
  });

  btnLogout.addEventListener('click', () => {
    api.setToken('');
    pageAdmin.style.display = 'none';
    pageLogin.style.display = 'flex';
    generateCaptcha(); inputCode.value = '';
  });

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('is-active'));
      item.classList.add('is-active');

      const targetId = 'content-' + item.dataset.page;
      document.querySelectorAll('.page-content').forEach(page => page.classList.remove('is-active'));
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('is-active');

      document.querySelector('.admin-main').scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // ===== 对接真实 API：数据大盘 =====
  async function loadDashboard() {
    const elMetric = document.getElementById('metric-accounts');
    const elDelta = document.getElementById('metric-delta');
    if (!elMetric) return;
    
    elMetric.textContent = '加载中...';
    
    try {
      // 真实请求你交接单里的接口
      const res = await api.get('/admin/dashboard');
      
      // 根据你的接口返回格式调整这里（假设返回 { total_accounts: 100, delta: "12.4%" }）
      // 如果返回结构不同，请在这里修改字段名！
      const data = res.data || res; 
      elMetric.textContent = data.total_accounts || '0';
      if (elDelta) elDelta.textContent = data.delta || '+0%';
      
    } catch (e) {
      // api.js 已经弹了 Toast，这里只需要把 UI 改成失败态
      elMetric.textContent = '—';
      console.error('Dashboard加载失败:', e);
    }
  }

  generateCaptcha();
  initRememberMe();
})();
