import { showModal, toast } from "../ui.js";
export async function render(container) {
  container.innerHTML = `
    <div class="tabs-bar" style="margin-bottom: 15px; border-radius: 8px; padding: 0;">
      <div class="tab-item active" style="border-radius: 8px; border-bottom: 1px solid var(--line);">资金流水</div>
      <div class="tab-item" style="border-radius: 8px; border-bottom: 1px solid var(--line);">提现审核</div>
      <div class="tab-item" style="border-radius: 8px; border-bottom: 1px solid var(--line);">支付配置</div>
    </div>
    
    <div class="table-container" style="overflow-x:auto;">
      <table class="table">
        <thead><tr><th>流水号</th><th>用户</th><th>类型</th><th>金额</th><th>时间</th><th>状态</th></tr></thead>
        <tbody>
          <tr><td>TXN-001</td><td>张三</td><td>购买商品</td><td style="color:#10b981;">+ ¥ 258.00</td><td>2023-10-25 10:00</td><td><span class="badge badge-success">成功</span></td></tr>
          <tr><td>TXN-002</td><td>李四</td><td>申请提现</td><td style="color:#f87171;">- ¥ 100.00</td><td>2023-10-25 11:30</td><td><span class="badge badge-warning">待审核</span></td></tr>
        </tbody>
      </table>
    </div>
  `;
}
