import { showToast } from "../components/toast.js";

export async function render(mount) {
  mount.innerHTML = `
    <div class="card">
      <div class="card__head">
        <div style="display:flex;gap:16px;font-size:14px;">
          <span style="color:var(--primary);font-weight:600;cursor:pointer;border-bottom:2px solid var(--primary);padding-bottom:4px;">全部订单</span>
          <span style="color:var(--text-dim);cursor:pointer;">待发货</span>
        </div>
        <div style="display:flex;gap:10px;">
          <input type="text" class="field__input" placeholder="搜索订单号..." style="width:200px;padding:6px 12px;height:32px;font-size:13px;">
          <button class="btn btn--primary btn--sm" style="width:auto;" id="export-btn">导出数据</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>订单号</th><th>买家</th><th>金额</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr><td><strong>ORD-001</strong></td><td>张三</td><td>¥ 299.00</td><td><span class="status-tag is-warn">待发货</span></td>
                <td><button class="btn btn--outline btn--sm action-btn">去采购</button></td></tr>
            <tr><td><strong>ORD-002</strong></td><td>李四</td><td>¥ 1299.00</td><td><span class="status-tag is-ok">已发货</span></td>
                <td><button class="btn btn--outline btn--sm action-btn">查看物流</button></td></tr>
          </tbody>
        </table>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;">
        <span style="font-size:12px;color:var(--text-faint);">共 2 条记录</span>
        <div class="btn-group">
          <button class="btn btn--outline btn--sm" disabled>上一页</button>
          <button class="btn btn--primary btn--sm">1</button>
          <button class="btn btn--outline btn--sm" disabled>下一页</button>
        </div>
      </div>
    </div>
  `;
  
  mount.querySelector("#export-btn").addEventListener("click", () => showToast("订单导出任务已提交，稍后在消息中心下载", "success"));
  mount.querySelectorAll(".action-btn").forEach(btn => {
    btn.addEventListener("click", () => showToast("正在跳转 1688 采购链接...", "info"));
  });
}
