/* ============================================================
   全局 AI 客服悬浮窗
   - 右下角呼吸气泡（ai-fab）+ 对话窗（ai-window）
   - 接口：POST /api/v1/ai/chat（智谱 GLM，后端 api_ai.py）
   - 支持多轮上下文（messages）、快捷提问、打字动画、错误提示
   ============================================================ */

const AI_API = (typeof API_BASE !== "undefined")
  ? `${API_BASE}/ai/chat`
  : ((location.hostname === "web.lynli.me") ? "/api/v1/ai/chat" : "https://api.lynli.me/api/v1/ai/chat");

const AI_QUICK_PROMPTS = [
  "平台有哪些套餐？",
  "节点连接不上怎么办？",
  "如何续费？",
  "帮我查一下今天的营收",
];

let _aiHistory = [];      // 多轮上下文 [{role, content}]
let _aiGreeted = false;   // 是否已发送欢迎语
let _aiSending = false;   // 请求中防重入

// ---------- 开关 ----------
function toggleAiChat(force) {
  const win = document.getElementById("ai-window");
  if (!win) return;
  const open = (typeof force === "boolean") ? force : !win.classList.contains("open");
  win.classList.toggle("open", open);
  if (open) {
    renderAiQuick();
    if (!_aiGreeted) {
      _aiGreeted = true;
      appendAiMessage("bot", "你好，我是 LynLi 智能客服 🤖\n可以问我套餐、节点、续费、营收等问题，我会尽力帮你解答。");
    }
    setTimeout(() => {
      const input = document.getElementById("ai-input");
      if (input && window.innerWidth > 768) input.focus();
      scrollAiToBottom();
    }, 260);
  }
}

// 供菜单/占位页调用
function openAiChat() { toggleAiChat(true); }

// ---------- 快捷提问 ----------
function renderAiQuick() {
  const box = document.getElementById("ai-quick");
  if (!box) return;
  if (box.dataset.rendered === "1") return;
  box.dataset.rendered = "1";
  box.innerHTML = AI_QUICK_PROMPTS.map(p =>
    `<span class="ai-quick-chip" onclick="sendQuickPrompt(this)" data-p="${escapeHtml(p)}">${escapeHtml(p)}</span>`
  ).join("");
}

function sendQuickPrompt(el) {
  const p = el?.dataset?.p || "";
  if (!p || _aiSending) return;
  const input = document.getElementById("ai-input");
  if (input) input.value = p;
  sendAiMessage();
}

// ---------- 消息渲染 ----------
function appendAiMessage(who, text, isError = false) {
  const box = document.getElementById("ai-messages");
  if (!box) return;
  const row = document.createElement("div");
  row.className = `ai-msg ${who}${isError ? " error" : ""}`;
  const bubble = document.createElement("div");
  bubble.className = "ai-bubble";
  bubble.innerText = text;
  if (who === "bot") {
    const av = document.createElement("div");
    av.className = "ai-mini-avatar";
    av.innerText = "AI";
    row.appendChild(av);
  }
  row.appendChild(bubble);
  box.appendChild(row);
  scrollAiToBottom();
  return row;
}

function showAiTyping() {
  const box = document.getElementById("ai-messages");
  if (!box) return null;
  const row = document.createElement("div");
  row.className = "ai-msg bot";
  row.id = "ai-typing-row";
  const av = document.createElement("div");
  av.className = "ai-mini-avatar";
  av.innerText = "AI";
  const bubble = document.createElement("div");
  bubble.className = "ai-bubble";
  bubble.innerHTML = '<span class="ai-typing"><i></i><i></i><i></i></span>';
  row.appendChild(av);
  row.appendChild(bubble);
  box.appendChild(row);
  scrollAiToBottom();
  return row;
}

function scrollAiToBottom() {
  const box = document.getElementById("ai-messages");
  if (box) box.scrollTop = box.scrollHeight;
}

// ---------- 发送 ----------
async function sendAiMessage() {
  if (_aiSending) return;
  const input = document.getElementById("ai-input");
  const text = (input?.value || "").trim();
  if (!text) { showToast("请输入消息内容", "⚠️"); return; }

  _aiSending = true;
  const sendBtn = document.getElementById("ai-send");
  if (sendBtn) sendBtn.disabled = true;
  if (input) input.value = "";

  appendAiMessage("user", text);
  _aiHistory.push({ role: "user", content: text });
  if (_aiHistory.length > 16) _aiHistory = _aiHistory.slice(-16); // 控制上下文长度

  const typing = showAiTyping();

  try {
    const res = await fetch(AI_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ message: text, messages: _aiHistory }),
    });
    const json = await res.json().catch(() => null);
    if (typing) typing.remove();

    if (json && json.code === 1 && json.data && json.data.reply) {
      const reply = String(json.data.reply);
      appendAiMessage("bot", reply);
      _aiHistory.push({ role: "assistant", content: reply });
    } else {
      const msg = (json && json.msg) ? json.msg : "AI 服务暂时不可用，请稍后再试";
      appendAiMessage("bot", msg, true);
      showToast("AI 回复失败", "⚠️");
    }
  } catch (e) {
    if (typing) typing.remove();
    appendAiMessage("bot", "网络异常，AI 暂时失联了，请检查网络后重试", true);
    showToast("AI 请求失败", "📡");
  } finally {
    _aiSending = false;
    if (sendBtn) sendBtn.disabled = false;
    if (input) input.focus();
  }
}
