import { api } from '../api.js';
export async function render() {
    const res = await api.get('/api/shop/orders');
    const orders = res.data || [];
    return `<div class="fade-in">${
        orders.map(o=>`
        <div class="card">
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                <span style="font-weight:bold; font-size:14px;">${o.trade_no}</span>
                <span style="font-size:12px; padding:2px 8px; border-radius:4px; background:${o.status===0?'#fff7ed':'#f0fdf4'}; color:${o.status===0?'#ea580c':'#16a34a'};">${o.status===0?'待发货':'已发货'}</span>
            </div>
            <div style="font-size:13px; color:#64748b; background:#f8fafc; padding:12px; border-radius:8px; margin-bottom:12px;">
                <p>收件人：${o.receiver} (${o.phone})</p>
                <p style="margin-top:4px;">地址：${o.address}</p>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:18px; font-weight:bold;">¥${o.total_amount}</span>
                ${o.status===0?`<button onclick="window.doShip('${o.trade_no}')" style="background:#2563eb; color:#fff; border:none; padding:8px 16px; border-radius:6px; font-weight:500;">去发货</button>`:`<span style="font-size:12px; color:#94a3b8;">单号: ${o.tracking_no}</span>`}
            </div>
        </div>`).join('') || '暂无订单'
    }</div>`;
}
