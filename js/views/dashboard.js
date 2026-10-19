export function renderDashboard(data) {
    return `
        <div class="card-grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="data-card"><div style="color:var(--text-sub)">总销售额</div><h2>¥ ${data.sales}</h2></div>
            <div class="data-card"><div style="color:var(--text-sub)">总订单数</div><h2>${data.orders}</h2></div>
            <div class="data-card"><div style="color:var(--text-sub)">注册会员</div><h2>${data.users}</h2></div>
        </div>
    `;
}
