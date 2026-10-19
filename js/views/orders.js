import { db } from "../api/db.js";
import { showToast } from "../components/toast.js";
export async function render(mount) {
  const data = db.get();
  mount.innerHTML = `
    <div class="card">
      <div class="card__head"><h2>全部订单</h2><button class="btn btn--outline btn--sm" id="reset">重置数据</button></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>订单号</th><th>买家</th><th>金额</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            ${data.orders.map(o => `
              <tr>
                <td><strong>${o.id}</strong></td>
                <td>${o.buyer}</td>
                <td>¥ ${o.amount.toFixed(2)}</td>
                <td><span class="status-tag ${o.status === 'unpaid' ? 'is-danger' : o.status === 'pending' ? 'is-warn' : 'is-ok'}">${o.status === 'unpaid' ? '待付款' : o.status === 'pending' ? '待发货' : '已发货'}</span></td>
                <td>${o.status === 'unpaid' ? `<button class="btn btn--primary btn--sm pay-btn" data-id="${o.id}">模拟支付</button>` : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  mount.querySelectorAll(".pay-btn").forEach(b => b.onclick = (e) => {
    const res = db.payOrder(e.target.dataset.id);
    if (res.success) { showToast("支付成功！采购单已自动生成"); render(mount); }
    else showToast(res.msg, "error");
  });
  mount.querySelector("#reset").onclick = () => { db.reset(); render(mount); };
}
