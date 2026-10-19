export function renderOrders(orders, role) {
    if (orders.length === 0) return '<p style="color:#64748b;">暂无订单数据</p>';
    
    return orders.map(o => {
        const isSuper = role === 'super';
        const actionBtn = o.status === '待发货' 
            ? (isSuper ? `<button class="btn btn-primary" onclick="window.handleShip('${o.trade_no}')">去发货</button>` : `<span style="color:#ef4444;font-size:12px;">无发货权限</span>`)
            : `<span style="color:#10b981;">已发货: ${o.tracking_no}</span>`;

        return `
            <div class="data-card">
                <div class="card-body">
                    <div class="card-row"><span>订单号</span><b>${o.trade_no}</b></div>
                    <div class="card-row"><span>收件人</span><b>${o.receiver} (${o.phone})</b></div>
                    <div class="card-row"><span>地址</span><span style="text-align:right">${o.address}</span></div>
                    <hr style="border:0; border-top:1px solid #eee; margin:10px 0;">
                    <div class="card-row">
                        <span class="price">¥${o.amount}</span>
                        ${actionBtn}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

export function renderProducts(products) {
    if (products.length === 0) return '<p style="color:#64748b;">商品库为空</p>';
    return products.map(p => `
        <div class="data-card">
            <img src="${p.image}" class="card-img">
            <div class="card-body">
                <div style="font-weight:bold; margin-bottom:8px;">${p.name}</div>
                <div class="card-row">
                    <span style="color:#64748b; font-size:12px;">成本: ¥${p.cost_price}</span>
                    <span class="price">售价: ¥${p.price}</span>
                </div>
            </div>
        </div>
    `).join('');
}

export function renderDrafts(drafts) {
    if (drafts.length === 0) return '<p style="color:#64748b;">暂无草稿</p>';
    return drafts.map(d => `
        <div class="data-card">
            <img src="${d.image_url.replace('http://', 'https://')}" class="card-img">
            <div class="card-body">
                <div style="font-weight:bold; margin-bottom:8px; height:42px; overflow:hidden;">${d.title}</div>
                <div class="card-row">
                    <span class="price">进价 ¥${d.price}</span>
                    <button class="btn btn-primary" onclick="window.handlePublish(${d.id})">一键上架</button>
                </div>
            </div>
        </div>
    `).join('');
}
