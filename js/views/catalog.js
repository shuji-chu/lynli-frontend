import { api } from '../api.js';

export async function render(container) {
  container.innerHTML = `<div style="text-align:center; padding:50px; color:#666;">正在加载接口文档...</div>`;
  
  try {
    const res = await api.get('/v1/catalog/detail?id=1'); 
    if (res.code !== 1) throw new Error(res.msg);
    const doc = res.data;

    const params = typeof doc.params_json === 'string' ? JSON.parse(doc.params_json) : (doc.params_json || []);
    
    const paramInputs = params.map(p => `
      <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
        <label style="width: 100px; font-size: 13px; color: #94a3b8; text-align: right; font-family: monospace;">${p.name}</label>
        <input type="text" id="test-param-${p.name}" placeholder="${p.desc}" 
               style="flex: 1; background: #0f172a; border: 1px solid #334155; color: #f8fafc; padding: 8px 12px; border-radius: 6px; outline: none; font-family: monospace;">
      </div>
    `).join('');

    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto; padding-bottom: 400px; font-family: -apple-system, sans-serif;">
        <div style="color: #3b82f6; font-size: 12px; font-weight: bold; margin-bottom: 10px;">API MARKET / ${doc.category}</div>
        
        <h1 style="font-size: 32px; font-weight: bold; color: #1e293b; margin-bottom: 15px;">${doc.title}</h1>
        <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">${doc.description}</p>
        
        <div style="display: flex; gap: 10px; margin-bottom: 30px;">
          <span style="background: #dcfce7; color: #166534; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold;">正常</span>
          <span style="background: #e0f2fe; color: #0284c7; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold;">${doc.method}</span>
          <span style="background: #e0f2fe; color: #0284c7; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold;">JSON</span>
        </div>

        <div style="background: #f0f9ff; border-radius: 16px; padding: 24px; border: 1px solid #bae6fd; margin-bottom: 30px;">
          <div style="font-size: 14px; color: #0369a1; font-weight: 700; margin-bottom: 10px;">调用价格</div>
          <div style="font-size: 32px; color: #b45309; font-weight: 800; font-family: monospace;">
            ¥ ${doc.price} <span style="font-size: 16px; font-weight: normal; color: #64748b;">/次</span>
          </div>
          <p style="margin: 10px 0 0 0; font-size: 13px; color: #64748b;">按单次成功调用计费，登录后使用专属 Key 调用。</p>
        </div>

        <div style="background: #fff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 15px;">请求参数</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="text-align: left; color: #64748b;">
                <th style="padding: 10px 0;">参数名</th><th>必填</th><th>说明</th>
              </tr>
            </thead>
            <tbody>
              ${params.map(p => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 0; font-family: monospace; color: #3b82f6;">${p.name}</td>
                  <td><span style="color: ${p.req.includes('是') ? '#ef4444' : '#64748b'}">${p.req}</span></td>
                  <td style="color: #334155;">${p.desc}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="background: #fff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); padding: 25px;">
          <h3 style="font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 15px;">返回示例</h3>
          <pre style="background: #0f172a; color: #10b981; padding: 20px; border-radius: 8px; font-size: 13px; overflow-x: auto; font-family: monospace;">${doc.response_json || '暂无'}</pre>
        </div>

        <div id="playground-panel" style="position: fixed; bottom: 0; left: 250px; right: 0; background: #0f172a; border-top: 1px solid #1e293b; box-shadow: 0 -10px 30px rgba(0,0,0,0.5); transition: transform 0.3s ease; transform: translateY(calc(100% - 50px)); z-index: 1000;">
          <div id="playground-header" style="height: 50px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; cursor: pointer; border-bottom: 1px solid #1e293b;">
            <div style="color: #f8fafc; font-weight: bold; font-size: 15px; display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></span>
              在线调试控制台
            </div>
            <div style="color: #94a3b8; font-size: 12px;" id="toggle-arrow">▲ 展开</div>
          </div>
          <div style="display: flex; height: 350px;">
            <div style="width: 40%; padding: 20px; border-right: 1px solid #1e293b; overflow-y: auto;">
              <h4 style="color: #e2e8f0; margin: 0 0 15px 0; font-size: 14px;">请求参数</h4>
              ${paramInputs}
              <button id="btn-test-api" style="margin-top: 20px; width: 100%; background: #3b82f6; color: #fff; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer;">🚀 发送请求</button>
            </div>
            <div style="width: 60%; background: #000000; padding: 20px; overflow-y: auto;">
              <pre id="terminal-output" style="margin: 0; color: #10b981; font-family: monospace; font-size: 13px; white-space: pre-wrap;">等待发送请求...</pre>
            </div>
          </div>
        </div>
      </div>
    `;

    const panel = document.getElementById('playground-panel');
    document.getElementById('playground-header').addEventListener('click', () => {
      const isOpen = panel.style.transform === 'translateY(0px)';
      panel.style.transform = isOpen ? 'translateY(calc(100% - 50px))' : 'translateY(0px)';
      document.getElementById('toggle-arrow').innerText = isOpen ? '▲ 展开' : '▼ 收起';
    });

    document.getElementById('btn-test-api').addEventListener('click', async () => {
      const output = document.getElementById('terminal-output');
      output.innerText = '请求中...\n'; output.style.color = '#f59e0b';
      const payload = {};
      params.forEach(p => { payload[p.name] = document.getElementById(`test-param-${p.name}`).value; });
      try {
        const testRes = await api.post('/v1/catalog/test', { api_id: doc.id, params: payload });
        output.innerText = `HTTP 200 OK\n\n` + JSON.stringify(testRes, null, 2);
        output.style.color = '#10b981';
      } catch (err) {
        output.innerText = `请求失败:\n` + err.message;
        output.style.color = '#ef4444';
      }
    });

  } catch (err) {
    container.innerHTML = `<div style="color:red; padding:20px;">加载失败：${err.message}</div>`;
  }
}
