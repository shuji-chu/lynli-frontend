import { renderLayout } from './views/layout.js';
import { routes } from './router.js';

// 动态导入所有模块
import { render as renderDashboard } from './views/dashboard.js';
import { render as renderAccount } from './views/account.js';
import { render as renderProxy } from './views/proxy.js';
import { render as renderDocs } from './views/docs.js';

// 绑定渲染函数
routes['dashboard'].render = renderDashboard;
routes['account'].render = renderAccount;
routes['proxy'].render = renderProxy;
routes['docs'].render = renderDocs;

// 初始化应用
const appEl = document.getElementById('app');
if (appEl) {
  appEl.innerHTML = renderLayout();
  
  const contentEl = document.getElementById('content');
  
  // 简单的路由切换逻辑
  const handleHashChange = () => {
    const hash = window.location.hash.replace('#/', '') || 'dashboard';
    const page = routes[hash] ? hash : 'dashboard';
    
    // 更新标题
    document.getElementById('page-title').innerText = routes[page].title;
    
    // 更新左侧菜单高亮
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.remove('active');
      if(el.getAttribute('data-page') === page) el.classList.add('active');
    });

    // 渲染页面
    if (routes[page] && routes[page].render) {
      routes[page].render(contentEl);
    } else {
      contentEl.innerHTML = `<div style="padding: 20px;">该模块正在建设中...</div>`;
    }
  };

  window.addEventListener('hashchange', handleHashChange);
  
  // 监听左侧菜单点击
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      const page = el.getAttribute('data-page');
      window.location.hash = `#/${page}`;
    });
  });

  // 触发初始路由
  handleHashChange();
}
