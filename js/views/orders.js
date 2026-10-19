export async function render(mount) {
  const orders = [
    { id: "ORD-20231019-001", buyer: "张三", total: 299.00, status: "待发货", date: "2023-10-19 14:20" },
    { id: "ORD-20231019-002", buyer: "李四", total: 1299.00, status: "已发货", date: "2023-10-19 13:10" },
    { id: "ORD-20231019-003", buyer: "王五", total: 89.00, status: "已完成", date: "2023-10-19 10:05" },
    { id: "ORD-20231018-099", buyer: "赵六", total: 450.00, status: "待付款", date: "2023-10-18 22:30" },
  ];

  mount.innerHTML = `
    <div class="card">
      <div class="card__head">
        <div style="display:flex;gap:16px;font-size:14px;">
          <span style="color:var(--primary);font-weight:600;cursor:pointer;border-bottom:2px solid var(--primary);padding-bottom:4px;">全部订单</span>
          <span style="color:var(--text-dim);cursor:pointer;">待发货</span>
          <span style="color:var(--text-dim);cursor:pointer;">已发货</span>
        </div>
        <button class="btn btn--primary btn--sm" style="width:auto;">导出订单</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>订单号</th><th>买家</th><th>金额</th><th>状态</th><th>下单时间</th><th>操作</th></tr></thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td><strong>${o.id}</strong></td>
                <td>${o.buyer}</td>
                <td>¥ ${o.total.toFixed(2)}</td>
                <td>
                  <span class="status-tag ${o.status === '待发货' ? 'is-warn' : o.status === '已发货' ? 'is-ok' : o.status === '待付款' ? 'is-danger' : ''}">${o.status}</span>
                </td>
                <td>${o.date}</td>
                <td><button class="btn btn--outline btn--sm">去 1688 采购</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
