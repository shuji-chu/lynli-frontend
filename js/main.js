import { api } from './api.js';

window.toggleSidebar = () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('open');
};

function toast(msg, isError = false) {
    const box = document.getElementById('toast-box');
    const el = document.createElement('div');
    el.className = 'toast';
    if(isError) el.style.background = '#ef4444';
    el.innerText = msg;
    box.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

window.handleLogin = () => {
    document.getElementById('login-screen').style.display = 'none';
    switchPage('dashboard');
};

window.doPublish = async (id) => {
    const p = prompt("设置零售价:");
    if(p) { await api.post('/api/shop/publish', {id, price: p}); toast('上架成功'); switchPage('spider'); }
};

window.doShip = async (trade_no) => {
    const t = prompt("请输入快递单号:"); 
    if(t){ await api.post('/api/shop/ship', {trade_no, tracking_no:t}); toast('发货成功'); switchPage('orders'); }
};

window.startCrawl = async () => {
    const kw = document.getElementById('crawl-kw').value;
    if(!kw) return toast('请输入关键词', true);
    document.getElementById('draft-list').innerHTML = '<div style="text-align:center; padding:20px; color:#2563eb;">正在抓取数据...</div>';
    await api.post('/api/spider/start', { keyword: kw });
    setTimeout(() => switchPage('spider'), 3000);
};

async function switchPage(pageId) {
    // 菜单高亮
    document.querySelectorAll('.nav-item').forEach(el => {
        if (el.dataset.target === pageId) el.classList.add('active');
        else el.classList.remove('active');
    });
    // 关侧边栏
    if(window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('open');
    }
    document.getElementById('breadcrumb').innerText = pageId.toUpperCase();

    const content = document.getElementById('page-content');
    content.innerHTML = '<div style="text-align:center; padding:40px; color:#64748b;">加载中...</div>';

    try {
        if (pageId === 'dashboard') {
            const res = await api.get('/api/admin/stats');
            const d = res.data || {sales:0,orders:0,users:0};
            content.innerHTML = `<div class="fade-in">
                <div class="card"><div style="color:#64748b; font-size:12px;">总销售额</div><div style="font-size:24px; font-weight:bold; color:#2563eb;">¥${d.sales}</div></div>
                <div class="card"><div style="color:#64748b; font-size:12px;">总订单</div><div style="font-size:24px; font-weight:bold; color:#ea580c;">${d.orders}</div></div>
                <div class="card"><div style="color:#64748b; font-size:12px;">会员数</div><div style="font-size:24px; font-weight:bold;">${d.users}</div></div>
                <div class="card" style="height:250px;" id="ch"></div>
            </div>`;
            setTimeout(()=>{
                let c = echarts.init(document.getElementById('ch'));
                c.setOption({tooltip:{trigger:'axis'},xAxis:{type:'category',data:['一','二','三','四','五','六','日']},yAxis:{type:'value'},series:[{data:[150,230,224,218,135,147,260],type:'line',smooth:true,itemStyle:{color:'#2563eb'}}]});
            },100);
        } 
        else if (pageId === 'orders') {
            const res = await api.get('/api/shop/orders');
            const orders = res.data || [];
            content.innerHTML = `<div class="fade-in">${
                orders.map(o=>`
                <div class="card">
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding-bottom:10px; margin-bottom:10px;">
                        <span style="font-weight:bold; font-size:14px;">${o.trade_no}</span>
                        <span style="font-size:12px; color:${o.status===0?'#ea580c':'#16a34a'};">${o.status===0?'待发货':'已发货'}</span>
                    </div>
                    <div style="font-size:13px; color:#64748b; margin-bottom:10px; line-height:1.5;">
                        收件人：${o.receiver} (${o.phone})<br>地址：${o.address}
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <b style="color:#ef4444; font-size:18px;">¥${o.total_amount}</b>
                        ${o.status===0?`<button onclick="window.doShip('${o.trade_no}')" style="background:#2563eb; color:#fff; border:none; padding:8px 16px; border-radius:6px;">去发货</button>`:`<span style="font-size:12px; color:#64748b;">单号: ${o.tracking_no}</span>`}
                    </div>
                </div>`).join('') || '暂无订单'
            }</div>`;
        }
        else if (pageId === 'products') {
            const res = await api.get('/api/shop/products');
            content.innerHTML = `<div class="fade-in">${
                res.data.map(p=>`
                <div class="card" style="display:flex; gap:12px; padding:12px;">
                    <img src="${p.image}" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:space-between;">
                        <div style="font-weight:bold; font-size:14px; line-height:1.2;">${p.name}</div>
                        <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                            <span style="font-size:12px; color:#94a3b8;">成本:¥${p.cost_price}</span>
                            <b style="color:#ef4444;">¥${p.price}</b>
                        </div>
                    </div>
                </div>`).join('') || '暂无商品'
            }</div>`;
        }
        else if (pageId === 'users') {
            const res = await api.get('/api/admin/users');
            content.innerHTML = `<div class="fade-in">${
                res.data.map(u=>`
                <div class="card" style="display:flex; align-items:center; gap:12px;">
                    <img src="${u.avatar||'https://via.placeholder.com/40'}" style="width:40px; height:40px; border-radius:50%;">
                    <div>
                        <div style="font-weight:bold;">${u.nickname||'未命名'}</div>
                        <div style="font-size:12px; color:#64748b;">${u.email}</div>
                    </div>
                </div>`).join('') || '暂无用户'
            }</div>`;
        }
        else if (pageId === 'spider') {
            const res = await api.get('/api/spider/list');
            content.innerHTML = `<div class="fade-in">
                <div class="card" style="display:flex; gap:10px; padding:12px;">
                    <input type="text" id="crawl-kw" placeholder="输入关键词..." style="flex:1; border:none; background:#f8fafc; padding:10px; border-radius:6px; outline:none;">
                    <button onclick="window.startCrawl()" style="background:#2563eb; color:#fff; border:none; padding:0 16px; border-radius:6px;">抓取</button>
                </div>
                <div id="draft-list">
                    ${(res.data||[]).map(d=>`
                    <div class="card" style="display:flex; gap:12px; padding:12px;">
                        <img src="${(d.image_url||'').replace('http://','https://')}" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">
                        <div style="flex:1; display:flex; flex-direction:column; justify-content:space-between;">
                            <div style="font-weight:bold; font-size:14px; line-height:1.2;">${d.title}</div>
                            <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                                <span style="color:#ef4444; font-weight:bold;">¥${d.price}</span>
                                <button onclick="window.doPublish(${d.id})" style="background:#0f172a; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-size:12px;">上架</button>
                            </div>
                        </div>
                    </div>`).join('') || '<div style="text-align:center; padding:40px; color:#94a3b8;">暂无数据</div>'}
                </div>
            </div>`;
        }
    } catch (err) {
        content.innerHTML = `<div style="text-align:center; padding:40px; color:#ef4444; font-weight:bold;">加载失败: ${err.message}</div>`;
    }
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        switchPage(e.currentTarget.dataset.target);
    });
});
