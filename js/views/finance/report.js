import { store } from "../../store/data.js";
import { fmtMoney } from "../../core/utils.js";

export async function render(m) {
  const d = store.get();
  const profit = d.finance.revenue - d.finance.cost;
  
  m.innerHTML = `
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);">
      <div class="card kpi"><div class="kpi-label">累计营收</div><div class="kpi-val" style="color:#3b82f6;">${fmtMoney(d.finance.revenue)}</div></div>
      <div class="card kpi"><div class="kpi-label">采购成本 (1688)</div><div class="kpi-val" style="color:#f87171;">${fmtMoney(d.finance.cost)}</div></div>
      <div class="card kpi"><div class="kpi-label">净毛利润</div><div class="kpi-val" style="color:#34d399;">${fmtMoney(profit)}</div></div>
    </div>
    <div class="card" style="margin-top:20px;">
      <h2>收支趋势图</h2>
      <div id="finance-chart" style="height:300px;margin-top:20px;"></div>
    </div>
  `;

  if (typeof echarts !== 'undefined') {
    const chart = echarts.init(m.querySelector("#finance-chart"));
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { textStyle: { color: '#8b97ad' } },
      xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } },
      series: [
        { name: '营收', type: 'line', smooth: true, data: [1200, 2100, 1800, d.finance.revenue, 3200, 4000, 3800], itemStyle: { color: '#3b82f6' } },
        { name: '成本', type: 'line', smooth: true, data: [400, 800, 600, d.finance.cost, 1100, 1500, 1200], itemStyle: { color: '#f87171' } }
      ]
    });
  }
}
