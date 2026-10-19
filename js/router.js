import { fetchOrders, fetchProducts, fetchDrafts } from './api.js';
import { renderOrders, renderProducts, renderDrafts } from './views.js';
import { getRole } from './auth.js';

export async function navigateTo(pageId, element) {
    // 1. 切换 Tab 样式
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`page-${pageId}`).classList.add('active');
    if(element) element.classList.add('active');

    // 2. 拉取数据并渲染
    const container = document.getElementById(`page-${pageId}`);
    const role = getRole();

    if (pageId === 'orders') {
        const res = await fetchOrders();
        if(res.code === 1) {
            document.getElementById('orders-container').innerHTML = renderOrders(res.data, role);
        }
    } 
    else if (pageId === 'products') {
        const res = await fetchProducts();
        if(res.code === 1) {
            document.getElementById('products-container').innerHTML = renderProducts(res.data);
        }
    }
    else if (pageId === 'spider') {
        const res = await fetchDrafts();
        if(res.code === 1) {
            document.getElementById('spider-container').innerHTML = renderDrafts(res.data);
        }
    }
}
