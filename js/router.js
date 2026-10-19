import * as dashboard from './views/dashboard.js';
import * as orders from './views/orders.js';
import * as products from './views/products.js';
import * as users from './views/users.js';
import * as spider from './views/spider.js';

export async function switchPage(pageId) {
    document.querySelectorAll('.nav-item').forEach(el => {
        if (el.dataset.target === pageId) el.classList.add('active');
        else el.classList.remove('active');
    });
    if(window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('open');
    }
    document.getElementById('breadcrumb').innerText = {
        dashboard: '数据大盘', orders: '订单与物流', products: '商品库', spider: 'AI 智能选品', users: '会员列表'
    }[pageId] || pageId;

    const content = document.getElementById('page-content');
    content.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;">加载中...</div>';

    try {
        if (pageId === 'dashboard') content.innerHTML = await dashboard.render();
        if (pageId === 'orders') content.innerHTML = await orders.render();
        if (pageId === 'products') content.innerHTML = await products.render();
        if (pageId === 'users') content.innerHTML = await users.render();
        if (pageId === 'spider') content.innerHTML = await spider.render();
    } catch (err) {
        content.innerHTML = `<div style="text-align:center; padding:40px; color:#ef4444;">加载失败: ${err.message}</div>`;
    }
}
