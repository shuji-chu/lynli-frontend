import { api } from './api.js';

window.toggleSidebar = () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('open');
};

// 密码显隐切换
window.togglePassword = () => {
    const pwdInput = document.getElementById('login-pwd');
    const icon = document.getElementById('eye-icon');
    if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        icon.style.color = '#3b82f6';
    } else {
        pwdInput.type = 'password';
        icon.style.color = '#64748b';
    }
};

// 初始化：读取记住的密码
window.onload = () => {
    const savedUser = localStorage.getItem('lynli_user');
    const savedPwd = localStorage.getItem('lynli_pwd');
    if (savedUser && savedPwd) {
        document.getElementById('login-user').value = savedUser;
        document.getElementById('login-pwd').value = savedPwd;
    }
};

window.handleLogin = () => {
    const user = document.getElementById('login-user').value;
    const pwd = document.getElementById('login-pwd').value;
    const remember = document.getElementById('remember-pwd').checked;

    // 简单的演示校验，你可以对接后端的登录接口
    if (user === 'admin' && pwd === '123456') {
        if (remember) {
            localStorage.setItem('lynli_user', user);
            localStorage.setItem('lynli_pwd', pwd);
        } else {
            localStorage.removeItem('lynli_user');
            localStorage.removeItem('lynli_pwd');
        }
        
        document.getElementById('login-screen').style.display = 'none';
        switchPage('dashboard');
    } else {
        alert('账号或密码错误！\n演示账号: admin\n演示密码: 123456');
    }
};

window.doPublish = async (id) => {
    const p = prompt("设置零售价:");
    if(p) { await api.post('/api/shop/publish', {id, price: p}); switchPage('spider'); }
};

window.doShip = async (trade_no) => {
    const t = prompt("请输入快递单号:"); 
    if(t){ await api.post('/api/shop/ship', {trade_no, tracking_no:t}); switchPage('orders'); }
};

window.startCrawl = async () => {
    const kw = document.getElementById('crawl-kw').value;
    if(!kw) return alert('请输入关键词');
    document.getElementById('draft-list').innerHTML = '<div style="text-align:center; padding:20px; color:#2563eb; font-weight:bold;">正在通过 AI 抓取...</div>';
    await api.post('/api/spider/start', { keyword: kw });
    setTimeout(() => switchPage('spider'), 3000);
};

