export async function render(container) {
  container.innerHTML = `
    <div class="kpi-grid">
      <div class="card"><div class="kpi-label">代理 IP 总数</div><div class="kpi-val">4,520</div></div>
      <div class="card"><div class="kpi-label">当前存活率</div><div class="kpi-val" style="color:#10b981;">92.5%</div></div>
      <div class="card"><div class="kpi-label">正在运行的爬虫任务</div><div class="kpi-val" style="color:#3b82f6;">18</div></div>
    </div>
    <div class="table-container" style="overflow-x:auto;">
      <table class="table">
        <thead><tr><th>IP 地址</th><th>归属地</th><th>响应延迟</th><th>存活时间</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>112.11.22.33:8080</td><td>浙江杭州 (电信)</td><td>120ms</td><td>2小时</td><td><span class="badge badge-success">存活</span></td><td><a href="javascript:;" style="color:#f87171;">剔除</a></td></tr>
          <tr><td>45.32.11.22:3128</td><td>广东深圳 (移动)</td><td>450ms</td><td>15分钟</td><td><span class="badge badge-success">存活</span></td><td><a href="javascript:;" style="color:#f87171;">剔除</a></td></tr>
          <tr><td>120.11.22.33:80</td><td>北京 (联通)</td><td>-</td><td>-</td><td><span class="badge badge-danger">已失效</span></td><td>清理</td></tr>
        </tbody>
      </table>
    </div>
  `;
}
