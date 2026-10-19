import { routes } from "./router.js";
import { renderLayout } from "./views/layout.js";
import { showModal, toast } from "./ui.js";
import { initAICopilot } from "./views/ai-copilot.js";

import * as Dashboard from "./views/dashboard.js";
import * as Orders from "./views/orders.js";
import * as Aftersales from "./views/aftersales.js";
import * as Products from "./views/products.js";
import * as Spider from "./views/spider.js";
import * as Purchases from "./views/purchases.js";
import * as Suppliers from "./views/suppliers.js";
import * as Marketing from "./views/marketing.js";
import * as CRM from "./views/crm.js";
import * as Organization from "./views/organization.js";
import * as Finance from "./views/finance.js";
import * as System from "./views/system.js";

const app = document.getElementById("app");
let openTabs = ["dashboard"];
let currentPage = "dashboard";

if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-mode');
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
Object.assign(routes.organization, { render: Organization.render });
Object.assign(routes.finance, { render: Finance.render });
Object.assign(routes.system, { render: System.render });

function renderTabs() {
  const tabsBar = document.getElementById('tabs-bar');
  tabsBar.innerHTML = openTabs.map(page => `
    <div class="tab-item ${page === currentPage ? 'active' : ''}" data-page="${page}">
      ${routes[page].title}
      ${page === 'dashboard' ? '' : `<span class="tab-close" data-close="${page}">×</span>`}
    </div>
  `).join('');
  tabsBar.querySelectorAll('.tab-item').forEach(tab => {
    tab.onclick = (e) => { if (e.target.classList.contains('tab-close')) return; switchPage(tab.dataset.page); };
  });
  tabsBar.querySelectorAll('.tab-close').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const page = btn.dataset.close;
      openTabs = openTabs.filter(p => p !== page);
      if (currentPage === page) switchPage(openTabs[openTabs.length - 1]);
      else renderTabs();
    };
  });
}

function switchPage(page) {
  currentPage = page;
  if (!openTabs.includes(page)) openTabs.push(page);
  document.getElementById('page-title').textContent = routes[page].title;
  document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.page === page));
  renderTabs();
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
  }
  
  const content = document.getElementById('content');
  content.innerHTML = '<div class="skeleton sk-card"></div><div class="skeleton sk-card"></div>'; 
  
  setTimeout(() => {
    if (routes[page].render) routes[page].render(content);
  }, 150);
}

function renderLogin() {
  app.innerHTML = `
    <div class="login-view">
      <div class="login-box">
        <h1>LYNLI OS</h1><p>未来级商业智能系统</p>
        <form id="login-form">
          <div class="field"><label>账号</label><input type="text" name="account" value="admin" required></div>
          <div class="field"><label>密码</label><input type="password" name="password" value="123456" required></div>
          <button type="submit" class="btn" id="login-btn">安全登录</button>
        </form>
      </div>
    </div>
  `;
  document.getElementById('login-form').onsubmit = (e) => { e.preventDefault(); renderApp(); };
}

function renderApp() {
  app.innerHTML = renderLayout();
  initAICopilot(); // 初始化 AI 助手
  
  openTabs = ["dashboard"];
  currentPage = "dashboard";
  
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  document.getElementById('menu-btn').onclick = () => { sidebar.classList.add('open'); overlay.classList.add('show'); };
  overlay.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); };
  
  document.getElementById('fullscreen-btn').onclick = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  document.getElementById('theme-btn').onclick = () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    if(currentPage === 'dashboard') switchPage('dashboard'); 
  };

  document.getElementById('user-profile').onclick = (e) => { e.stopPropagation(); document.getElementById('dropdown-menu').classList.toggle('show'); };
  document.getElementById('logout-btn').onclick = renderLogin;

  document.getElementById('profile-btn').onclick = () => {
    const userInfo = JSON.parse(localStorage.getItem("lynli_user") || '{"name":"系统管理员","avatar":"管"}');
    showModal({
      title: "个人中心设置",
      contentHTML: `
        <div style="display:flex; flex-direction:column; align-items:center; margin-bottom:20px;">
          <div id="modal-avatar-preview" style="width:80px; height:80px; background:linear-gradient(135deg,#3b82f6,#8b5cf6); border-radius:50%; display:grid; place-items:center; font-size:32px; color:#fff; font-weight:bold; margin-bottom:10px;">${userInfo.avatar}</div>
          <button class="btn" id="change-avatar-btn" style="width:auto; padding:6px 12px; font-size:12px; background:rgba(255,255,255,0.1); border:1px solid var(--line);">随机换头像</button>
        </div>
        <div class="field"><label>修改昵称</label><input type="text" id="m-nickname" value="${userInfo.name}" style="width:100%;"></div>
      `,
      onConfirm: (mask, close) => {
        const newName = mask.querySelector('#m-nickname').value;
        const newAvatar = mask.querySelector('#modal-avatar-preview').textContent.trim();
        if (!newName) return toast("昵称不能为空", "error");
        localStorage.setItem("lynli_user", JSON.stringify({ name: newName, avatar: newAvatar }));
        close(); renderApp(); switchPage("dashboard"); toast("更新成功");
      }
    });
    setTimeout(() => {
      document.querySelector('#change-avatar-btn').onclick = () => {
        const emojis = ['🐱', '🐶', '🦊', '🐻', '🐼', '🚀', '😎', '⚡'];
        document.querySelector('#modal-avatar-preview').textContent = emojis[Math.floor(Math.random() * emojis.length)];
      };
    }, 100);
  };

  document.querySelectorAll('.nav-item').forEach(el => { el.onclick = () => switchPage(el.dataset.page); });
  switchPage("dashboard");
}

renderLogin();
