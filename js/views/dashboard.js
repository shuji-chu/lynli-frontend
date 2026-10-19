import { fmtMoney } from "../core/utils.js";

export async function render(m) {
  m.innerHTML = `<div class="card"><h2>加载中...</h2></div>`;
  try {
    const res = await fetch("https://spider.lynli.me/api/dashboard");
    const json = await res.json();
    const d = json.data;

    m.innerHTML = `<div class="kpi-grid">
      <div class="card kpi"><div class="kpi-label">今日营收</div><div class="kpi-val" style="color:#3b82f6;">${fmtMoney(d.revenue)}</div></div>
      <div class="card kpi"><div class="kpi-label">今日订单</div><div class="kpi-val">${d.orders_today}</div></div>
      <div class="card kpi"><div class="kpi-label">待发货</div><div class="kpi-val" style="color:#f87171;">${d.pending_ship}</div></div>
      <div class="card kpi"><div class="kpi-label">在售商品</div><div class="kpi-val">${d.total_prod}</div></div>
    </div>
    <div class="card" style="margin-top:20px;">
      <h2>系统已接入真实数据库，左侧操作数据实时联动。</h2>
    </div>`;
  } catch (e) {
    m.innerHTML = `<h2>加载失败</h2>`;
  }
}
