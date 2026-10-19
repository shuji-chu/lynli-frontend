import { db } from "../api/db.js";
import { showModal } from "../components/modal.js";
import { showToast } from "../components/toast.js";
export async function render(mount) {
  const data = db.get();
  const pending = data.purchases.filter(p => p.status === "pending");
  mount.innerHTML = `
    <div class="card">
      <div class="card__head"><h2>待采购单 (${pending.length})</h2></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>采购单</th><th>商品</th><th>数量</th><th>成本</th><th>操作</th></tr></thead>
          <tbody>
            ${pending.length === 0 ? '<tr><td colspan="5" style="text-align:center;">暂无待采购，去订单页面模拟支付试试</td></tr>' : pending.map(p => `
              <tr>
                <td><strong>${p.id}</strong><div style="font-size:11px;">${p.orderId}</div></td>
                <td>${p.productTitle}</td>
                <td>${p.count}</td>
                <td style="color:#f87171;">¥ ${p.cost.toFixed(2)}</td>
                <td><button class="btn btn--primary btn--sm ship-btn" data-id="${p.id}">录入单号发货</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  mount.querySelectorAll(".ship-btn").forEach(b => b.onclick = (e) => {
    const pid = e.target.dataset.id;
    showModal({
      title: "录入物流单号", content: `<input class="field__input" id="tnum" placeholder="输入单号">`,
      onConfirm: () => {
        const num = document.querySelector("#tnum").value;
        if(!num) { showToast("单号不能为空","error"); return false; }
        db.shipPurchase(pid, num);
        showToast("发货成功，订单状态已同步更新");
        render(mount);
        return true;
      }
    });
  });
}
