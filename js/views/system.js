export async function render(container) {
  container.innerHTML = `
    <div class="card" style="overflow-x:auto;">
      <h3 style="margin-bottom:15px;">系统操作日志</h3>
      <table class="table">
        <thead><tr><th>操作人</th><th>操作行为</th><th>IP 地址</th><th>时间</th></tr></thead>
        <tbody>
          <tr><td>admin</td><td>修改了商品 "高级纯棉短袖" 价格</td><td>112.11.22.33</td><td>2023-10-24 10:00</td></tr>
          <tr><td>admin</td><td>生成了 API Token</td><td>112.11.22.33</td><td>2023-10-24 09:30</td></tr>
        </tbody>
      </table>
    </div>
  `;
}
