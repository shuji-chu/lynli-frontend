import { renderDashboard } from './views/dashboard.js';
import { renderProducts } from './views/products.js';
import { renderOrders } from './views/orders.js';
import { renderSpider } from './views/spider.js';

// 扩展路由表
const routes = { 
    '#dashboard': { title: '数据看板', render: renderDashboard }, 
    '#products': { title: '商品库', render: renderProducts }, 
    '#drafts': { title: '抓取草稿箱', render: renderProducts }, // 暂时复用
    '#assets': { title: '素材图库', render: renderProducts },   // 暂时复用
    '#orders': { title: '全部订单', render: renderOrders }, 
    '#purchase': { title: '采购列表', render: renderOrders },  // 暂时复用
    '#aftersales': { title: '售后工单', render: renderOrders },
    '#spider': { title: 'AI 智能选品', render: renderSpider },
    '#logs': { title: '任务运行日志', render: renderSpider },
    '#settings': { title: '店铺设置', render: renderDashboard },
    '#api': { title: 'API 接口配置', render: renderDashboard }
};

async function router() {
    const hash = window.location.hash || '#dashboard';
    const route = routes[hash] || routes['#dashboard'];
    
    // 更新面包屑标题
    document.getElementById('page-title').innerText = route.title;
    
    // 侧边栏高亮
    document.querySelectorAll('.nav-link').forEach(l => {
        if (l.getAttribute('href') === hash) {
            l.classList.add('bg-blue-600', 'text-white', 'shadow-md', 'shadow-blue-500/20');
            l.classList.remove('text-slate-300');
            // 将高亮项里面的图标变白
            const icon = l.querySelector('i');
            if(icon) { icon.classList.remove('text-slate-400'); icon.classList.add('text-white'); }
        } else {
            l.classList.remove('bg-blue-600', 'text-white', 'shadow-md', 'shadow-blue-500/20');
            l.classList.add('text-slate-300');
            const icon = l.querySelector('i');
            if(icon) { icon.classList.add('text-slate-400'); icon.classList.remove('text-white'); }
        }
    });

    // 手机端点击后自动收起侧边栏
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if(sidebar && !sidebar.classList.contains('-translate-x-full')) {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        }
    }

    const container = document.getElementById('app-view');
    container.innerHTML = '<div class="flex justify-center items-center h-full min-h-[50vh] text-slate-400"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500"></i></div>';
    
    try {
        await route.render(container);
    } catch(e) {
        container.innerHTML = '<div class="text-center text-red-500 mt-10">页面渲染失败</div>';
    }
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
