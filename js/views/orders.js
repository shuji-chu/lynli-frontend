import { toast, showModal } from "../ui.js";

export async function render(container) {
  container.innerHTML = `
    <div class="toolbar">
      <div class="toolbar-left">
        <input type="text" class="filter-input" placeholder="搜索订单号/买家昵称">
        <button class="btn" style="width:auto; padding:8px 16px; margin:0;">查询</button>
      </div>
    </div>
    <div class="table-container" style="overflow-x:auto;">
      <table class="table">
        <thead><tr><th>订单信息</th><th>买家</th><th>金额</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          ${[1, 2, 3].map(i => `
            <tr>
              <td><div style="font-weight:bold; color:var(--pri);">ORD-2023-00${i}</div><div style="font-size:12px; color:var(--dim);">2023-10-24 10:0${i}</div></td>
              <td>用户_${1000 + i}</td>
              <td style="font-weight:bold;">¥ ${(i * 128.5).toFixed(2)}</td>
              <td>${i === 1 ? '<span class="badge badge-danger">待付款</span>' : (i === 2 ? '<span class="badge badge-warning">待发货</span>' : '<span class="badge badge-success">已完成</span>')}</td>
              <td><a href="javascript:;" class="view-detail" data-id="${i}" style="color:var(--pri);">查看详情</a></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // 注入抽屉容器
  document.body.insertAdjacentHTML('beforeend', `
    <div class="drawer-mask" id="drawer-mask"></div>
    <div class="drawer" id="drawer">
      <div class="drawer-header">
        <h3>订单详情</h3>
        <span class="drawer-close" id="drawer-close">×</span>
      </div>
      <div class="drawer-body" id="drawer-body"></div>
    </div>
  `);

  const drawer = document.getElementById('drawer');
  const mask = document.getElementById('drawer-mask');
  const closeDrawer = () => { drawer.classList.remove('show'); mask.classList.remove('show'); };

  mask.onclick = closeDrawer;
  document.getElementById('drawer-close').onclick = closeDrawer;

  container.querySelectorAll('.view-detail').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      document.getElementById('drawer-body').innerHTML = `
        <div style="margin-bottom: 24px; background: rgba(59,130,246,0.1); padding: 16px; border-radius: 8px;">
          <h4 style="margin-bottom: 10px; color: var(--pri);">基本信息</h4>
          <p style="font-size: 13px; margin-bottom: 5px;">订单号：ORD-2023-00${id}</p>
          <p style="font-size: 13px; margin-bottom: 5px;">下单时间：2023-10-24 10:0${id}</p>
          <p style="font-size: 13px;">总金额：<b style="color: #f87171;">¥ ${(id * 128.5).toFixed(2)}</b></p>
        </div>
        
        <div style="margin-bottom: 24px;">
          <h4 style="margin-bottom: 10px; border-bottom: 1px solid var(--line); padding-bottom: 5px;">商品清单</h4>
          <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <div style="width: 50px; height: 50px; background: #2a3441; border-radius: 4px;"></div>
            <div style="flex: 1;">
              <p style="font-size: 13px;">高级纯棉短袖T恤</p>
              <p style="font-size: 12px; color: var(--dim);">单价: ¥59.00 x 2</p>
            </div>
          </div>
        </div>

        <div>
          <h4 style="margin-bottom: 10px; border-bottom: 1px solid var(--line); padding-bottom: 5px;">物流跟踪</h4>
          <div class="timeline">
            <div class="timeline-item"><span style="color:var(--dim);">10-24 10:05</span> <br> 买家已完成支付，等待发货</div>
            <div class="timeline-item"><span style="color:var(--dim);">10-24 10:00</span> <br> 买家提交订单</div>
          </div>
        </div>
      `;
      drawer.classList.add('show');
      mask.classList.add('show');
    };
  });
}
