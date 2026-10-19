import { renderDashboard } from './views/dashboard.js';
import { renderProducts } from './views/products.js';
import { renderOrders } from './views/orders.js';
import { renderSpider } from './views/spider.js';
const routes = { '#dashboard': renderDashboard, '#products': renderProducts, '#orders': renderOrders, '#spider': renderSpider };
async function router() {
    const hash = window.location.hash || '#dashboard';
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('bg-blue-600', l.getAttribute('href') === hash));
    await (routes[hash] || routes['#dashboard'])(document.getElementById('app-view'));
}
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
