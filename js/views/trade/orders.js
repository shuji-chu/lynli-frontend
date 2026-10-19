import { store } from "../../store/data.js";
import { toast } from "../../components/ui/toast.js";
import { fmtMoney } from "../../core/utils.js";
export async function render(m) {
  const d = store.get();
  m.innerHTML = `<div class="card"><h2>全部订单</h2><table class="table">
    <thead><tr><th>订单号</th><th>买家</th><th>金额</th><th>状态</th><th>操作</th></tr></thead>
    <tbody>${d.orders.map(o => `<tr>
      <td>${o.id}</td><td>${o.buyer}</td><td>${fmtMoney(o.amount)}</td>
      <td><span class="tag tag-${o.status}">${o.status}</span></td>
      <td>${o.status === 'unpaid' ? `<button class="btn btn-sm btn-primary pay" data-id="${o.id}">模拟支付</button>` : '-'}</td>
    </tr>`).join('')}</tbody>
  </table></div>`;
  m.querySelectorAll(".pay").forEach(b => b.onclick = (e) => { if(store.pay(e.target.dataset.id)) { toast("支付成功，采购单已生成"); render(m); } });
}
