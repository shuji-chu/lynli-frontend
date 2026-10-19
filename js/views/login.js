import { toast } from "../ui.js";

export function renderLogin(onLoginSuccess) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="login-container">
      <div class="login-left">
        <h1>LYNLI PRO</h1>
        <div class="login-features">
          <div class="login-feature-item">
            <div class="login-feature-icon">⚡</div>
            <div><b>极致性能</b><br><span style="font-size:12px; color:var(--dim)">原生 ES6 模块化架构，毫秒级响应</span></div>
          </div>
          <div class="login-feature-item">
            <div class="login-feature-icon">🛡️</div>
            <div><b>金融级安全</b><br><span style="font-size:12px; color:var(--dim)">端到端加密，全链路行为审计</span></div>
          </div>
          <div class="login-feature-item">
            <div class="login-feature-icon">🤖</div>
            <div><b>AI 赋能</b><br><span style="font-size:12px; color:var(--dim)">大模型驱动的智能选品与数据分析</span></div>
          </div>
        </div>
        <div style="font-size:12px; color:var(--dim);">© 2024 LYNLI. All Rights Reserved.</div>
      </div>
      
      <div class="login-right">
        <div class="login-form-box">
          <h2>欢迎回来</h2>
          <p>请输入您的凭据以访问管理控制台</p>
          
          <form id="login-form">
            <div class="field">
              <label>账号</label>
              <div class="input-with-icon">
                <input type="text" id="account" value="${localStorage.getItem('saved_account') || 'admin'}" required placeholder="请输入账号">
              </div>
            </div>
            
            <div class="field">
              <label>密码</label>
              <div class="input-with-icon">
                <input type="password" id="password" value="123456" required placeholder="请输入密码">
                <span class="input-icon" id="toggle-pwd">👁️</span>
              </div>
            </div>

            <!-- 滑块验证 -->
            <div class="slider-container" id="slider-box">
              <div class="slider-fill" id="slider-fill"></div>
              <div class="slider-text" id="slider-text">向右滑动以完成安全验证</div>
              <div class="slider-btn" id="slider-btn">→</div>
            </div>

            <div class="login-options">
              <label><input type="checkbox" id="remember-me"> 记住账号</label>
              <a href="javascript:;" style="color:var(--pri); text-decoration:none;">忘记密码？</a>
            </div>

            <button type="submit" class="btn" id="login-btn" style="width:100%; padding:14px; font-size:15px;">登 录</button>
          </form>
        </div>
      </div>
    </div>
  `;

  // 密码可见性切换
  document.getElementById('toggle-pwd').onclick = () => {
    const pwd = document.getElementById('password');
    pwd.type = pwd.type === 'password' ? 'text' : 'password';
  };

  // 滑块拖拽逻辑
  let isDragging = false;
  let isSuccess = false;
  const btn = document.getElementById('slider-btn');
  const fill = document.getElementById('slider-fill');
  const box = document.getElementById('slider-box');
  const text = document.getElementById('slider-text');

  const startDrag = (e) => {
    if (isSuccess) return;
    isDragging = true;
    text.style.opacity = '0';
    e.preventDefault();
  };

  const onDrag = (e) => {
    if (!isDragging || isSuccess) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const boxRect = box.getBoundingClientRect();
    let moveX = clientX - boxRect.left - 25; // 25是按钮一半宽度
    
    if (moveX < 2) moveX = 2;
    if (moveX > boxRect.width - 52) {
      moveX = boxRect.width - 52;
      // 验证成功
      isSuccess = true;
      isDragging = false;
      btn.classList.add('success');
      btn.textContent = '✓';
      text.textContent = '验证通过';
      text.style.opacity = '1';
      text.style.color = '#10b981';
    }
    btn.style.left = `${moveX}px`;
    fill.style.width = `${moveX + 25}px`;
  };

  const stopDrag = () => {
    isDragging = false;
    if (!isSuccess) {
      // 失败回弹
      btn.style.transition = 'left 0.3s';
      fill.style.transition = 'width 0.3s';
      btn.style.left = '2px';
      fill.style.width = '0px';
      setTimeout(() => { btn.style.transition = 'none'; fill.style.transition = 'none'; }, 300);
      text.style.opacity = '1';
    }
  };

  btn.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  btn.addEventListener('touchstart', startDrag, {passive: false});
  document.addEventListener('touchmove', onDrag, {passive: false});
  document.addEventListener('touchend', stopDrag);

  // 表单提交
  document.getElementById('login-form').onsubmit = (e) => {
    e.preventDefault();
    if (!isSuccess) return toast("请先拖动滑块完成验证", "error");
    
    const account = document.getElementById('account').value;
    const remember = document.getElementById('remember-me').checked;
    
    if (remember) localStorage.setItem('saved_account', account);
    else localStorage.removeItem('saved_account');

    const btnLogin = document.getElementById('login-btn');
    btnLogin.textContent = "安全登录中...";
    btnLogin.disabled = true;

    setTimeout(() => {
      toast("登录成功，正在进入系统");
      onLoginSuccess();
    }, 800);
  };
}
