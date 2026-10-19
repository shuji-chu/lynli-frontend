import { api } from './api/index.js';
import { renderDashboard } from './views/dashboard.js';
import { renderOrders } from './views/orders.js';
import { renderUsers } from './views/users.js';
import { renderProducts, renderDrafts } from './views/products.js';

export async function switchPage(pageId, el) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    if(el) el.classList.add('active');

    const container = document.getElementById('content-' + pageId);
    container.innerHTML = '<p>加载中...</p>';

    if (pageId === 'dashboard') {
        const res = await api.getStats();
        container.innerHTML = renderDashboard(res.data);
    }
    if (pageId === 'orders') {
        const res = await api.getOrders();
        container.innerHTML = `<div class="card-grid">${renderOrders(res.data)}</div>`;
    }
    if (pageId === 'users') {
        const res = await api.getUsers();
        container.innerHTML = renderUsers(res.data);
    }
    if (pageId === 'products') {
        const res = await api.getProducts();
        container.innerHTML = `<div class="card-grid">${renderProducts(res.data)}</div>`;
    }
    if (pageId === 'spider') {
        const res = await api.getSpiderDrafts();
        container.innerHTML = `
            <div class="data-card" style="margin-bottom:20px; display:flex; gap:10px;">
                <input id="kw" type="text" placeholder="商品关键词" style="flex:1; padding:10px; border:1px solid #ddd; border-radius:8px;">
                <button class="btn btn-blue" onclick="window.startCrawl()">抓取</button>
            </div>
            <div class="card-grid" id="draft-box">${renderDrafts(res.data)}</div>
        `;
    }
}
