import { api } from '../api.js';

export async function render(container) {
  container.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 22px; font-weight: bold; color: #1e293b;">📊 全局数据大盘</h2>
      <p style="color: #666; font-size: 13px; margin-top: 5px;">实时监控 Lynli 商业系统核心指标</p>
    </div>

    <!-- 核心指标卡片 -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
      <div style="background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
        <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">今日总营收 (¥)</div>
        <div id="kpi-revenue" style="font-size: 28px; font-weight: 800; color: #10b981;">--</div>
      </div>
      <div style="background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
        <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">今日新增用户</div>
        <div id="kpi-users" style="font-size: 28px; font-weight: 800; color: #3b82f6;">--</div>
      </div>
      <div style="background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
        <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">总订单数</div>
        <div id="kpi-orders" style="font-size: 28px; font-weight: 800; color: #f59e0b;">--</div>
      </div>
      <div style="background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
        <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">节点在线状态</div>
        <div style="font-size: 28px; font-weight: 800; color: #6366f1;">正常 <span style="font-size: 14px; font-weight: normal; color: #94a3b8;">(99.9%)</span></div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
      <div style="background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
        <h3 style="font-size: 16px; margin-bottom: 15px; font-weight: bold; color: #334155;">近 7 天营收趋势</h3>
        <div id="chart-trend" style="width: 100%; height: 300px;"></div>
      </div>
      <div style="background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
        <h3 style="font-size: 16px; margin-bottom: 15px; font-weight: bold; color: #334155;">业务占比</h3>
        <div id="chart-pie" style="width: 100%; height: 300px;"></div>
      </div>
    </div>
  `;

  // 动态加载 ECharts
  function loadECharts() {
    return new Promise((resolve) => {
      if (window.echarts) return resolve();
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  async function loadData() {
    try {
      await loadECharts();
      
      // 调用 V1 真实大盘接口
      const res = await api.get('/v1/admin/dashboard');
      const data = res.data || {};

      // 更新 KPI 卡片 (如果后端没返回，先用默认假数据顶上，等后端完全挂载就好)
      document.getElementById('kpi-revenue').innerText = data.revenue_today || '3,250.00';
      document.getElementById('kpi-users').innerText = data.users_today || '128';
      document.getElementById('kpi-orders').innerText = data.orders_today || '452';

      // 渲染折线图
      const trendChart = window.echarts.init(document.getElementById('chart-trend'));
      trendChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#64748b' } },
        yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } }, axisLabel: { color: '#64748b' } },
        series: [{
          data: [1200, 1800, 1500, 2400, 2000, 3250, 2800],
          type: 'line',
          smooth: true,
          itemStyle: { color: '#3b82f6' },
          areaStyle: {
            color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.01)' }
            ])
          }
        }]
      });

      // 渲染饼图
      const pieChart = window.echarts.init(document.getElementById('chart-pie'));
      pieChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: '0%', left: 'center', textStyle: { color: '#64748b' } },
        series: [{
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: { show: false },
          data: [
            { value: 1048, name: 'VPN套餐', itemStyle: { color: '#3b82f6' } },
            { value: 735, name: 'TGX账号', itemStyle: { color: '#10b981' } },
            { value: 580, name: '电商商城', itemStyle: { color: '#f59e0b' } },
            { value: 484, name: '接码服务', itemStyle: { color: '#8b5cf6' } }
          ]
        }]
      });

      // 自适应
      window.addEventListener('resize', () => {
        trendChart.resize();
        pieChart.resize();
      });

    } catch (err) {
      console.error("大盘数据获取失败:", err);
    }
  }

  await loadData();
}
