import { toast } from "../ui.js";

export function renderLogin(onLoginSuccess) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="login-container">
      <div class="login-left">
        <h1>LYNLI 商业智能系统</h1>
        <p>基于 AI 驱动的无货源电商全链路解决方案，从智能选品、比价采集到自动化铺货，赋能下一代数字商业。</p>
      </div>
      <div class="login-right">
        <div class="login-box-new">
          <h2>欢迎回来</h2>
          <p>登录以进入您的管理控制台</p>
          <form id="login-form">
            <div class="form-group">
              <label>账号</label>
              <div class="input-wrap">
                <input type="text" id="account" value="admin" placeholder="请输入账号" required>
              </div>
            </div>
            <div class="form-group">
              <label>密码</label>
              <div class="input-wrap">
                <input type="password" id="password" value="123456" placeholder="请输入密码" required>
                <span class="pwd-toggle" id="toggle-pwd">👁️</span>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted); margin-bottom: 24px;">
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" checked> 记住我</label>
              <a href="javascript:;" style="color: var(--brand-primary); text-decoration: none;">忘记密码？</a>
            </div>
            <button type="submit" class="login-btn-new" id="btn-login">安全登录</button>
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
    const btn = document.getElementById('btn-login');
    btn.textContent = "正在验证...";
    setTimeout(() => {
      toast("登录成功");
      onLoginSuccess();
    }, 600);
  };
}
