export async function render(mount) {
  mount.innerHTML = `<div class="kpi-grid"><article class="card kpi"><div class="kpi__label">今日营收</div><div class="kpi__value">¥ 12,480</div></article></div><div class="card" style="margin-top:20px;"><div id="chart" style="height:300px;"></div></div>`;
  if (typeof echarts !== 'undefined') { const c = echarts.init(document.getElementById('chart')); c.setOption({ xAxis: { type: 'category', data: ['一','二','三','四','五','六','日'] }, yAxis: { type: 'value' }, series: [{ type: 'line', smooth: true, data: [820, 932, 901, 934, 1290, 1330, 1320], itemStyle: { color: '#3b82f6' } }] }); window.onresize = () => c.resize(); }
}
