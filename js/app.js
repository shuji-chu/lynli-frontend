import { api } from "./api.js";
import { routes } from "./router.js";
import { renderLayout } from "./views/layout.js";
import { showModal, toast } from "./ui.js"; // 引入刚才写的组件

import * as Dashboard from "./views/dashboard.js";
import * as Orders from "./views/orders.js";
import * as Aftersales from "./views/aftersales.js";
import * as Products from "./views/products.js";
import * as Spider from "./views/spider.js";
import * as Purchases from "./views/purchases.js";
import * as Suppliers from "./views/suppliers.js";
import * as Marketing from "./views/marketing.js";
import * as CRM from "./views/crm.js";
import * as Finance from "./views/finance.js";
import * as System from "./views/system.js";

const app = document.getElementById("app");
document.addEventListener('click', () => { document.getElementById('dropdown-menu')?.classList.remove('show'); });

Object.assign(routes.dashboard, { render: Dashboard.render });
Object.assign(routes.orders, { render: Orders.render });
Object.assign(routes.aftersales, { render: Aftersales.render });
Object.assign(routes.products, { render: Products.render });
Object.assign(routes.spider, { render: Spider.render });
Object.assign(routes.purchases, { render: Purchases.render });
Object.assign(routes.suppliers, { render: Suppliers.render });
Object.assign(routes.marketing, { render: Marketing.render });
Object.assign(routes.crm, { render: CRM.render });
Object.assign(routes.finance, { render: Finance.render });
Object.assign(routes.system, { render: System.render });

function renderLogin() {
  app.innerHTML = `
    <div class="login-view">
      <div class="login-box">
        <h1>LYNLI</h1>
        <p>商业级全链路管理系统</p>
        <form id="login-form">
          <div class="field"><label>账号</label><input type="text" name="account" value="admin" required></div>
          <div class="field"><label>密码</label><input type="password" name="password" value="123456" required></div>
          <button type="submit" class="btn" id="login-btn">安全登录</button>
        </form>
      </div>
    </div>
  `;
  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    btn.textContent = "认证中...";
    try {
      const res = await api.post("/auth/login", { account: e.target.account.value, password: e.target.password.value });
      if (res.code === 200) renderApp();
      else alert("失败: " + res.message);
    } catch (err) { renderApp(); } 
    finally { btn.textContent = "安全登录"; }
  };
}

function renderApp() {
  app.innerHTML = renderLayout();
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  
  document.getElementById('menu-btn').onclick = () => { sidebar.classList.add('open'); overlay.classList.add('show'); };
  overlay.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); };
  
  // 全屏逻辑
  document.getElementById('fullscreen-btn').onclick = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  // 下拉菜单
  document.getElementById('user-profile').onclick = (e) => { e.stopPropagation(); document.getElementById('dropdown-menu').classList.toggle('show'); };
  document.getElementById('logout-btn').onclick = renderLogin;

  // 💡 个人中心弹窗逻辑
  document.getElementById('profile-btn').onclick = () => {
    const userInfo = JSON.parse(localStorage.getItem("lynli_user") || '{"name":"系统管理员","avatar":"管"}');
    showModal({
      title: "个人中心设置",
      contentHTML: `
        <div style="display:flex; flex-direction:column; align-items:center; margin-bottom:20px;">
          <div id="modal-avatar-preview" style="width:80px; height:80px; background:linear-gradient(135deg,#3b82f6,#8b5cf6); border-radius:50%; display:grid; place-items:center; font-size:32px; color:#fff; font-weight:bold; margin-bottom:10px;">
            ${userInfo.avatar}
          </div>
          <button class="btn" id="change-avatar-btn" style="width:auto; padding:6px 12px; font-size:12px; background:rgba(255,255,255,0.1); border:1px solid var(--line);">随机生成新头像</button>
        </div>
        <div class="field"><label>修改昵称</label><input type="text" id="m-nickname" value="${userInfo.name}" style="width:100%;"></div>
        <div class="field"><label>登录账号</label><input type="text" value="admin" disabled style="width:100%; color:var(--dim); cursor:not-allowed;"></div>
      `,
      onConfirm: (mask, close) => {
        const newName = mask.querySelector('#m-nickname').value;
        const newAvatar = mask.querySelector('#modal-avatar-preview').textContent.trim();
        
        if (!newName) return toast("昵称不能为空", "error");
        
        // 保存到本地并重新渲染
        localStorage.setItem("lynli_user", JSON.stringify({ name: newName, avatar: newAvatar }));
        close();
        renderApp(); // 重新渲染整个主界面以更新右上角
        toast("个人信息已更新");
      }
    });

    // 随机换头像逻辑
    mask = document.getElementById('app'); // 防止变量冲突
    const avatarBtn = document.querySelector('#change-avatar-btn');
    if (avatarBtn) {
      avatarBtn.onclick = () => {
        const emojis = ['🐱', '🐶', '🦊', '🐻', '🐼', '🚀', '😎', '⚡'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        document.querySelector('#modal-avatar-preview').textContent = randomEmoji;
      };
    }
  };

  // 路由跳转逻辑
  document.querySelectorAll('.nav-item').forEach(el => {
    el.onclick = () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      el.classList.add('active');
      const page = el.dataset.page;
      document.getElementById('page-title').textContent = routes[page].title;
      if (window.innerWidth <= 768) { sidebar.classList.remove('open'); overlay.classList.remove('show'); }
      
      if (routes[page].render) routes[page].render(document.getElementById('content'));
      else document.getElementById('content').innerHTML = `<div class="card">模块开发中...</div>`;
    };
  });

  document.querySelector('.nav-item[data-page="dashboard"]').click();
}

renderLogin();
