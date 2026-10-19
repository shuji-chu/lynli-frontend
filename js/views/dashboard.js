import { api } from "../api.js";
export async function render(container) {
  container.innerHTML = '<div class="card">加载中...</div>';
  const res = await api.get("/dashboard");
  const d = res.data;
  container.innerHTML = `
    <div class="kpi-grid">
      <div class="card"><div class="kpi-label">今日营收</div><div class="kpi-val" style="color:var(--pri);">¥${d.revenue}</div></div>
      <div class="card"><div class="kpi-label">今日订单</div><div class="kpi-val">${d.orders_today}</div></div>
      <div class="card"><div class="kpi-label">待发货</div><div class="kpi-val" style="color:#f87171;">${d.pending_ship}</div></div>
      <div class="card"><div class="kpi-label">在售商品</div><div class="kpi-val">${d.total_prod}</div></div>
    </div>
  `;
}
