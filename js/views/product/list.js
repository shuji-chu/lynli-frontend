import { toast } from "../../components/ui/toast.js";
import { modal } from "../../components/ui/modal.js";
import { fmtMoney } from "../../core/utils.js";

export async function render(m) {
  m.innerHTML = `<div class="card"><h2>加载中...</h2></div>`;
  const res = await fetch("https://spider.lynli.me/api/products");
  const json = await res.json();
  
  m.innerHTML = `<div class="card">
    <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
      <h2>商品库 (真实数据)</h2>
      <button class="btn btn-primary" id="add-prod">+ 发布新商品</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;">
      ${json.data.map(p => `
        <div style="border:1px solid var(--line);padding:16px;border-radius:8px;background:rgba(255,255,255,0.02);">
          <h3 style="margin-bottom:8px;font-size:14px;">${p.title}</h3>
          <p style="font-size:12px;color:var(--dim);margin-bottom:8px;">库存: ${p.stock} | 售价: ${fmtMoney(p.price)}</p>
        </div>
      `).join('')}
    </div>
  </div>`;

  m.querySelector("#add-prod").onclick = () => {
    modal({
      title: "发布新商品",
      content: `
        <div style="margin-bottom:12px;"><label>名称</label><input class="input" id="n-title"></div>
        <div style="margin-bottom:12px;"><label>售价</label><input class="input" id="n-price" type="number"></div>
        <div style="margin-bottom:12px;"><label>成本</label><input class="input" id="n-cost" type="number"></div>
      `,
      onConfirm: async () => {
        const title = document.querySelector("#n-title").value;
        if(!title) { toast("名称不能为空","error"); return false; }
        await fetch("https://spider.lynli.me/api/products", {
          method: "POST", headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ title, price: Number(document.querySelector("#n-price").value), cost: Number(document.querySelector("#n-cost").value) })
        });
        toast("发布成功"); render(m); return true;
      }
    });
  };
}
