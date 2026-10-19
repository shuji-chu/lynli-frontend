import { showToast } from "../components/toast.js";
export async function render(mount) {
  mount.innerHTML = `<div class="card"><div class="card__head"><h2>全部订单</h2><button class="btn btn--primary btn--sm" id="export">导出</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>订单号</th><th>买家</th><th>状态</th></tr></thead><tbody><tr><td>ORD-001</td><td>张三</td><td><span class="status-tag is-ok">已发货</span></td></tr></tbody></table></div></div>`;
  mount.querySelector("#export").onclick = () => showToast("导出成功");
}
