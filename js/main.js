import { switchPage } from './router.js';
import { api } from './api.js';

window.toggleSidebar = () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('open');
};

window.togglePwd = () => {
    const pwd = document.getElementById('login-pwd');
    const icon = document.getElementById('eye-icon');
    if (pwd.type === 'password') { pwd.type = 'text'; icon.style.color = '#2563eb'; }
    else { pwd.type = 'password'; icon.style.color = '#94a3b8'; }
};

window.showToast = (msg, type = 'success') => {
    const box = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerText = msg;
    box.appendChild(el);
    setTimeout(() => el.remove(), 3000);
};

window.onload = () => {
    const u = localStorage.getItem('lynli_user');
    const p = localStorage.getItem('lynli_pwd');
    if (u && p) {
        document.getElementById('login-user').value = u;
        document.getElementById('login-pwd').value = p;
        document.getElementById('remember-pwd').checked = true;
    }
};

window.handleLogin = () => {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pwd').value;
    const rem = document.getElementById('remember-pwd').checked;

    if (u === 'admin' && p === '123456') {
        if (rem) { localStorage.setItem('lynli_user', u); localStorage.setItem('lynli_pwd', p); }
        else { localStorage.removeItem('lynli_user'); localStorage.removeItem('lynli_pwd'); }
        
        document.getElementById('login-screen').style.display = 'none';
        document.querySelector('.search-box').style.display = 'flex'; // 登录后显示搜索框
        switchPage('dashboard');
    } else {
        showToast('账号或密码错误！', 'error');
    }
};

window.doPublish = async (id) => {
    const p = prompt("设置零售价:");
    if(p) { 
        await api.post('/api/shop/publish', {id, price: p}); 
        showToast('上架成功，已同步源链接'); 
        switchPage('spider'); 
    }
};

window.doShip = async (trade_no) => {
    const t = prompt("请输入快递单号:"); 
    if(t){ 
        await api.post('/api/shop/ship', {trade_no, tracking_no:t}); 
        showToast('发货成功！'); 
        switchPage('orders'); 
    }
};

window.startCrawl = async () => {
    const kw = document.getElementById('crawl-kw').value;
    if(!kw) return showToast('请输入关键词', 'error');
    document.getElementById('draft-list').innerHTML = '<div style="text-align:center; padding:20px; color:#2563eb;">AI 抓取中...</div>';
    await api.post('/api/spider/start', { keyword: kw });
    showToast('抓取指令已下发');
    setTimeout(() => switchPage('spider'), 3000);
};

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        switchPage(e.currentTarget.dataset.target);
    });
});
