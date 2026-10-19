import { store } from "../../store/data.js";
import { fmtMoney } from "../../core/utils.js";
export async function render(m) {
  const d = store.get();
  m.innerHTML = `<div class="card"><h2>商品库</h2><div class="grid">${d.products.map(p => `
    <div class="p-card"><h3>${p.title}</h3><p>售价: ${fmtMoney(p.price)}</p><p>库存: ${p.stock}</p></div>
  `).join('')}</div></div>`;
}
