import { api } from './api.js';
import { renderDashboard } from './views/dashboard.js';
import { renderOrders } from './views/orders.js';
import { renderProducts, renderUsers } from './views/products.js';
import { renderEmail } from './views/email.js';

const contentArea = document.getElementById('page-content');
const breadcrumb = document.getElementById('breadcrumb');

window.handleLogin = () => {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
    switchPage('dashboard');
};

async function switchPage(pageId) {
    // 更新菜单样式
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
        if (pageId === 'users') contentArea.innerHTML = await renderUsers();
        if (pageId === 'email') contentArea.innerHTML = renderEmail();
    } catch (err) {
        contentArea.innerHTML = '<div class="text-red-500">数据加载失败，请检查后端</div>';
    }
}

// 绑定全局事件
window.switchPage = switchPage;

window.doShip = async (trade_no) => {
    const tracking_no = prompt("请输入快递单号:");
    if (tracking_no) {
        await api.shipOrder(trade_no, tracking_no);
        switchPage('orders');
    }
};

window.showMap = (tracking_no) => {
    alert(`正在请求快递100接口获取单号 ${tracking_no} 的轨迹...\n(请在此处集成高德地图 Web SDK 渲染路线)`);
};

window.sendBroadcast = async () => {
    const subject = document.getElementById('email-subject').value;
    const content = document.getElementById('email-content').value;
    if (!subject || !content) return alert("请填写完整");
    
    if(confirm("确定发送给所有注册用户吗？")) {
        await api.broadcastEmail(subject, content);
        alert("群发任务已提交至后台，请查看服务器终端日志！");
    }
};

// 初始化侧边栏点击事件
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        switchPage(e.currentTarget.dataset.target);
    });
});
