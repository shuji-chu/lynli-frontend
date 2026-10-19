export function initAICopilot() {
  if (document.getElementById('ai-copilot-root')) return;
  
  const html = `
    <div class="ai-copilot" id="ai-copilot-root">
      <div class="ai-window" id="ai-window">
        <div class="ai-header">
          <span>🤖 LYNLI AI 智能助手</span>
          <span style="cursor:pointer; color:var(--dim);" id="ai-close">×</span>
        </div>
        <div class="ai-body" id="ai-body">
          <div class="ai-msg bot">老板你好，我是你的 AI 数据助理。你可以问我：“今天卖了多少？”、“帮我分析一下财务”。</div>
        </div>
        <div class="ai-input-box">
          <input type="text" id="ai-input" placeholder="向 AI 提问...">
          <button class="ai-send-btn" id="ai-send">发送</button>
        </div>
      </div>
      <div class="ai-btn" id="ai-btn">AI</div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  const btn = document.getElementById('ai-btn');
  const win = document.getElementById('ai-window');
  const close = document.getElementById('ai-close');
  const input = document.getElementById('ai-input');
  const send = document.getElementById('ai-send');
  const body = document.getElementById('ai-body');

  btn.onclick = () => win.classList.toggle('show');
  close.onclick = () => win.classList.remove('show');

  const addMsg = (text, type) => {
    const div = document.createElement('div');
    div.className = `ai-msg ${type}`;
    div.innerHTML = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  };

  const handleSend = () => {
    const val = input.value.trim();
    if (!val) return;
    addMsg(val, 'user');
    input.value = '';
    
    // 模拟 AI 思考
    setTimeout(() => {
      let reply = "我正在为您调取本地数据...";
      if (val.includes('营收') || val.includes('卖了多少')) {
        reply = "老板，今日实时营收为 <b>¥124,500</b>，较昨日上涨了 <b style='color:#10b981;'>12.5%</b>。女装类目贡献最大。";
      } else if (val.includes('财务') || val.includes('利润')) {
        reply = "当前账户总利润为 <b>¥79,330</b>，但采购待付款项有 12 笔，建议优先处理 <a href='javascript:;' style='color:#60a5fa;'>采购单 CG2023</a>。";
      } else if (val.includes('库存') || val.includes('缺货')) {
        reply = "警报：<b>便携式迷你小风扇</b> 库存已归零，是否需要我为您一键向供应商生成采购单？";
      } else {
        reply = "已为您分析当前业务报表。您可以直接进入【数据大盘】查看完整的 ECharts 趋势图。";
      }
      addMsg(reply, 'bot');
    }, 800);
  };

  send.onclick = handleSend;
  input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
}
