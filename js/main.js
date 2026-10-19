import { login, logout } from './auth.js';
import { navigateTo } from './router.js';
import { shipOrder, startCrawl, publishProduct } from './api.js';

// 登录控制
window.handleLogin = () => {
    const role = document.getElementById('login-role').value;
    login(role);
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    
    // 设置角色 UI
    const badge = document.getElementById('role-badge');
    badge.innerText = role === 'super' ? '超级管理员' : '运营人员';
    badge.className = `role-badge ${role === 'super' ? 'super' : 'op'}`;

    // 初始化进入订单页
    navigateTo('orders', document.querySelector('.tab-btn[data-target="orders"]'));
};

window.handleLogout = () => logout();

// 爬虫触发
window.handleCrawl = async () => {
    const kw = document.getElementById('keyword').value;
    if(!kw) return alert('输入关键词');
    document.getElementById('spider-container').innerHTML = '<p style="color:var(--blue)">抓取中...</p>';
    await startCrawl(kw);
    setTimeout(() => {
        navigateTo('spider', document.querySelector('.tab-btn[data-target="spider"]'));
    }, 3000);
};

// 绑定全局操作函数供 views.js 调用
window.handleShip = async (trade_no) => {
    const tracking_no = prompt("请输入快递单号:");
    if (!tracking_no) return;
    await shipOrder(trade_no, tracking_no);
    navigateTo('orders', document.querySelector('.tab-btn[data-target="orders"]'));
};

window.handlePublish = async (id) => {
    const price = prompt("设置零售价:");
    if(!price) return;
    await publishProduct(id, price);
    navigateTo('spider', document.querySelector('.tab-btn[data-target="spider"]'));
};

// 绑定 Tab 切换
window.switchPage = (pageId, el) => {
    navigateTo(pageId, el);
};

// 检查是否已登录
window.onload = () => {
    const role = localStorage.getItem('lynli_role');
    if (role) {
        document.getElementById('login-role').value = role;
        window.handleLogin();
    }
};
