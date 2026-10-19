export async function render(container) {
  container.innerHTML = `
    <div class="card" style="overflow-x:auto;">
      <table class="table">
        <thead><tr><th>买家昵称</th><th>消费总额</th><th>订单数</th><th>最后购买时间</th><th>标签</th></tr></thead>
        <tbody>
          <tr><td>爱吃猫的鱼</td><td>¥ 4,520.00</td><td>18</td><td>2023-10-24</td><td><span class="badge badge-warning">高净值</span></td></tr>
          <tr><td>匿名用户_992</td><td>¥ 129.00</td><td>1</td><td>2023-10-20</td><td><span class="badge badge-info">新客</span></td></tr>
        </tbody>
      </table>
    </div>
  `;
}
