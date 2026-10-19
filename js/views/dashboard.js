import { db } from "../api/db.js";
export async function render(mount) {
  const data = db.get();
  const profit = data.finances.totalRevenue - data.finances.totalCost;
  mount.innerHTML = `
    <div class="kpi-grid">
      <article class="card kpi"><div class="kpi__label">总营收</div><div class="kpi__value">¥ ${data.finances.totalRevenue.toFixed(2)}</div></article>
      <article class="card kpi"><div class="kpi__label">总成本 (1688)</div><div class="kpi__value" style="color:#f87171;">¥ ${data.finances.totalCost.toFixed(2)}</div></article>
      <article class="card kpi"><div class="kpi__label">净利润</div><div class="kpi__value" style="color:#34d399;">¥ ${profit.toFixed(2)}</div></article>
    </div>
    <div class="card" style="margin-top:20px;"><h2>数据大屏已接入真实业务数据，去点点支付和发货，回来看数字变化。</h2></div>
  `;
}
