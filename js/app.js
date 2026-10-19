window.onerror = function(msg) { document.getElementById('app').innerHTML = `<div style="color:#f87171; padding:20px;">报错: ${msg}</div>`; };

import { routes } from "./router.js";
import { renderLayout } from "./views/layout.js";
import { showModal, toast } from "./ui.js";
import { initAICopilot } from "./views/ai-copilot.js";
import { renderLogin } from "./views/login.js";

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

document.body.classList.add('light-mode'); // 强制默认明亮模式
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

  document.getElementById('theme-btn').onclick = () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    if(currentPage === 'dashboard') switchPage('dashboard'); 
  };

  document.getElementById('notice-btn').onclick = () => {
    showModal({
      title: "系统通知",
      contentHTML: `
        <div class="notice-list">
          <div class="notice-item"><b>系统升级完成</b><p>V2.0 版本已上线，全新支持 AI 副驾驶功能。</p><div class="notice-time">10分钟前</div></div>
          <div class="notice-item" style="border-left-color:#f87171;"><b>库存预警</b><p>华南仓 3 款商品库存低于 10 件，请及时补货。</p><div class="notice-time">1小时前</div></div>
        </div>
      `,
      onConfirm: (mask, close) => close()
    });
  };

  document.getElementById('user-profile').onclick = (e) => { e.stopPropagation(); document.getElementById('dropdown-menu').classList.toggle('show'); };
  document.getElementById('logout-btn').onclick = () => renderLogin(renderApp);

  document.getElementById('profile-btn').onclick = () => {
    const userInfo = JSON.parse(localStorage.getItem("lynli_user") || '{"name":"系统管理员","avatar":"管"}');
    const hasImg = userInfo.avatar.startsWith('data:image');
    
    showModal({
      title: "个人中心设置",
      contentHTML: `
        <div style="text-align:center; margin-bottom:20px;">
          <label class="upload-avatar-wrap" for="avatar-upload">
            <img id="avatar-img-preview" src="${hasImg ? userInfo.avatar : ''}" style="display:${hasImg ? 'block' : 'none'};">
            <span id="avatar-text" style="display:${hasImg ? 'none' : 'block'};">点击上传<br>头像</span>
          </label>
          <input type="file" id="avatar-upload" accept="image/*" style="display:none;">
        </div>
        <div class="field"><label>修改昵称</label><input type="text" id="m-nickname" value="${userInfo.name}" style="width:100%;"></div>
      `,
      onConfirm: (mask, close) => {
        const newName = mask.querySelector('#m-nickname').value;
        const imgPreview = mask.querySelector('#avatar-img-preview');
        let newAvatar = userInfo.avatar;
        if (imgPreview.src && imgPreview.src.startsWith('data:image')) newAvatar = imgPreview.src;
        if (!newName) return toast("昵称不能为空", "error");
        localStorage.setItem("lynli_user", JSON.stringify({ name: newName, avatar: newAvatar }));
        close(); renderApp(); switchPage("dashboard"); toast("更新成功");
      }
    });

    setTimeout(() => {
      document.getElementById('avatar-upload').onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => {
            const img = document.getElementById('avatar-img-preview');
            img.src = re.target.result;
            img.style.display = 'block';
            document.getElementById('avatar-text').style.display = 'none';
          };
          reader.readAsDataURL(file);
        }
      };
    }, 100);
  };

  document.querySelectorAll('.nav-item').forEach(el => { el.onclick = () => switchPage(el.dataset.page); });
  switchPage("dashboard");
}

// 启动入口
renderLogin(renderApp);
