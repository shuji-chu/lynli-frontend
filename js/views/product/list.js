import { store } from "../../store/data.js";
import { toast } from "../../components/ui/toast.js";
import { modal } from "../../components/ui/modal.js";
import { fmtMoney } from "../../core/utils.js";

export async function render(m) {
  const d = store.get();
  m.innerHTML = `<div class="card">
    <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
      <h2>商品库</h2>
      <button class="btn btn-primary" id="add-prod">+ 发布新商品</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;">
      ${d.products.map(p => `
        <div style="border:1px solid var(--line);padding:16px;border-radius:8px;background:rgba(255,255,255,0.02);">
          <img src="${p.img||'https://picsum.photos/100'}" style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:12px;">
          <h3 style="margin-bottom:8px;font-size:14px;">${p.title}</h3>
          <p style="font-size:12px;color:var(--dim);margin-bottom:8px;">库存: ${p.stock} | 售价: ${fmtMoney(p.price)}</p>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-sm" style="flex:1;border:1px solid var(--line);background:none;color:var(--text);" onclick="window.editProd('${p.id}')">编辑</button>
            <button class="btn btn-sm" style="flex:1;border:1px solid #f87171;background:none;color:#f87171;" onclick="window.delProd('${p.id}')">下架</button>
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;

  m.querySelector("#add-prod").onclick = () => {
    modal({
      title: "发布新商品",
      content: `
        <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--dim);">商品名称</label><input class="input" id="n-title" placeholder="商品名称"></div>
        <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--dim);">售价</label><input class="input" id="n-price" type="number" placeholder="0.00"></div>
        <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--dim);">初始库存</label><input class="input" id="n-stock" type="number" placeholder="100"></div>
      `,
      onConfirm: () => {
        const title = document.querySelector("#n-title").value;
        if(!title) { toast("名称不能为空","error"); return false; }
        const data = store.get();
        data.products.push({ id: "P" + Date.now(), title, cost: 0, price: Number(document.querySelector("#n-price").value) || 0, stock: Number(document.querySelector("#n-stock").value) || 0, img: "https://picsum.photos/200?random=" + Date.now() });
        store.set(data); toast("发布成功"); render(m); return true;
      }
    });
  };

  window.editProd = (id) => {
    const p = d.products.find(x => x.id === id);
    modal({
      title: "编辑商品信息",
      content: `<div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--dim);">商品名称</label><input class="input" id="e-title" value="${p.title}"></div>
               <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--dim);">售价</label><input class="input" id="e-price" type="number" value="${p.price}"></div>`,
      onConfirm: () => {
        const data = store.get(); const item = data.products.find(x => x.id === id);
        item.title = document.querySelector("#e-title").value;
        item.price = Number(document.querySelector("#e-price").value);
        store.set(data); toast("修改成功"); render(m); return true;
      }
    });
  };

  window.delProd = (id) => {
    if(confirm("确定要下架该商品吗？")) {
      const data = store.get(); data.products = data.products.filter(x => x.id !== id);
      store.set(data); toast("商品已下架"); render(m);
    }
  };
}
