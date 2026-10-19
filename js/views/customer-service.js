import { showToast } from "../components/toast.js";

export async function render(mount) {
  mount.innerHTML = `
    <div class="cs-layout card" style="padding:0; overflow:hidden; height: calc(100dvh - 120px); display:flex;">
      <!-- 左侧会话列表 -->
      <div class="cs-sidebar">
        <div class="cs-search"><input type="text" placeholder="搜索客户昵称 / 订单号"></div>
        <div class="cs-list">
          <div class="cs-item is-active">
            <div class="cs-avatar">张</div>
            <div class="cs-info">
              <div class="cs-name"><span>张三</span> <span class="cs-time">10:30</span></div>
              <div class="cs-msg">请问这个保温杯发什么快递？</div>
            </div>
          </div>
          <div class="cs-item">
            <div class="cs-avatar" style="background:linear-gradient(135deg,#f59e0b,#f97316);">李</div>
            <div class="cs-info">
              <div class="cs-name"><span>李四</span> <span class="cs-time">昨天</span></div>
              <div class="cs-msg">订单什么时候发货呀？</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧聊天区 -->
      <div class="cs-main">
        <div class="cs-header">
          <h3>张三 <span style="font-size:12px;color:var(--text-faint);font-weight:normal;margin-left:10px;">关联订单：ORD-001</span></h3>
        </div>
        
        <div class="cs-chat-area" id="chat-area">
          <div class="cs-msg-row left">
            <div class="cs-avatar">张</div>
            <div class="cs-bubble">请问这个保温杯发什么快递？</div>
          </div>
          <div class="cs-msg-row right">
            <div class="cs-bubble mine">您好，默认发中通/圆通哦，偏远地区发邮政。</div>
            <div class="cs-avatar" style="background:var(--primary);">客</div>
          </div>
          <div class="cs-msg-row left">
            <div class="cs-avatar">张</div>
            <div class="cs-bubble">好的，那我下单了，麻烦尽快发货。</div>
          </div>
        </div>

        <div class="cs-input-area">
          <div class="cs-quick-replies">
            <span class="quick-reply">您好，很高兴为您服务</span>
            <span class="quick-reply">今天下单，48小时内发货</span>
            <span class="quick-reply">已为您催促仓库</span>
          </div>
          <textarea id="msg-input" placeholder="输入消息，Enter 发送..."></textarea>
          <div class="cs-actions">
            <button class="btn btn--primary btn--sm" id="send-btn">发送</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const sendBtn = mount.querySelector("#send-btn");
  const input = mount.querySelector("#msg-input");
  const chatArea = mount.querySelector("#chat-area");

  // 发送消息交互
  const sendMsg = () => {
    const text = input.value.trim();
    if (!text) return;
    
    // 追加气泡
    chatArea.innerHTML += `
      <div class="cs-msg-row right">
        <div class="cs-bubble mine">${text}</div>
        <div class="cs-avatar" style="background:var(--primary);">客</div>
      </div>
    `;
    input.value = "";
    chatArea.scrollTop = chatArea.scrollHeight;
    showToast("消息已发送", "success");
  };

  sendBtn.addEventListener("click", sendMsg);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  });

  // 快捷回复点击
  mount.querySelectorAll(".quick-reply").forEach(btn => {
    btn.addEventListener("click", () => { input.value = btn.textContent; input.focus(); });
  });
}
