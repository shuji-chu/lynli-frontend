import { api } from "../api.js";
export async function render(container) {
  container.innerHTML = '<div class="card">数据加载中...</div>';
  try {
    // 假设真实接口，失败则使用兜底数据
    const res = await api.get("/dashboard").catch(() => ({ data: { revenue: "124,500", orders_today: 342, pending_ship: 56, total_prod: 1280 } }));
    const d = res.data;
    container.innerHTML = `
      <div class="kpi-grid">
        <div class="card"><div class="kpi-label">今日营收</div><div class="kpi-val" style="color:#3b82f6;">¥ ${d.revenue}</div></div>
        <div class="card"><div class="kpi-label">今日订单</div><div class="kpi-val">${d.orders_today}</div></div>
        <div class="card"><div class="kpi-label">待发货</div><div class="kpi-val" style="color:#f87171;">${d.pending_ship}</div></div>
        <div class="card"><div class="kpi-label">在售商品</div><div class="kpi-val">${d.total_prod}</div></div>
      </div>
      <div class="card">
        <h3 style="margin-bottom: 5px;">近 7 日营收趋势</h3>
        <div class="css-chart">
          <div class="chart-bar" style="height: 40%;"><span>4.2k</span></div>
          <div class="chart-bar" style="height: 60%;"><span>6.1k</span></div>
          <div class="chart-bar" style="height: 35%;"><span>3.8k</span></div>
          <div class="chart-bar" style="height: 80%;"><span>8.5k</span></div>
          <div class="chart-bar" style="height: 55%;"><span>5.9k</span></div>
          <div class="chart-bar" style="height: 90%;"><span>9.2k</span></div>
          <div class="chart-bar" style="height: 70%;"><span>7.4k</span></div>
        </div>
      </div>
    `;
  } catch(e) { container.innerHTML = '<div class="card" style="color:#f87171;">获取数据失败</div>'; }
}
