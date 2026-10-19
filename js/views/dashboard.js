/* 数据看板 · 首个视图示例 */

const KPIS = [
  { label: "今日营收", value: "¥ 12,480", delta: "+8.2%", up: true },
  { label: "今日订单", value: "86", delta: "+5.1%", up: true },
  { label: "待发货", value: "23", delta: "需处理", up: false },
  { label: "在售商品", value: "412", delta: "+12", up: true },
];

export async function render(mount) {
  mount.innerHTML = `
    <div class="kpi-grid">
      ${KPIS.map(kpiCard).join("")}
    </div>

    <div class="panel-grid">
      <section class="card panel">
        <div class="card__head">
          <h2>营收趋势</h2>
          <span>近 7 天</span>
        </div>
        <div class="placeholder">ECharts 折线图接入位</div>
      </section>

      <section class="card panel">
        <div class="card__head">
          <h2>订单状态</h2>
          <span>实时</span>
        </div>
        <div class="placeholder">ECharts 环形图接入位</div>
      </section>
    </div>`;
}

function kpiCard(k) {
  return `
    <article class="card kpi">
      <div class="kpi__label">${k.label}</div>
      <div class="kpi__value">${k.value}</div>
      <div class="kpi__delta ${k.up ? "" : "is-down"}">${k.delta}</div>
    </article>`;
}
