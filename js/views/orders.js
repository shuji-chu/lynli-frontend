export function renderOrders(orders) {
    return orders.map(o => `
        <div class="data-card" style="display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; justify-content:space-between;">
                <b>${o.trade_no}</b>
                <span style="color:${o.status==='待发货'?'var(--danger)':'var(--success)'}">${o.status}</span>
            </div>
            <div style="font-size:13px; color:var(--text-sub);">
                收件人: ${o.receiver} (${o.phone})<br>地址: ${o.address}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                <b style="color:var(--danger);font-size:18px;">¥${o.amount}</b>
                ${o.status === '待发货' 
                  ? `<button class="btn btn-blue" onclick="window.doShip('${o.trade_no}')">去发货</button>` 
                  : `<button class="btn btn-outline" onclick="window.showMap('${o.tracking_no}')">查看物流地图</button>`
                }
            </div>
            ${o.tracking_no ? `<div class="map-container" id="map-${o.tracking_no}">等待获取轨迹...</div>` : ''}
        </div>
    `).join('');
}
