import { api } from "../api.js";
export async function render(container) {
  container.innerHTML = '<div class="card">数据加载中...</div>';
  try {
    const res = await api.get("/dashboard");
    const d = res.data;
    container.innerHTML = `
      <div class="kpi-grid">
        <div class="card"><div class="kpi-label">今日营收</div><div class="kpi-val" style="color:#3b82f6;">¥ ${d.revenue}</div></div>
        <div class="card"><div class="kpi-label">今日订单</div><div class="kpi-val">${d.orders_today}</div></div>
        <div class="card"><div class="kpi-label">待发货</div><div class="kpi-val" style="color:#f87171;">${d.pending_ship}</div></div>
        <div class="card"><div class="kpi-label">在售商品</div><div class="kpi-val">${d.total_prod}</div></div>
      </div>
      <div class="card"><h3 style="margin-bottom:10px;">欢迎回来，系统管理员！</h3><p style="color:var(--dim);">系统运行正常，数据库已连接。</p></div>
    `;
  } catch(e) { container.innerHTML = '<div class="card" style="color:#f87171;">获取数据失败</div>'; }
}
