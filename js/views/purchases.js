import { api } from "../api.js";

export async function render(container) {
  // 渲染骨架，显示加载中
  container.innerHTML = '<div class="card">正在获取真实采购数据...</div>';
  
  try {
    // 这里假设你的后端接口是 /purchases，如果不对，请把这里的路径改成你真实的接口
    const res = await api.get("/purchases");
    
    // 假设后端返回格式为 { data: { kpi: {...}, list: [...] } }
    // 如果你后端不是这个结构，请根据实际结构修改下面取值
    const d = res.data || { kpi: {}, list: [] };
    
    const kpi = d.kpi || { pending_pay: 0, pending_ship: 0, today_done: 0 };
    const list = d.list || [];

    container.innerHTML = `
      <div class="kpi-grid">
        <div class="card"><div class="kpi-label">待付款采购</div><div class="kpi-val" style="color:#f87171;">${kpi.pending_pay || 0}</div></div>
        <div class="card"><div class="kpi-label">待发货代发</div><div class="kpi-val" style="color:#eab308;">${kpi.pending_ship || 0}</div></div>
        <div class="card"><div class="kpi-label">今日代发完成</div><div class="kpi-val" style="color:#10b981;">${kpi.today_done || 0}</div></div>
      </div>
      <div class="card" style="overflow-x:auto;">
        <table class="table">
          <thead><tr><th>采购单号</th><th>供应商</th><th>商品数</th><th>总金额</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            ${list.length === 0 ? '<tr><td colspan="6" style="text-align:center;">暂无采购数据</td></tr>' : 
              list.map(item => `
                <tr>
                  <td>${item.order_no || item.id}</td>
                  <td>${item.supplier_name || item.supplier}</td>
                  <td>${item.items_count || 0}</td>
                  <td>¥ ${item.total_amount || 0}</td>
                  <td><span style="color:${item.status === '待付款' ? '#f87171' : '#eab308'};">${item.status}</span></td>
                  <td><button class="btn" style="width:auto;padding:4px 8px;font-size:12px;margin:0;">处理</button></td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>
      </div>
    `;
  } catch (e) {
    // 如果接口不通，显示真实的网络错误，而不是假数据
    container.innerHTML = `
      <div class="card" style="color:#f87171; text-align:center; padding: 40px;">
        <h3>获取真实数据失败</h3>
        <p style="margin-top:10px;">错误信息: ${e.message}</p>
        <p style="color:var(--dim); margin-top:10px;">请确认后端 API 地址是否正确，或接口路径 /purchases 是否存在。</p>
      </div>
    `;
  }
}
