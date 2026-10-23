import { api } from '../api.js';

export async function render(container) {
  container.innerHTML = `
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; gap: 10px;">
        <button id="tab-nodes" class="btn" style="padding: 8px 16px; border-radius: 6px; background: #3b82f6; color: #fff; border: none;">节点管理</button>
        <button id="tab-accounts" class="btn" style="padding: 8px 16px; border-radius: 6px; border: 1px solid #ccc; background: #fff;">账号库存</button>
      </div>
      <button id="btn-add-node" style="padding: 8px 16px; border-radius: 6px; background: #10b981; color: #fff; border: none; cursor: pointer;">+ 添加节点</button>
    </div>

    <div id="add-form" style="display: none; background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
      <h3 style="margin-top: 0;">添加新节点</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
        <div>
          <label style="display:block; font-size:12px; margin-bottom:5px;">节点名称</label>
          <input type="text" id="node-name" placeholder="如：香港 01" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
        </div>
        <div>
          <label style="display:block; font-size:12px; margin-bottom:5px;">协议类型</label>
          <select id="node-protocol" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
            <option value="vmess">VMess</option>
            <option value="vless">VLESS</option>
            <option value="trojan">Trojan</option>
            <option value="ss">Shadowsocks</option>
            <option value="hy2">Hysteria2</option>
            <option value="socks5">SOCKS5</option>
          </select>
        </div>
        <div style="grid-column: span 2;">
          <label style="display:block; font-size:12px; margin-bottom:5px;">节点地址或链接</label>
          <input type="text" id="node-address" placeholder="1.2.3.4:443 或 vmess://..." style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
        </div>
      </div>
      <div style="text-align: right;">
        <button id="btn-cancel" style="padding: 8px 16px; border-radius: 6px; border: 1px solid #ccc; background: #fff; cursor: pointer; margin-right: 10px;">取消</button>
        <button id="btn-save" style="padding: 8px 16px; border-radius: 6px; background: #3b82f6; color: #fff; border: none; cursor: pointer;">保存节点</button>
      </div>
    </div>

    <div id="content-area"></div>
  `;

  const contentArea = document.getElementById('content-area');
  const btnNodes = document.getElementById('tab-nodes');
  const btnAccounts = document.getElementById('tab-accounts');
  const addForm = document.getElementById('add-form');
  const btnAddNode = document.getElementById('btn-add-node');
  
  const setActive = (btn, isActive) => {
    btn.style.background = isActive ? '#3b82f6' : '#fff';
    btn.style.color = isActive ? '#fff' : '#333';
    btn.style.border = isActive ? 'none' : '1px solid #ccc';
  };

  async function renderNodes() {
    setActive(btnNodes, true);
    setActive(btnAccounts, false);
    btnAddNode.style.display = 'block';
    contentArea.innerHTML = `<div class="card">正在从服务器加载节点数据...</div>`;

    try {
      // 真实请求后端接口
      const res = await api.get('/v1/admin/nodes');
      // 适配后端返回格式，通常后端返回 {code: 1, data: [...] }
      const nodes = res.data || res || [];
      
      contentArea.innerHTML = `
        <div class="kpi-grid" style="display:flex; gap:20px; margin-bottom:20px;">
          <div class="card" style="flex:1; padding:20px; background:#fff; border-radius:8px;">
            <div class="kpi-label" style="color:#666; font-size:14px;">总节点数</div>
            <div class="kpi-val" style="font-size:24px; font-weight:bold;">${nodes.length}</div>
          </div>
          <div class="card" style="flex:1; padding:20px; background:#fff; border-radius:8px;">
            <div class="kpi-label" style="color:#666; font-size:14px;">运行状态</div>
            <div class="kpi-val" style="font-size:24px; font-weight:bold; color:#10b981;">正常</div>
          </div>
        </div>
        <div class="table-container" style="overflow-x:auto; background:#fff; border-radius:8px; padding:15px;">
          <table class="table" style="width:100%; text-align:left; border-collapse:collapse;">
            <thead><tr style="border-bottom:1px solid #eee; color:#666; font-size:13px;"><th style="padding:10px;">节点名称</th><th style="padding:10px;">协议/IP</th><th style="padding:10px;">地区</th><th style="padding:10px;">状态</th><th style="padding:10px;">操作</th></tr></thead>
            <tbody>
              ${nodes.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:20px; color:#999;">暂无节点数据</td></tr>' : ''}
              ${nodes.map(n => `
                <tr style="border-bottom:1px solid #f9f9f9; font-size:14px;">
                  <td style="padding:10px;">${n.name || '未命名'}</td>
                  <td style="padding:10px; color:#666;">${n.host || n.ip || '-'}</td>
                  <td style="padding:10px;">${n.region_name || n.region || '默认'}</td>
                  <td style="padding:10px;"><span style="color:${n.enabled ? '#10b981' : '#ef4444'};">${n.enabled ? '启用' : '禁用'}</span></td>
                  <td style="padding:10px;"><a href="javascript:;" style="color:#3b82f6; text-decoration:none; margin-right:10px;">编辑</a><a href="javascript:;" style="color:#f87171; text-decoration:none;">删除</a></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (e) {
      contentArea.innerHTML = `<div class="card" style="color:red; padding:20px;">加载节点失败，请检查是否登录或后端接口异常。(${e.message})</div>`;
    }
  }

  async function renderAccounts() {
    setActive(btnAccounts, true);
    setActive(btnNodes, false);
    btnAddNode.style.display = 'none';
    addForm.style.display = 'none';
    contentArea.innerHTML = `<div class="card" style="padding:20px;">账号库存功能开发中...</div>`;
  }

  btnNodes.addEventListener('click', renderNodes);
  btnAccounts.addEventListener('click', renderAccounts);

  btnAddNode.addEventListener('click', () => {
    addForm.style.display = addForm.style.display === 'none' ? 'block' : 'none';
  });
  
  document.getElementById('btn-cancel').addEventListener('click', () => {
    addForm.style.display = 'none';
  });

  await renderNodes();
}
