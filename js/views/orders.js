import { api } from "../api.js";
export async function render(container) {
  container.innerHTML = '<div class="card">加载中...</div>';
  try {
    const res = await api.get("/orders");
    if(res.data.length === 0) return container.innerHTML = '<div class="card" style="text-align:center;">暂无订单</div>';
    container.innerHTML = `
      <div class="card" style="overflow-x:auto;">
        <table class="table">
          <thead><tr><th>订单号</th><th>买家</th><th>金额</th><th>状态</th></tr></thead>
          <tbody>${res.data.map(o => `<tr><td>${o.id}</td><td>${o.buyer}</td><td>¥${o.amount}</td><td>${o.status}</td></tr>`).join('')}</tbody>
        </table>
      </div>`;
  } catch(e) { container.innerHTML = '<div class="card" style="color:#f87171;">获取数据失败</div>'; }
}