async function switchPage(pageId) {
    document.querySelectorAll('.nav-item').forEach(el => {
        if (el.dataset.target === pageId) el.classList.add('active');
        else el.classList.remove('active');
    });
    if(window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('open');
    }
    document.getElementById('breadcrumb').innerText = pageId === 'dashboard' ? '数据大盘' : (pageId === 'orders' ? '订单与物流' : (pageId === 'spider' ? 'AI 智能选品' : '商品库'));

    const content = document.getElementById('page-content');
    content.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;">加载数据中...</div>';

    try {
        if (pageId === 'dashboard') {
            const res = await api.get('/api/admin/stats');
            const d = res.data || {sales:0,orders:0,users:0};
            content.innerHTML = `<div class="fade-in">
                <div class="stat-card mb-4">
                    <div class="text-slate-400 text-xs font-medium mb-1">总销售额 (已发货)</div>
                    <div class="text-3xl font-extrabold text-slate-900">¥${d.sales.toLocaleString()}</div>
                    <div class="absolute bottom-0 right-0 w-24 h-24 bg-blue-50 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="stat-card">
                        <div class="text-slate-400 text-xs font-medium mb-1">总订单</div>
                        <div class="text-2xl font-bold text-slate-800">${d.orders}</div>
                    </div>
                    <div class="stat-card">
                        <div class="text-slate-400 text-xs font-medium mb-1">会员总数</div>
                        <div class="text-2xl font-bold text-slate-800">${d.users}</div>
                    </div>
                </div>
                <div class="card h-[300px] p-4" id="ch"></div>
            </div>`;
            setTimeout(()=>{
                let c = echarts.init(document.getElementById('ch'));
                c.setOption({
                    grid: {top: 20, right: 10, bottom: 20, left: 30},
                    tooltip:{trigger:'axis'},
                    xAxis:{type:'category',data:['一','二','三','四','五','六','日'], axisLine:{lineStyle:{color:'#e2e8f0'}}, axisLabel:{color:'#64748b'}},
                    yAxis:{type:'value', splitLine:{lineStyle:{color:'#f1f5f9'}}, axisLabel:{color:'#64748b'}},
                    series:[{data:[150,230,224,218,135,147,260],type:'line',smooth:true, symbolSize:6, itemStyle:{color:'#3b82f6'}, areaStyle:{color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(59,130,246,0.2)'},{offset:1,color:'rgba(59,130,246,0)'}])}}]
                });
            },100);
        } 
        else if (pageId === 'orders') {
            const res = await api.get('/api/shop/orders');
            const orders = res.data || [];
            content.innerHTML = `<div class="fade-in">${
                orders.map(o=>`
                <div class="card">
                    <div class="flex justify-between items-center mb-3">
                        <span class="font-bold text-slate-800 text-sm">${o.trade_no}</span>
                        <span class="text-xs px-2.5 py-1 rounded-md font-medium ${o.status===0?'bg-orange-50 text-orange-600':'bg-green-50 text-green-600'}">${o.status===0?'待发货':'已发货'}</span>
                    </div>
                    <div class="text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg">
                        <p><span class="text-slate-400">收件人：</span>${o.receiver} (${o.phone})</p>
                        <p class="mt-1"><span class="text-slate-400">地址：</span>${o.address}</p>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-xl font-bold text-slate-900">¥${o.total_amount}</span>
                        ${o.status===0?`<button onclick="window.doShip('${o.trade_no}')" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium active:scale-95 transition">去发货</button>`:`<span class="text-xs text-slate-400 font-medium">单号: ${o.tracking_no}</span>`}
                    </div>
                </div>`).join('') || '<div style="text-align:center; padding:40px; color:#94a3b8;">暂无订单</div>'
            }</div>`;
        }
        else if (pageId === 'products') {
            const res = await api.get('/api/shop/products');
            content.innerHTML = `<div class="fade-in">${
                res.data.map(p=>`
                <div class="card flex gap-4 items-center">
                    <img src="${p.image}" class="w-20 h-20 object-cover rounded-xl bg-slate-100">
                    <div class="flex-1">
                        <div class="font-bold text-slate-800 text-sm leading-snug mb-2 line-clamp-2">${p.name}</div>
                        <div class="flex justify-between items-end">
                            <span class="text-xs text-slate-400">成本: ¥${p.cost_price}</span>
                            <span class="font-bold text-slate-900 text-lg">¥${p.price}</span>
                        </div>
                    </div>
                </div>`).join('') || '<div style="text-align:center; padding:40px; color:#94a3b8;">暂无商品</div>'
            }</div>`;
        }
        else if (pageId === 'users') {
            const res = await api.get('/api/admin/users');
            content.innerHTML = `<div class="fade-in">${
                res.data.map(u=>`
                <div class="card flex items-center gap-4">
                    <img src="${u.avatar||'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback'}" class="w-12 h-12 rounded-full bg-slate-100 ring-2 ring-slate-50">
                    <div>
                        <div class="font-bold text-slate-800">${u.nickname||'未命名'}</div>
                        <div class="text-xs text-slate-400 mt-0.5">${u.email}</div>
                    </div>
                </div>`).join('') || '<div style="text-align:center; padding:40px; color:#94a3b8;">暂无用户</div>'
            }</div>`;
        }
        else if (pageId === 'spider') {
            const res = await api.get('/api/spider/list');
            content.innerHTML = `<div class="fade-in">
                <div class="card flex gap-3 p-3">
                    <input type="text" id="crawl-kw" placeholder="输入商品关键词..." class="flex-1 bg-slate-50 border-none px-4 py-3 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-100 transition">
                    <button onclick="window.startCrawl()" class="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium text-sm active:scale-95 transition">抓取</button>
                </div>
                <div id="draft-list">
                    ${(res.data||[]).map(d=>`
                    <div class="card flex gap-4 items-center">
                        <img src="${(d.image_url||'').replace('http://','https://')}" class="w-20 h-20 object-cover rounded-xl bg-slate-100">
                        <div class="flex-1">
                            <div class="font-bold text-slate-800 text-sm leading-snug mb-2 line-clamp-2">${d.title}</div>
                            <div class="flex justify-between items-end">
                                <span class="font-bold text-slate-900">¥${d.price}</span>
                                <button onclick="window.doPublish(${d.id})" class="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition">一键上架</button>
                            </div>
                        </div>
                    </div>`).join('') || '<div style="text-align:center; padding:40px; color:#94a3b8;">暂无草稿</div>'}
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
