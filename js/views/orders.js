import { db } from "../api/db.js";

export async function render(mount) {
  // 从真实数据库读取数据
  const data = db.get();
  const orders = data.orders;

  mount.innerHTML = `
    <div class="card">
      <div class="card__head"><h2>全部订单</h2><button class="btn btn--outline btn--sm" id="reset-btn">重置演示数据</button></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>订单号</th><th>买家</th><th>实付金额</th><th>状态</th></tr></thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td><strong>${o.id}</strong></td>
                <td>${o.buyer}</td>
                <td>¥ ${o.amount.toFixed(2)}</td>
                <td>
                  <span class="status-tag ${o.status === 'pending' ? 'is-warn' : 'is-ok'}">
                    ${o.status === 'pending' ? '待发货' : '已发货'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // 重置按钮：为了让你反复测试
  mount.querySelector("#reset-btn").addEventListener("click", () => {
    localStorage.removeItem("lynli_mock_db");
    render(mount);
  });
}
