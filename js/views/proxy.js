import { api } from '../api.js';

export async function render(container) {
  // 渲染基础框架和 Tab 切换
  container.innerHTML = `
    <div style="margin-bottom: 20px; display: flex; gap: 10px;">
      <button id="tab-nodes" class="btn btn-primary" style="padding: 8px 16px; border-radius: 6px; border: none; background: #3b82f6; color: #fff; cursor: pointer;">节点管理</button>
      <button id="tab-accounts" class="btn" style="padding: 8px 16px; border-radius: 6px; border: 1px solid #ccc; background: #fff; color: #333; cursor: pointer;">账号库存管理</button>
    </div>
    <div id="content-area"></div>
  `;

  const contentArea = document.getElementById('content-area');
  const btnNodes = document.getElementById('tab-nodes');
  const btnAccounts = document.getElementById('tab-accounts');

  // 渲染节点管理视图
  async function renderNodes() {
    btnNodes.style.background = '#3b82f6';
    btnNodes.style.color = '#fff';
    btnNodes.style.border = 'none';
    btnAccounts.style.background = '#fff';
    btnAccounts.style.color = '#333';
    btnAccounts.style.border = '1px solid #ccc';

    contentArea.innerHTML = `<div class="card">加载节点数据中...</div>`;

    try {
      // 假设后端有 /admin/nodes 接口，如果没有会报错，这里先做个兼容
      // const res = await api.get('/admin/nodes');
      // 模拟数据，等后端接口通了把上面那行解开，删掉下面这行
      const nodes = [
        { id: 1, ip: '112.11.22.33:8080', location: '浙江杭州 (电信)', latency: '120ms', status: '存活' },
        { id: 2, ip: '45.32.11.22:3128', location: '广东深圳 (移动)', latency: '450ms', status: '存活' },
        { id: 3, ip: '120.11.22.33:80', location: '北京 (联通)', latency: '-', status: '已失效' }
      ];

      contentArea.innerHTML = `
        <div class="kpi-grid" style="display:flex; gap:20px; margin-bottom:20px;">
          <div class="card"><div class="kpi-label">节点总数</div><div class="kpi-val">${nodes.length}</div></div>
          <div class="card"><div class="kpi-label">存活率</div><div class="kpi-val" style="color:#10b981;">92.5%</div></div>
        </div>
        <div class="table-container" style="overflow-x:auto; background:#fff; border-radius:8px; padding:15px;">
          <table class="table" style="width:100%; text-align:left; border-collapse:collapse;">
            <thead><tr style="border-bottom:1px solid #eee;"><th>IP 地址</th><th>归属地</th><th>响应延迟</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
              ${nodes.map(n => `
                <tr style="border-bottom:1px solid #f9f9f9;">
                  <td>${n.ip}</td><td>${n.location}</td><td>${n.latency}</td>
                  <td><span style="color:${n.status === '存活' ? '#10b981' : '#ef4444'};">${n.status}</span></td>
                  <td><a href="javascript:;" style="color:#f87171; text-decoration:none;">剔除</a></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (e) {
      contentArea.innerHTML = `<div class="card" style="color:red;">加载失败: ${e.message}</div>`;
    }
  }

  // 渲染账号库存视图
  async function renderAccounts() {
    btnAccounts.style.background = '#3b82f6';
    btnAccounts.style.color = '#fff';
    btnAccounts.style.border = 'none';
    btnNodes.style.background = '#fff';
    btnNodes.style.color = '#333';
    btnNodes.style.border = '1px solid #ccc';

    contentArea.innerHTML = `<div class="card">加载账号库存中...</div>`;

    // 这里以后接真实后端接口，目前用模拟数据展示 UI
    const accounts = [
      { id: 'A001', type: 'Google 老号', region: '美国', price: '¥15.00', stock: 120, status: '在售' },
      { id: 'A002', type: 'Twitter 白号', region: '香港', price: '¥8.50', stock: 45, status: '在售' },
      { id: 'A003', type: 'Telegram 协议号', region: '菲律宾', price: '¥5.00', stock: 0, status: '缺货' }
    ];

    contentArea.innerHTML = `
      <div class="table-container" style="overflow-x:auto; background:#fff; border-radius:8px; padding:15px;">
        <table class="table" style="width:100%; text-align:left; border-collapse:collapse;">
          <thead><tr style="border-bottom:1px solid #eee;"><th>ID</th><th>账号类型</th><th>所属地区</th><th>单价</th><th>库存</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            ${accounts.map(a => `
              <tr style="border-bottom:1px solid #f9f9f9;">
                <td>${a.id}</td><td>${a.type}</td><td>${a.region}</td><td>${a.price}</td><td>${a.stock}</td>
                <td><span style="color:${a.status === '在售' ? '#10b981' : '#ef4444'};">${a.status}</span></td>
                <td><a href="javascript:;" style="color:#3b82f6; text-decoration:none; margin-right:10px;">编辑</a><a href="javascript:;" style="color:#f87171; text-decoration:none;">删除</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // 绑定点击事件
  btnNodes.addEventListener('click', renderNodes);
  btnAccounts.addEventListener('click', renderAccounts);

  // 默认渲染节点管理
  await renderNodes();
}
