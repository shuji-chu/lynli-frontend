import { renderLayout } from './views/layout.js';
import { routes } from './router.js';

import { render as renderDashboard } from './views/dashboard.js';
import { render as renderAccount } from './views/account.js';
import { render as renderProxy } from './views/proxy.js';
import { render as renderDocs } from './views/docs.js';
import { render as renderCatalog } from './views/catalog.js';

routes['dashboard'].render = renderDashboard;
routes['account'].render = renderAccount;
routes['proxy'].render = renderProxy;
routes['docs'].render = renderDocs;
routes['catalog'].render = renderCatalog;

const appEl = document.getElementById('app');
if (appEl) {
  appEl.innerHTML = renderLayout();
  const contentEl = document.getElementById('content');
  
  const handleHashChange = () => {
    const hash = window.location.hash.replace('#/', '') || 'dashboard';
    const page = routes[hash] ? hash : 'dashboard';
    
    document.getElementById('page-title').innerText = routes[page].title;
    
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.remove('active');
      if(el.getAttribute('data-page') === page) el.classList.add('active');
    });

    if (routes[page] && routes[page].render) {
      routes[page].render(contentEl);
    } else {
      contentEl.innerHTML = `<div style="padding: 20px;">该模块正在建设中...</div>`;
    }
  };

  window.addEventListener('hashchange', handleHashChange);
  
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      const page = el.getAttribute('data-page');
      window.location.hash = `#/${page}`;
    });
  });

  handleHashChange();
}
