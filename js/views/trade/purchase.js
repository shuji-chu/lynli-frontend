import { store } from "../../store/data.js";
import { modal } from "../../components/ui/modal.js";
import { toast } from "../../components/ui/toast.js";
import { fmtMoney } from "../../core/utils.js";
export async function render(m) {
  const d = store.get(); const pending = d.purchases.filter(p => p.status === "pending");
  m.innerHTML = `<div class="card"><h2>待采购单 (${pending.length})</h2><table class="table">
    <thead><tr><th>采购单</th><th>商品</th><th>成本</th><th>操作</th></tr></thead>
    <tbody>${pending.map(p => `<tr><td>${p.id}</td><td>${p.title} x${p.count}</td><td>${fmtMoney(p.cost)}</td>
      <td><button class="btn btn-sm btn-primary ship" data-id="${p.id}">录入单号</button></td></tr>`).join('')}</tbody>
  </table></div>`;
  m.querySelectorAll(".ship").forEach(b => b.onclick = (e) => {
    modal({ title: "录入单号", content: `<input class="input" id="tn" placeholder="快递单号">`, onConfirm: () => {
      const tn = document.getElementById("tn").value; if(!tn) return false;
      store.ship(e.target.dataset.id, tn); toast("发货成功，订单状态已变"); render(m); return true;
    }});
  });
}
