import { api } from '../api.js';

export async function render(container) {
  container.innerHTML = `
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <h2 style="margin: 0; font-size: 20px; font-weight: bold;">TGX 账号库管理</h2>
      <button id="btn-add-tgx" style="padding: 8px 16px; border-radius: 6px; background: #3b82f6; color: #fff; border: none; cursor: pointer;">+ 导入账号</button>
    </div>
    <div id="tgx-content" class="card">正在加载 TGX 账号数据...</div>
  `;

  const contentArea = document.getElementById('tgx-content');

  try {
    // 这里先写死一个模拟请求，等你后端写好了换成 api.get('/v1/admin/tgx/list')
    // const res = await api.get('/v1/admin/tgx/list');
    const res = { data: [
      { id: 1, account: '+12025550142', type: '美国 / 实体号', status: '在售', price: 15.00 },
      { id: 2, account: '+85212345678', type: '香港 / 协议号', status: '已售出', price: 8.50 },
      { id: 3, account: '+639123456789', type: '菲律宾 / 老号', status: '在售', price: 5.00 }
    ]};
    const list = res.data;

    contentArea.innerHTML = `
      <div class="table-container" style="overflow-x:auto; background:#fff; border-radius:8px; padding:15px;">
        <table class="table" style="width:100%; text-align:left; border-collapse:collapse;">
          <thead><tr style="border-bottom:1px solid #eee; color:#666; font-size:13px;">
            <th style="padding:10px;">ID</th><th style="padding:10px;">账号</th><th style="padding:10px;">类型</th><th style="padding:10px;">售价</th><th style="padding:10px;">状态</th><th style="padding:10px;">操作</th>
          </tr></thead>
          <tbody>
            ${list.map(item => `
              <tr style="border-bottom:1px solid #f9f9f9; font-size:14px;">
                <td style="padding:10px;">${item.id}</td>
                <td style="padding:10px; font-weight:500;">${item.account}</td>
                <td style="padding:10px; color:#666;">${item.type}</td>
                <td style="padding:10px;">¥${item.price}</td>
                <td style="padding:10px;"><span style="color:${item.status === '在售' ? '#10b981' : '#ef4444'};">${item.status}</span></td>
                <td style="padding:10px;">
                  <a href="javascript:;" style="color:#3b82f6; text-decoration:none; margin-right:10px;">编辑</a>
                  <a href="javascript:;" style="color:#f87171; text-decoration:none;">删除</a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) {
    contentArea.innerHTML = `<div style="color:red;">加载 TGX 数据失败: ${e.message}</div>`;
  }
}
