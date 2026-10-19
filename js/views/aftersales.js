export async function render(container) {
  container.innerHTML = `
    <div class="card" style="overflow-x:auto;">
      <table class="table">
        <thead><tr><th>售后单号</th><th>关联订单</th><th>售后类型</th><th>退款金额</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>AS-001</td><td>ORD-001</td><td>仅退款</td><td>¥ 59.00</td><td><span class="badge badge-danger">待处理</span></td><td><a href="javascript:;" style="color:var(--pri);">同意退款</a></td></tr>
          <tr><td>AS-002</td><td>ORD-009</td><td>退货退款</td><td>¥ 129.00</td><td><span class="badge badge-info">退货中</span></td><td><a href="javascript:;" style="color:var(--pri);">查看物流</a></td></tr>
        </tbody>
      </table>
    </div>
  `;
}
