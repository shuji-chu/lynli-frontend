export async function render(container) {
  const isLight = document.body.classList.contains('light-mode');
  const textColor = isLight ? '#6b7280' : '#8b97ad';
  const lineColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';

  container.innerHTML = `
    <div class="kpi-grid">
      <div class="card"><div class="kpi-label">今日营收</div><div class="kpi-val" style="color:#3b82f6;">¥ 124,500</div></div>
      <div class="card"><div class="kpi-label">今日订单</div><div class="kpi-val">342</div></div>
      <div class="card"><div class="kpi-label">待发货</div><div class="kpi-val" style="color:#f87171;">56</div></div>
      <div class="card"><div class="kpi-label">在售商品</div><div class="kpi-val">1280</div></div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 20px;">
      <div class="card" style="height: 300px; padding: 10px;">
        <div id="chart-line" style="width: 100%; height: 100%;"></div>
      </div>
      <div class="card" style="height: 300px; padding: 10px;">
        <div id="chart-pie" style="width: 100%; height: 100%;"></div>
      </div>
    </div>
  `;

  // 渲染折线图
  const lineChart = echarts.init(document.getElementById('chart-line'));
  lineChart.setOption({
    title: { text: '近 7 日营收趋势', textStyle: { color: textColor, fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLine: { lineStyle: { color: lineColor } }, axisLabel: { color: textColor } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: lineColor } }, axisLabel: { color: textColor } },
    series: [{ data: [4200, 6100, 3800, 8500, 5900, 9200, 7400], type: 'line', smooth: true, itemStyle: { color: '#3b82f6' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59,130,246,0.5)' }, { offset: 1, color: 'rgba(59,130,246,0)' }]) } }]
  });

  // 渲染饼图
  const pieChart = echarts.init(document.getElementById('chart-pie'));
  pieChart.setOption({
    title: { text: '商品类目销售占比', textStyle: { color: textColor, fontSize: 14 } },
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', textStyle: { color: textColor } },
    series: [{ name: '类目', type: 'pie', radius: ['40%', '70%'], itemStyle: { borderRadius: 10, borderColor: isLight ? '#fff' : '#111827', borderWidth: 2 }, data: [{ value: 1048, name: '女装' }, { value: 735, name: '男装' }, { value: 580, name: '百货' }, { value: 484, name: '数码' }] }]
  });

  window.addEventListener('resize', () => { lineChart.resize(); pieChart.resize(); });
}
