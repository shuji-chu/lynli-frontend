import { renderDashboard } from './views/dashboard.js';
import { renderProducts } from './views/products.js';
import { renderOrders } from './views/orders.js';
import { renderSpider } from './views/spider.js';
import { renderSettings } from './views/settings.js';

const routes = { 
    '#dashboard': { title: '数据看板', render: renderDashboard, role: 'all' }, 
    '#products': { title: '商品库', render: renderProducts, role: 'all' }, 
    '#orders': { title: '全部订单', render: renderOrders, role: 'all' }, 
    '#spider': { title: 'AI 智能选品', render: renderSpider, role: 'all' },
    '#settings': { title: '个人设置', render: renderSettings, role: 'all' }
};

async function router() {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href = '/';
    
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');
    if(document.getElementById('my-nickname')) {
        document.getElementById('my-nickname').innerText = user.nickname || '加载中';
        document.getElementById('my-role').innerText = user.role === 'admin' ? '超级管理员' : '普通员工';
        document.getElementById('my-avatar').src = user.avatar || './logo.png';
    }

    const hash = window.location.hash || '#dashboard';
    const route = routes[hash] || routes['#dashboard'];
    if(route.role === 'admin' && user.role !== 'admin') return alert('无权访问');

    document.getElementById('page-title').innerText = route.title;
    document.querySelectorAll('.nav-link').forEach(l => {
        if (l.getAttribute('href') === hash) l.classList.add('bg-blue-600', 'text-white');
        else l.classList.remove('bg-blue-600', 'text-white');
    });

    if (window.innerWidth < 768) {
        document.getElementById('sidebar')?.classList.add('-translate-x-full');
        document.getElementById('sidebar-overlay')?.classList.add('hidden');
    }

    const container = document.getElementById('app-view');
    container.innerHTML = '<div class="flex justify-center items-center h-32 text-blue-500"><i class="fa-solid fa-circle-notch fa-spin text-3xl"></i></div>';
    await route.render(container);
}
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_info');
    window.location.href = '/';
});
