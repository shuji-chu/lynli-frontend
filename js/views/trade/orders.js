import { toast } from "../../components/ui/toast.js";
import { fmtMoney } from "../../core/utils.js";

export async function render(m) {
  m.innerHTML = `<div class="card"><h2>加载中...</h2></div>`;
  const res = await fetch("https://spider.lynli.me/api/orders");
  const json = await res.json();
  
  m.innerHTML = `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <h2>全部订单 (真实来源)</h2>
      <button class="btn btn-primary" id="mock-btn">+ 真实模拟新订单</button>
    </div>
    <table class="table">
      <thead><tr><th>订单号</th><th>买家</th><th>金额</th><th>状态</th><th>操作</th></tr></thead>
      <tbody>${json.data.map(o => `<tr>
        <td>${o.id}</td><td>${o.buyer}</td><td>${fmtMoney(o.amount)}</td>
        <td><span class="tag tag-${o.status}">${o.status === 'unpaid' ? '待付款' : o.status === 'pending' ? '待发货' : '已发货'}</span></td>
        <td>${o.status === 'unpaid' ? `<button class="btn btn-sm btn-primary pay" data-id="${o.id}">确认付款</button>` : '-'}</td>
      </tr>`).join('')}</tbody>
    </table>
  </div>`;

  m.querySelector("#mock-btn").onclick = async () => {
    const mRes = await fetch("https://spider.lynli.me/api/orders/mock-create", { method: "POST" });
    const mJson = await mRes.json();
    if(mJson.code === 200) { toast(mJson.msg); render(m); } else { toast(mJson.msg, "error"); }
  };

  m.querySelectorAll(".pay").forEach(b => b.onclick = async (e) => {
    e.target.disabled = true;
    const pRes = await fetch(`https://spider.lynli.me/api/orders/${e.target.dataset.id}/pay`, { method: "POST" });
    const pJson = await pRes.json();
    if(pJson.code === 200) { toast(pJson.msg); render(m); }
  });
}
