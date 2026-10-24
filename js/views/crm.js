import { toast } from "../ui.js";
// 暴露给模板内联 onclick 使用（替代原生 alert）
window.crmToast = (msg, type) => toast(msg, type || 'info');
export async function render(container) {
  container.innerHTML = `
    <div class="toolbar">
      <div class="toolbar-left">
        <input type="text" class="filter-input" placeholder="搜索昵称/手机号">
        <button class="btn" style="width:auto; padding:8px 16px; margin:0;">查询</button>
      </div>
      <button class="btn" style="width:auto; padding:8px 16px; margin:0;">导出用户数据</button>
    </div>
    <div class="table-container" style="overflow-x:auto;">
      <table class="table">
        <thead><tr><th>用户信息</th><th>会员等级</th><th>账户余额</th><th>消费总额</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr>
            <td><div style="font-weight:bold;">张三 (138****1111)</div><div style="font-size:12px; color:var(--dim);">注册: 2023-01-01</div></td>
            <td><span class="badge badge-warning">黄金VIP</span></td>
            <td style="color:#10b981; font-weight:bold;">¥ 1,250.00</td>
            <td>¥ 8,400.00</td>
            <td><span class="badge badge-success">正常</span></td>
            <td><a href="javascript:;" style="color:var(--pri); margin-right:8px;" onclick="crmToast('调整余额功能开发中')">调整余额</a><a href="javascript:;" style="color:#f87171;" onclick="crmToast('已封禁', 'error')">封禁</a></td>
          </tr>
          <tr>
            <td><div style="font-weight:bold;">李四 (139****2222)</div><div style="font-size:12px; color:var(--dim);">注册: 2023-05-12</div></td>
            <td><span class="badge badge-info">普通会员</span></td>
            <td style="color:#10b981; font-weight:bold;">¥ 0.00</td>
            <td>¥ 120.00</td>
            <td><span class="badge badge-success">正常</span></td>
            <td><a href="javascript:;" style="color:var(--pri); margin-right:8px;">调整余额</a><a href="javascript:;" style="color:#f87171;">封禁</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}
