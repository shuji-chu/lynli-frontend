window.onerror = function(msg) { document.getElementById('app').innerHTML = `<div style="color:#f87171; padding:20px;">报错: ${msg}</div>`; };

import { routes } from "./router.js";
import { renderLayout } from "./views/layout.js";
import { showModal, toast } from "./ui.js";
import { initAICopilot } from "./views/ai-copilot.js";
import { renderLogin } from "./views/login.js";
import { openProfileModal } from "./views/profile.js";

import * as Dashboard from "./views/dashboard.js";
import * as Chat from "./views/chat.js"; // 新引入
import * as Orders from "./views/orders.js";
import * as Aftersales from "./views/aftersales.js";
import * as Products from "./views/products.js";
import * as Spider from "./views/spider.js";
import * as Proxy from "./views/proxy.js";
import * as Purchases from "./views/purchases.js";
import * as Suppliers from "./views/suppliers.js";
import * as Marketing from "./views/marketing.js";
import * as CRM from "./views/crm.js";
import * as Finance from "./views/finance.js";
import * as Logistics from "./views/logistics.js";
import * as Organization from "./views/organization.js";
import * as Roles from "./views/roles.js";
import * as System from "./views/system.js";

const app = document.getElementById("app");
let openTabs = ["dashboard"];
let currentPage = "dashboard";

document.addEventListener('click', () => { document.getElementById('dropdown-menu')?.classList.remove('show'); });

Object.assign(routes.dashboard, { render: Dashboard.render });
Object.assign(routes.chat, { render: Chat.render }); // 注册路由
Object.assign(routes.orders, { render: Orders.render });
Object.assign(routes.aftersales, { render: Aftersales.render });
Object.assign(routes.products, { render: Products.render });
Object.assign(routes.spider, { render: Spider.render });
Object.assign(routes.proxy, { render: Proxy.render });
Object.assign(routes.purchases, { render: Purchases.render });
Object.assign(routes.suppliers, { render: Suppliers.render });
Object.assign(routes.marketing, { render: Marketing.render });
Object.assign(routes.crm, { render: CRM.render });
Object.assign(routes.finance, { render: Finance.render });
Object.assign(routes.logistics, { render: Logistics.render });
Object.assign(routes.organization, { render: Organization.render });
Object.assign(routes.roles, { render: Roles.render });
Object.assign(routes.system, { render: System.render });

function renderTabs() {
  const tabsBar = document.getElementById('tabs-bar');
  if(!tabsBar) return;
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
  content.innerHTML = '<div class="skeleton sk-card"></div>'; 
  
  setTimeout(() => {
    if (routes[page].render) routes[page].render(content);
  }, 50);
}

function renderApp() {
  app.innerHTML = renderLayout();
  initAICopilot(); 
  openTabs = ["dashboard"];
  currentPage = "dashboard";
  
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  document.getElementById('menu-btn').onclick = () => { sidebar.classList.add('open'); overlay.classList.add('show'); };
  overlay.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); };
  
  document.getElementById('fullscreen-btn').onclick = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(e => toast('浏览器不支持全屏', 'error'));
    else document.exitFullscreen();
  };

  document.getElementById('notice-btn').onclick = () => {
    showModal({
      title: "系统通知",
      contentHTML: `<div class="notice-list"><div class="notice-item"><b>客服系统上线</b><p>您有 2 个买家正在等待回复，请及时处理。</p></div></div>`,
      onConfirm: (mask, close) => close()
    });
  };

  document.getElementById('user-profile').onclick = (e) => { e.stopPropagation(); document.getElementById('dropdown-menu').classList.toggle('show'); };
  document.getElementById('logout-btn').onclick = () => renderLogin(renderApp);

  document.getElementById('profile-btn').onclick = () => {
    openProfileModal(() => { renderApp(); switchPage("dashboard"); });
  };

  document.querySelectorAll('.nav-item').forEach(el => { el.onclick = () => switchPage(el.dataset.page); });
  switchPage("dashboard");
}

renderLogin(renderApp);

// 动态挂载 tgx 模块
import { render as renderTgx } from './views/tgx.js';
import { routes } from './router.js';
if (routes['tgx']) routes['tgx'].render = renderTgx;
