import { showBigScreen } from "./bigscreen.js";

export async function render(container) {
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="font-size: 20px;">老板驾驶舱 👋</h2>
      <button class="btn" id="btn-bigscreen" style="width: auto; padding: 10px 20px; margin: 0; background: linear-gradient(135deg, #8b5cf6, #3b82f6); box-shadow: 0 0 20px rgba(59,130,246,0.5); border-radius: 30px;">
        🚀 开启全屏赛博大屏
      </button>
    </div>
    
    <div class="kpi-grid">
      <div class="card"><div class="kpi-label">今日营收 (实时)</div><div class="kpi-val" style="color:#3b82f6;">¥ 124,500</div></div>
      <div class="card"><div class="kpi-label">今日订单</div><div class="kpi-val">342</div></div>
      <div class="card"><div class="kpi-label">待发货</div><div class="kpi-val" style="color:#f87171;">56</div></div>
      <div class="card"><div class="kpi-label">在售商品</div><div class="kpi-val">1280</div></div>
    </div>

    <!-- 拖拽工作台 -->
    <div style="margin-bottom: 10px; color: var(--dim); font-size: 13px;">💡 提示：卡片支持拖拽自定义排序</div>
    <div class="drag-container" id="drag-container">
      <div class="card drag-item" draggable="true">
        <div class="kpi-label">近 7 日营收趋势</div>
        <div id="chart-line" style="width: 100%; height: 220px;"></div>
      </div>
      <div class="card drag-item" draggable="true">
        <div class="kpi-label">商品类目占比</div>
        <div id="chart-pie" style="width: 100%; height: 220px;"></div>
      </div>
      <div class="card drag-item" draggable="true">
        <div class="kpi-label">快捷功能 / 系统提醒</div>
        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
          <div style="display: flex; justify-content: space-between; font-size: 14px;"><span>待处理售后</span><span class="badge badge-danger">3 笔</span></div>
          <div style="display: flex; justify-content: space-between; font-size: 14px;"><span>库存预警商品</span><span class="badge badge-warning">12 件</span></div>
          <div style="display: flex; justify-content: space-between; font-size: 14px;"><span>待付款采购</span><span class="badge badge-info">5 单</span></div>
        </div>
      </div>
    </div>
  `;

  // 绑定大屏事件
  document.getElementById('btn-bigscreen').onclick = showBigScreen;

  const isLight = document.body.classList.contains('light-mode');
  const textColor = isLight ? '#6b7280' : '#8b97ad';
  const lineColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';

  // 渲染 ECharts
  const lineChart = echarts.init(document.getElementById('chart-line'));
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLine: { lineStyle: { color: lineColor } }, axisLabel: { color: textColor } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: lineColor } }, axisLabel: { color: textColor } },
    series: [{ data: [4200, 6100, 3800, 8500, 5900, 9200, 7400], type: 'line', smooth: true, itemStyle: { color: '#3b82f6' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59,130,246,0.5)' }, { offset: 1, color: 'rgba(59,130,246,0)' }]) } }],
    grid: { left: '10%', right: '5%', top: '10%', bottom: '15%' }
  });

  const pieChart = echarts.init(document.getElementById('chart-pie'));
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', textStyle: { color: textColor } },
    series: [{ type: 'pie', radius: ['40%', '60%'], itemStyle: { borderRadius: 10, borderColor: isLight ? '#fff' : '#111827', borderWidth: 2 }, data: [{ value: 1048, name: '女装' }, { value: 735, name: '男装' }, { value: 580, name: '百货' }] }],
    grid: { top: '5%', bottom: '15%' }
  });

  window.addEventListener('resize', () => { lineChart.resize(); pieChart.resize(); });

  // HTML5 原生拖拽逻辑
  const containerDrag = document.getElementById('drag-container');
  let draggedItem = null;

  containerDrag.querySelectorAll('.drag-item').forEach(item => {
    item.addEventListener('dragstart', function() {
      draggedItem = this;
      setTimeout(() => this.classList.add('dragging'), 0);
    });
    item.addEventListener('dragend', function() {
      this.classList.remove('dragging');
      containerDrag.querySelectorAll('.drag-item').forEach(i => i.classList.remove('drag-over'));
      draggedItem = null;
    });
    item.addEventListener('dragover', function(e) {
      e.preventDefault();
      if (this !== draggedItem) {
        this.classList.add('drag-over');
      }
    });
    item.addEventListener('dragleave', function() {
      this.classList.remove('drag-over');
    });
    item.addEventListener('drop', function() {
      this.classList.remove('drag-over');
      if (this !== draggedItem) {
        let allItems = [...containerDrag.querySelectorAll('.drag-item')];
        let draggedIndex = allItems.indexOf(draggedItem);
        let targetIndex = allItems.indexOf(this);
        if (draggedIndex < targetIndex) {
          this.parentNode.insertBefore(draggedItem, this.nextSibling);
        } else {
          this.parentNode.insertBefore(draggedItem, this);
        }
      }
    });
  });
}
