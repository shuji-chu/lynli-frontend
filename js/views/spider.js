import { toast, showModal } from "../ui.js";

export async function render(container) {
  container.innerHTML = `
    <div class="card" style="margin-bottom: 20px;">
      <h3 style="margin-bottom: 15px;">🤖 AI 智能比价与自动铺货</h3>
      <p style="font-size: 13px; color: var(--dim); margin-bottom: 15px;">输入商品名称，AI 将自动爬取 1688、淘宝、拼多多 等平台，计算利润并推荐最低价。</p>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <input type="text" id="ai-keyword" placeholder="例如：法式复古碎花连衣裙" style="flex: 1; min-width: 250px; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--line); border-radius: 8px; color: #fff;">
        <button class="btn" id="btn-spider" style="width: auto; padding: 12px 24px; margin: 0;">开始 AI 解析</button>
      </div>
    </div>

    <!-- AI 扫描动效区 -->
    <div class="ai-radar-box" id="radar-box">
      <div class="ai-radar"></div>
      <div class="ai-log" id="ai-log"></div>
    </div>

    <!-- 结果对比区 -->
    <div id="result-box"></div>
  `;

  const btn = document.getElementById('btn-spider');
  const input = document.getElementById('ai-keyword');
  const radarBox = document.getElementById('radar-box');
  const aiLog = document.getElementById('ai-log');
  const resultBox = document.getElementById('result-box');

  btn.onclick = () => {
    const keyword = input.value.trim();
    if (!keyword) return toast("请输入要采集的商品名称", "error");

    // 清空旧结果
    resultBox.innerHTML = '';
    radarBox.classList.add('show');
    aiLog.innerHTML = '';
    btn.disabled = true;
    btn.textContent = "AI 爬虫运行中...";

    // 模拟爬虫并发日志
    const logs = [
      "正在建立多线程爬虫隧道...",
      `🔍 正在搜索淘宝: "${keyword}"...`,
      `🔍 正在搜索 1688: "${keyword}"...`,
      `🔍 正在搜索拼多多: "${keyword}"...`,
      "提取主图、标题、SKU 规格...",
      "正在计算平台扣点与物流成本...",
      "✅ 比价完成，已为您筛选最优货源！"
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        aiLog.innerHTML += `<div>> ${logs[i]}</div>`;
        aiLog.scrollTop = aiLog.scrollHeight;
        i++;
      } else {
        clearInterval(interval);
        radarBox.classList.remove('show');
        btn.disabled = false;
        btn.textContent = "开始 AI 解析";
        renderResults(keyword);
      }
    }, 600);
  };

  function renderResults(keyword) {
    // 模拟 AI 爬回来的数据
    const mockData = [
      { platform: "1688", title: `【源头工厂】${keyword} 爆款直批`, price: 25.00, isLowest: true },
      { platform: "淘宝", title: `${keyword} 官方旗舰店正品`, price: 45.00, isLowest: false },
      { platform: "拼多多", title: `${keyword} 拼团特惠包邮`, price: 28.50, isLowest: false }
    ];

    resultBox.innerHTML = `
      <h4 style="margin-bottom: 5px;">找到 3 个优质货源</h4>
      <div class="compare-grid">
        ${mockData.map(item => `
          <div class="compare-card ${item.isLowest ? 'cheapest' : ''}">
            ${item.isLowest ? '<div class="cheapest-tag">👑 全网最低价</div>' : ''}
            <div class="compare-img">商品图</div>
            <div class="compare-info">
              <div>
                <div class="compare-title">${item.title}</div>
                <div class="compare-source">来源: ${item.platform}</div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="compare-price">¥ ${item.price.toFixed(2)}</div>
                <button class="btn btn-push" data-price="${item.price}" data-platform="${item.platform}" style="width: auto; margin: 0; padding: 6px 12px; font-size: 12px; background: ${item.isLowest ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)'};">
                  ${item.isLowest ? '一键铺货' : '选择此货源'}
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // 绑定铺货按钮
    resultBox.querySelectorAll('.btn-push').forEach(pushBtn => {
      pushBtn.onclick = () => {
        const price = pushBtn.dataset.price;
        const platform = pushBtn.dataset.platform;
        
        showModal({
          title: "🤖 AI 自动铺货中",
          contentHTML: `
            <div style="text-align: center; padding: 20px 0;">
              <div class="ai-radar" style="margin: 0 auto 20px;"></div>
              <div id="push-log" style="font-size: 13px; color: var(--pri); font-family: monospace;">正在连接 ${platform} 接口...</div>
            </div>
          `,
          onConfirm: async (mask, close) => {
            // 模拟铺货过程
            const log = mask.querySelector('#push-log');
            const steps = [
              "正在抓取商品详情图...",
              "正在生成 AI 营销文案...",
              "正在自动加价 30% 计算利润...",
              "正在同步至商城商品库...",
              "✅ 铺货成功！已自动上架。"
            ];
            for (let i = 0; i < steps.length; i++) {
              await new Promise(r => setTimeout(r, 600));
              log.innerHTML = steps[i];
            }
            await new Promise(r => setTimeout(r, 500));
            close();
            toast("铺货成功，已上架至商品库！");
          }
        });
      };
    });
  }
}
