import { api } from './api.js';
import { renderDashboard } from './views/dashboard.js';
import { renderOrders } from './views/orders.js';
import { renderProducts, renderSpider, renderUsers } from './views/products.js';
import { renderFinance } from './views/finance.js';
import { renderMarketing } from './views/marketing.js';
import { renderSettings } from './views/settings.js';

const contentArea = document.getElementById('page-content');
const breadcrumb = document.getElementById('breadcrumb');

window.handleLogin = () => {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
    switchPage('dashboard');
};

async function switchPage(pageId) {
    document.querySelectorAll('.nav-item').forEach(el => {
        if (el.dataset.target === pageId) {
            el.classList.add('bg-blue-600', 'text-white');
            el.classList.remove('hover:bg-slate-800');
            breadcrumb.innerText = `首页 / ${el.innerText.trim()}`;
        } else {
            el.classList.remove('bg-blue-600', 'text-white');
            el.classList.add('hover:bg-slate-800');
        }
    });

    contentArea.innerHTML = '<div class="flex justify-center items-center h-full"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>';

    try {
        if (pageId === 'dashboard') contentArea.innerHTML = await renderDashboard();
        if (pageId === 'orders') contentArea.innerHTML = await renderOrders();
        if (pageId === 'products') contentArea.innerHTML = await renderProducts();
        if (pageId === 'spider') contentArea.innerHTML = await renderSpider();
        if (pageId === 'users') contentArea.innerHTML = await renderUsers();
        if (pageId === 'finance') contentArea.innerHTML = renderFinance();
        if (pageId === 'marketing') contentArea.innerHTML = renderMarketing();
        if (pageId === 'settings') contentArea.innerHTML = renderSettings();
    } catch (err) {
        contentArea.innerHTML = '<div class="text-red-500">数据加载失败，请检查后端接口</div>';
    }
}

window.switchPage = switchPage;

window.doShip = async (trade_no) => {
    const tracking_no = prompt("请输入快递单号:");
    if (tracking_no) { await api.shipOrder(trade_no, tracking_no); switchPage('orders'); }
};

window.showLogistics = (tracking_no) => {
    alert(`正在获取单号 ${tracking_no} 的实时物流轨迹...\n(请在此处接入高德地图 API 渲染物流路线)`);
};

window.startCrawl = async () => {
    const kw = document.getElementById('crawl-kw').value;
    if(!kw) return alert("输入关键词");
    document.getElementById('draft-list').innerHTML = '抓取中...';
    await api.startCrawl(kw);
    setTimeout(() => switchPage('spider'), 3000);
};

window.doPublish = async (id) => {
    const p = prompt("设置零售价:");
    if(p) { await api.publishProduct(id, p); switchPage('spider'); }
};

window.sendBroadcast = async () => {
    const subject = document.getElementById('email-subject').value;
    const content = document.getElementById('email-content').value;
    if (!subject || !content) return alert("请填写完整");
    if(confirm("确定发送给所有会员吗？")) {
        await api.broadcastEmail(subject, content);
        alert("群发任务已提交后台！");
    }
};

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        switchPage(e.currentTarget.dataset.target);
    });
});
