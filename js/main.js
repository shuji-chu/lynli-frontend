import { switchPage } from './router.js';
import { api } from './api/index.js';

window.switchPage = switchPage;

// 处理发货
window.doShip = async (trade_no) => {
    const no = prompt("请输入快递单号:");
    if(no) { 
        await api.shipOrder(trade_no, no); 
        switchPage('orders', document.querySelector('.tab-btn[data-id="orders"]')); 
    }
};

// 模拟物流地图（对接第三方接口后渲染真实地图）
window.showMap = (tracking_no) => {
    const mapBox = document.getElementById(`map-${tracking_no}`);
    if(mapBox) {
        mapBox.innerHTML = `📍 物流轨迹: 深圳市 -> 广州市 -> 派件中...<br>（此处集成高德/百度地图API后显示地图轨迹）`;
        mapBox.style.color = 'var(--blue)';
    }
};

// 触发抓取
window.startCrawl = async () => {
    const kw = document.getElementById('kw').value;
    if(!kw) return alert("输入关键词");
    document.getElementById('draft-box').innerHTML = '抓取中...';
    await api.startCrawl(kw);
    setTimeout(() => switchPage('spider', document.querySelector('.tab-btn[data-id="spider"]')), 3000);
};

// 上架草稿
window.doPublish = async (id) => {
    const p = prompt("设置零售价:");
    if(p) { await api.publishProduct(id, p); switchPage('spider', document.querySelector('.tab-btn[data-id="spider"]')); }
};

// 初始化
window.onload = () => switchPage('dashboard', document.querySelector('.tab-btn[data-id="dashboard"]'));
