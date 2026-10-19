import { renderDashboard } from './views/dashboard.js';
import { renderProducts } from './views/products.js';
import { renderOrders } from './views/orders.js';
import { renderSettings } from './views/settings.js';
import { renderUsers } from './views/users.js'; // 新增用户管理

// 大厂级路由表：带权限控制
const routes = {
    '#dashboard': { title: '数据总览', icon: 'fa-chart-pie', render: renderDashboard, roles: ['admin', 'user'] },
    '#products': { title: '商品管理', icon: 'fa-box', render: renderProducts, roles: ['admin', 'user'] },
    '#orders': { title: '订单管理', icon: 'fa-receipt', render: renderOrders, roles: ['admin', 'user'] },
    '#users': { title: '用户与权限', icon: 'fa-users-gear', render: renderUsers, roles: ['admin'] }, // 仅 admin 可见
    '#settings': { title: '个人设置', icon: 'fa-gear', render: renderSettings, roles: ['admin', 'user'] }
};

async function initRouter() {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href = '/';
    
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');

    // 渲染侧边栏菜单（根据权限过滤）
    const navMenu = document.getElementById('nav-menu');
    navMenu.innerHTML = Object.entries(routes).map(([hash, route]) => {
        if (!route.roles.includes(user.role)) return ''; // 无权限直接不渲染
        return `<a href="${hash}" class="nav-link flex items-center px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            <i class="fa-solid ${route.icon} w-6 text-center text-slate-400"></i> ${route.title}
        </a>`;
    }).join('');

    // 渲染底部用户信息
    if(document.getElementById('nav-nickname')) {
        document.getElementById('nav-nickname').innerText = user.nickname;
        document.getElementById('nav-role').innerText = user.role === 'admin' ? '超级管理员' : '普通员工';
        document.getElementById('nav-avatar').src = user.avatar;
    }

    const hash = window.location.hash || '#dashboard';
    const route = routes[hash] || routes['#dashboard'];
    
    if (!route.roles.includes(user.role)) {
        toast('权限不足，拒绝访问', 'error');
        return window.location.hash = '#dashboard';
    }

    document.getElementById('page-title').innerText = route.title;
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('bg-blue-600', l.getAttribute('href') === hash);
        l.classList.toggle('text-white', l.getAttribute('href') === hash);
    });

    if (window.innerWidth < 768) {
        document.getElementById('sidebar')?.classList.add('-translate-x-full');
        document.getElementById('sidebar-overlay')?.classList.add('hidden');
    }

    const container = document.getElementById('app-view');
    container.innerHTML = '<div class="flex justify-center items-center h-32 text-blue-500"><i class="fa-solid fa-circle-notch fa-spin text-3xl"></i></div>';
    
    try { await route.render(container); } catch(e) { container.innerHTML = '<div class="text-red-500 text-center mt-10">页面加载失败</div>'; }
}

window.addEventListener('hashchange', initRouter);
window.addEventListener('DOMContentLoaded', initRouter);
