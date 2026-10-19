import { toast } from "../ui.js";

export async function render(container) {
  // 模拟的会话数据
  const chats = [
    { id: 1, name: "张三", lastMsg: "好的，那我等你们发货", time: "10:23", unread: 0, msgs: [
      { type: 'left', text: "老板，我昨天买的衣服什么时候发货呀？", time: "10:20" },
      { type: 'right', text: "亲，您好！您的订单今天下午统一发出，请耐心等待哦～", time: "10:21" },
      { type: 'left', text: "好的，那我等你们发货", time: "10:23" }
    ]},
    { id: 2, name: "李四", lastMsg: "能便宜点吗？", time: "09:15", unread: 2, msgs: [
      { type: 'left', text: "这款连衣裙能不能包邮呀？", time: "09:10" },
      { type: 'left', text: "能便宜点吗？", time: "09:15" }
    ]},
    { id: 3, name: "王五", lastMsg: "收到货了，质量很好", time: "昨天", unread: 0, msgs: [
      { type: 'left', text: "收到货了，质量很好，下次还来！", time: "昨天 18:00" }
    ]}
  ];

  let currentChatId = 1;

  const renderUI = () => {
    const currentChat = chats.find(c => c.id === currentChatId);
    
    container.innerHTML = `
      <div class="chat-layout">
        <!-- 左侧会话列表 -->
        <div class="chat-sidebar" id="chat-sidebar">
          <div class="chat-search">
            <input type="text" placeholder="搜索买家昵称..." style="width:100%; padding:8px 12px; border:1px solid var(--border-light); border-radius:8px; outline:none;">
          </div>
          <div class="chat-list">
            ${chats.map(c => `
              <div class="chat-item ${c.id === currentChatId ? 'active' : ''}" data-id="${c.id}">
                <div class="chat-avatar">${c.name[0]}</div>
                <div class="chat-info">
                  <div class="chat-name">
                    <span>${c.name}</span>
                    <span style="font-size:12px; color:var(--text-muted); font-weight:normal;">${c.time}</span>
                  </div>
                  <div class="chat-msg-preview">${c.lastMsg}</div>
                </div>
                ${c.unread > 0 ? `<div style="background:#ef4444; color:#fff; font-size:11px; padding:2px 6px; border-radius:10px;">${c.unread}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 右侧聊天窗口 -->
        <div class="chat-main">
          <div class="chat-header">
            <div style="display:flex; align-items:center; gap:12px;">
              <button class="icon-btn" id="mobile-back-btn" style="display:none; padding:0;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>
              <h3>${currentChat.name}</h3>
            </div>
            <span style="font-size:13px; color:var(--text-muted);">正在与买家沟通</span>
          </div>
          
          <div class="chat-history" id="chat-history">
            ${currentChat.msgs.map(m => `
              <div class="msg-bubble ${m.type}">
                <div class="msg-content">${m.text}</div>
                <div class="msg-time">${m.time}</div>
              </div>
            `).join('')}
          </div>

          <div class="chat-input-area">
            <div class="quick-replies">
              <span class="quick-reply-btn">亲，在的呢~</span>
              <span class="quick-reply-btn">今天下午统一发货哦</span>
              <span class="quick-reply-btn">不支持退换，请谅解</span>
              <span class="quick-reply-btn">已经为您加急处理</span>
            </div>
            <div class="chat-input-row">
              <textarea id="msg-input" placeholder="输入回复内容，按 Enter 发送..."></textarea>
              <button class="btn" id="send-btn" style="width:100px; margin:0; height:60px;">发送</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // 滚动到底部
    const history = document.getElementById('chat-history');
    if(history) history.scrollTop = history.scrollHeight;

    // 绑定切换会话
    container.querySelectorAll('.chat-item').forEach(item => {
      item.onclick = () => {
        currentChatId = parseInt(item.dataset.id);
        const chat = chats.find(c => c.id === currentChatId);
        if (chat) chat.unread = 0;
        renderUI();
      };
    });

    // 绑定快捷回复
    container.querySelectorAll('.quick-reply-btn').forEach(btn => {
      btn.onclick = () => {
        const input = document.getElementById('msg-input');
        input.value = btn.textContent;
        input.focus();
      };
    });

    // 发送消息逻辑
    const sendMsg = () => {
      const input = document.getElementById('msg-input');
      const text = input.value.trim();
      if (!text) return;
      
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // 写入数据并重新渲染
      const chat = chats.find(c => c.id === currentChatId);
      chat.msgs.push({ type: 'right', text, time: timeStr });
      chat.lastMsg = text;
      chat.time = timeStr;
      
      renderUI();
      toast("消息已发送");

      // 模拟买家回复
      setTimeout(() => {
        const botReplies = ["好的收到，谢谢老板！", "嗯嗯，那我就放心了。", "可以的，没问题。", "什么时候能到货呢？"];
        chat.msgs.push({ type: 'left', text: botReplies[Math.floor(Math.random() * botReplies.length)], time: timeStr });
        chat.lastMsg = chat.msgs[chat.msgs.length-1].text;
        if (currentChatId === chat.id) renderUI();
      }, 1500);
    };

    document.getElementById('send-btn').onclick = sendMsg;
    document.getElementById('msg-input').onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
    };
  };

  renderUI();
}
