import { store } from "../store/data.js";
import { fmtMoney } from "../core/utils.js";
export async function render(m) {
  const d = store.get(); const profit = d.finance.revenue - d.finance.cost;
  m.innerHTML = `<div class="kpi-grid">
    <div class="card kpi"><div class="kpi-label">总营收</div><div class="kpi-val">${fmtMoney(d.finance.revenue)}</div></div>
    <div class="card kpi"><div class="kpi-label">总成本</div><div class="kpi-val" style="color:#f87171">${fmtMoney(d.finance.cost)}</div></div>
    <div class="card kpi"><div class="kpi-label">净利润</div><div class="kpi-val" style="color:#34d399">${fmtMoney(profit)}</div></div>
  </div><h3>点击左侧订单进行真实业务操作，数据实时联动。</h3>`;
}
