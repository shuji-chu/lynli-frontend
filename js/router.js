import { renderDashboard } from './views/dashboard.js';
import { renderProducts } from './views/products.js';
import { renderOrders } from './views/orders.js';
import { renderSpider } from './views/spider.js';

const routes = { 
    '#dashboard': { title: '数据看板', render: renderDashboard }, 
    '#products': { title: '商品库', render: renderProducts }, 
    '#orders': { title: '订单管理', render: renderOrders }, 
    '#spider': { title: 'AI 选品', render: renderSpider } 
};

async function router() {
    const hash = window.location.hash || '#dashboard';
    const route = routes[hash] || routes['#dashboard'];
    
    document.getElementById('page-title').innerText = route.title;
    
    document.querySelectorAll('.nav-link').forEach(l => {
        if (l.getAttribute('href') === hash) {
            l.classList.add('bg-blue-600', 'text-white');
        } else {
            l.classList.remove('bg-blue-600', 'text-white');
        }
    });

    // 如果在手机上，点击菜单后自动收起侧边栏
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if(sidebar && !sidebar.classList.contains('-translate-x-full')) {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        }
    }

    const container = document.getElementById('app-view');
    container.innerHTML = '<div class="flex justify-center items-center h-32 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl"></i></div>';
    
    await route.render(container);
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
