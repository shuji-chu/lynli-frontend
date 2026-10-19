export async function render(container) {
  container.innerHTML = `
    <div class="card" style="margin-bottom: 16px; display: flex; gap: 10px; overflow-x: auto;">
      <button class="btn" style="width:auto; margin:0; padding:6px 16px; background:var(--pri);">全部订单</button>
      <button class="btn" style="width:auto; margin:0; padding:6px 16px; background:rgba(255,255,255,0.05); color:var(--dim);">待发货</button>
      <button class="btn" style="width:auto; margin:0; padding:6px 16px; background:rgba(255,255,255,0.05); color:var(--dim);">已发货</button>
    </div>
    <div class="card" style="overflow-x:auto;">
      <table class="table">
        <thead><tr><th>订单号</th><th>买家</th><th>金额</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>ORD-20231024-001</td><td>张三</td><td>¥ 258.00</td><td><span class="badge badge-warning">待发货</span></td><td><button class="btn" style="width:auto;padding:4px 8px;font-size:12px;margin:0;">去发货</button></td></tr>
          <tr><td>ORD-20231024-002</td><td>李四</td><td>¥ 129.00</td><td><span class="badge badge-success">已完成</span></td><td><a href="javascript:;" style="color:var(--pri);">查看详情</a></td></tr>
        </tbody>
      </table>
    </div>
  `;
}
