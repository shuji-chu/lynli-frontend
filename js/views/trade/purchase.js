import { modal } from "../../components/ui/modal.js";
import { toast } from "../../components/ui/toast.js";
import { fmtMoney } from "../../core/utils.js";

export async function render(m) {
  m.innerHTML = `<div class="card"><h2>加载中...</h2></div>`;
  const res = await fetch("https://spider.lynli.me/api/purchases");
  const json = await res.json();
  
  m.innerHTML = `<div class="card"><h2>待采购单 (${json.data.length})</h2><table class="table">
    <thead><tr><th>采购单</th><th>商品</th><th>成本</th><th>操作</th></tr></thead>
    <tbody>${json.data.map(p => `<tr><td>${p.id}</td><td>${p.title} x${p.count}</td><td>${fmtMoney(p.cost)}</td>
      <td><button class="btn btn-sm btn-primary ship" data-id="${p.id}">录入单号</button></td></tr>`).join('')}</tbody>
  </table></div>`;

  m.querySelectorAll(".ship").forEach(b => b.onclick = (e) => {
    modal({ title: "录入单号", content: `<input class="input" id="tn" placeholder="快递单号">`, onConfirm: async () => {
      const tn = document.getElementById("tn").value; if(!tn) return false;
      const sRes = await fetch(`https://spider.lynli.me/api/purchases/${e.target.dataset.id}/ship`, {
        method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({tracking: tn})
      });
      const sJson = await sRes.json();
      if(sJson.code === 200) { toast("发货成功"); render(m); return true; }
      return false;
    }});
  });
}
