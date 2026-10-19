import { renderDashboard } from './views/dashboard.js';
import { renderProducts } from './views/products.js';
import { renderOrders } from './views/orders.js';
import { renderSpider } from './views/spider.js';
const appView = document.getElementById('app-view');
const pageTitle = document.getElementById('page-title');
const navLinks = document.querySelectorAll('.nav-link');
if (!localStorage.getItem('lynli_token')) { window.location.href = '/'; }
const routes = {
    '#dashboard': { title: '数据看板', render: renderDashboard },
    '#products': { title: '商品库', render: renderProducts },
    '#orders': { title: '订单管理', render: renderOrders },
    '#spider': { title: 'AI 选品中心', render: renderSpider }
};
async function router() {
    const hash = window.location.hash || '#dashboard';
    const route = routes[hash] || routes['#dashboard'];
    navLinks.forEach(link => {
        if (link.getAttribute('href') === hash) {
            link.classList.add('bg-blue-600', 'text-white', 'shadow-lg', 'shadow-blue-600/30');
            link.classList.remove('text-slate-300');
        } else {
            link.classList.remove('bg-blue-600', 'text-white', 'shadow-lg', 'shadow-blue-600/30');
            link.classList.add('text-slate-300');
        }
    });
    pageTitle.innerText = route.title;
    appView.innerHTML = '<div class="animate-pulse space-y-4"><div class="h-32 bg-slate-200 rounded-2xl w-full"></div><div class="h-64 bg-slate-200 rounded-2xl w-full"></div></div>';
    await route.render(appView);
}
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('lynli_token');
    window.location.href = '/';
});
