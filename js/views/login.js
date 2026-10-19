import { toast } from "../ui.js";

export function renderLogin(onLoginSuccess) {
  const app = document.getElementById("app");
  
  // 给 body 加一个专属 class，防止全局样式干扰
  document.body.className = 'login-active-body';

  app.innerHTML = `
    <style>
      /* 彻底清空之前的全局干扰 */
      .login-active-body { background: #eef2f6 !important; overflow: hidden !important; }
      
      /* 高级感渐变色登录大背景 */
      .my-login-wrap { display: flex; height: 100dvh; width: 100vw; background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%) !important; }
      
      /* 左侧标语区 */
      .my-login-left { flex: 1.2; display: flex; flex-direction: column; justify-content: center; padding: 80px; }
      .my-login-left h1 { font-size: 46px; font-weight: 900; background: linear-gradient(90deg, #1e1b4b, #4f46e5); -webkit-background-clip: text; color: transparent; margin-bottom: 20px; }
      .my-login-left p { font-size: 18px; color: #4b5563; line-height: 1.6; max-width: 450px; }
      
      /* 右侧毛玻璃卡片 */
      .my-login-right { width: 500px; display: flex; align-items: center; justify-content: center; padding: 40px; }
      .my-login-card { width: 100%; max-width: 400px; background: rgba(255,255,255,0.85) !important; backdrop-filter: blur(20px); border: 1px solid #fff; border-radius: 24px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); }
      
      /* 输入框 */
      .my-input-group { margin-bottom: 20px; }
      .my-input-group label { display: block; font-size: 13px; font-weight: 600; color: #4b5563; margin-bottom: 8px; }
      .my-input-box { display: flex; align-items: center; background: #fff; border: 1px solid #d1d5db; border-radius: 12px; padding: 0 16px; height: 50px; transition: 0.2s; }
      .my-input-box:focus-within { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37,99,235,0.1); }
      .my-input-box input { flex: 1; border: none; outline: none; background: transparent; font-size: 15px; color: #111827; }
      
      /* 终极核武器：锁死登录按钮颜色 */
      .my-login-btn { width: 100% !important; height: 50px !important; border-radius: 12px !important; border: none !important; background: #2563eb !important; color: #ffffff !important; font-size: 16px !important; font-weight: bold !important; cursor: pointer !important; margin-top: 10px !important; box-shadow: 0 10px 20px -10px rgba(37,99,235,0.5) !important; }
      .my-login-btn:hover { background: #1d4ed8 !important; }
      
      @media (max-width: 900px) {
        .my-login-left { display: none; }
        .my-login-right { width: 100%; padding: 20px; }
        .my-login-card { padding: 30px 20px; }
      }
    </style>

    <div class="my-login-wrap">
      <div class="my-login-left">
        <h1>LYNLI 商业智能系统</h1>
        <p>基于 AI 驱动的无货源电商全链路解决方案，从智能选品、比价采集到自动化铺货，赋能下一代数字商业。</p>
      </div>
      
      <div class="my-login-right">
        <div class="my-login-card">
          <h2 style="font-size: 26px; font-weight: 800; margin-bottom: 8px; color: #111827;">欢迎回来</h2>
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 30px;">登录以进入您的管理控制台</p>
          
          <form id="login-form">
            <div class="my-input-group">
              <label>账号</label>
              <div class="my-input-box">
                <input type="text" id="account" value="admin" placeholder="请输入账号" required>
              </div>
            </div>
            
            <div class="my-input-group">
              <label>密码</label>
              <div class="my-input-box">
                <input type="password" id="password" placeholder="请输入密码" required>
                <span id="toggle-pwd" style="cursor:pointer; color:#9ca3af;">👁️</span>
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #6b7280; margin-bottom: 24px;">
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" checked style="accent-color: #2563eb;"> 记住我</label>
              <a href="javascript:;" style="color: #2563eb; text-decoration: none;">忘记密码？</a>
            </div>
            
            <button type="submit" class="my-login-btn" id="btn-login">安全登录</button>
          </form>
        </div>
      </div>
    </div>
  `;

  document.getElementById('toggle-pwd').onclick = () => {
    const pwd = document.getElementById('password');
    pwd.type = pwd.type === 'password' ? 'text' : 'password';
  };

  document.getElementById('login-form').onsubmit = (e) => {
    e.preventDefault();
    const acc = document.getElementById('account').value;
    const pwd = document.getElementById('password').value;
    
    const savedAuth = JSON.parse(localStorage.getItem('lynli_auth') || '{"acc":"admin","pwd":"123456"}');
    
    const btn = document.getElementById('btn-login');
    btn.textContent = "正在验证...";
    
    setTimeout(() => {
      if (acc === savedAuth.acc && pwd === savedAuth.pwd) {
        toast("验证通过");
        document.body.className = ''; // 登录成功，移除这个页面的干扰 class
        onLoginSuccess();
      } else {
        toast("账号或密码错误", "error");
        btn.textContent = "安全登录";
      }
    }, 600);
  };
}
