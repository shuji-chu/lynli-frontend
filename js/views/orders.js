import { api } from "../api.js";
export async function render(container) {
  container.innerHTML = '<div class="card">加载中...</div>';
  const res = await api.get("/orders");
  const list = res.data;
  if(list.length === 0) return container.innerHTML = '<div class="card">暂无订单数据</div>';
  container.innerHTML = `
    <div class="card">
      <table>
        <thead><tr><th>订单号</th><th>买家</th><th>金额</th><th>状态</th></tr></thead>
        <tbody>${list.map(o => `<tr><td>${o.id}</td><td>${o.buyer}</td><td>¥${o.amount}</td><td>${o.status}</td></tr>`).join('')}</tbody>
      </table>
    </div>
  `;
}
