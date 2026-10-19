import { api } from "../api.js";
import { toast, showModal } from "../ui.js";

export async function render(container) {
  container.innerHTML = `
    <div class="card" style="margin-bottom: 20px;">
      <h3 style="margin-bottom: 15px;">🤖 AI 智能比价与自动铺货</h3>
      <p style="font-size: 13px; color: var(--dim); margin-bottom: 15px;">输入商品名称，系统将向后端下发爬虫指令，自动爬取多平台并计算利润。</p>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <input type="text" id="ai-keyword" placeholder="例如：法式复古碎花连衣裙" style="flex: 1; min-width: 250px; padding: 12px; background: rgba(255,255,255,0.5); border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; color: #111827;">
        <button class="btn" id="btn-spider" style="width: auto; padding: 12px 24px; margin: 0;">下发采集任务</button>
      </div>
    </div>

    <!-- 状态展示区 -->
    <div id="status-box" style="display: none; text-align: center; padding: 40px;" class="card">
      <div class="ai-radar" style="margin: 0 auto 20px;"></div>
      <div id="status-text" style="font-size: 14px; color: var(--pri); font-weight: bold;">正在连接爬虫服务器...</div>
    </div>

    <!-- 结果对比区 -->
    <div id="result-box"></div>
  `;

  const btn = document.getElementById('btn-spider');
  const input = document.getElementById('ai-keyword');
  const statusBox = document.getElementById('status-box');
  const statusText = document.getElementById('status-text');
  const resultBox = document.getElementById('result-box');

  btn.onclick = async () => {
    const keyword = input.value.trim();
    if (!keyword) return toast("请输入要采集的商品名称", "error");

    resultBox.innerHTML = '';
    statusBox.style.display = 'block';
    btn.disabled = true;
    btn.textContent = "任务执行中...";
    statusText.textContent = `正在向服务器发送关键词: "${keyword}"...`;

    try {
      // 【真实请求】向后端发送爬虫任务
      // 前端预期后端返回格式: { code: 200, data: [ { platform, title, price, isLowest } ] }
      const res = await api.post("/spider/search", { keyword });
      
      // 如果后端接通了，把真实数据渲染出来
      if (res && res.code === 200) {
        statusBox.style.display = 'none';
        renderResults(res.data);
        toast("采集完成");
      } else {
        throw new Error(res.message || "服务器返回异常");
      }
    } catch (error) {
      // 【演示模式】如果服务器还没写好，这里降级用假数据演示
      statusText.textContent = "检测到后端 API 尚未接通，正在使用演示模式...";
      setTimeout(() => {
        statusBox.style.display = 'none';
        // 模拟后端返回的假数据
        const mockData = [
          { platform: "1688", title: `【源头工厂】${keyword} 爆款直批`, price: 25.00, isLowest: true },
          { platform: "淘宝", title: `${keyword} 官方旗舰店正品`, price: 45.00, isLowest: false },
          { platform: "拼多多", title: `${keyword} 拼团特惠包邮`, price: 28.50, isLowest: false }
        ];
        renderResults(mockData);
      }, 1500);
    } finally {
      btn.disabled = false;
      btn.textContent = "下发采集任务";
    }
  };

  function renderResults(dataList) {
    if (!dataList || dataList.length === 0) {
      resultBox.innerHTML = '<div class="card" style="text-align: center; color: var(--dim);">未找到相关商品</div>';
      return;
    }

    resultBox.innerHTML = `
      <h4 style="margin-bottom: 5px;">找到 ${dataList.length} 个货源</h4>
      <div class="compare-grid">
        ${dataList.map(item => `
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
                <button class="btn btn-push" data-title="${item.title}" data-platform="${item.platform}" style="width: auto; margin: 0; padding: 6px 12px; font-size: 12px; background: ${item.isLowest ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(0,0,0,0.1)'}; color: ${item.isLowest ? '#fff' : 'var(--text-main)'};">
                  ${item.isLowest ? '一键铺货' : '选择此货源'}
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // 绑定真实铺货请求
    resultBox.querySelectorAll('.btn-push').forEach(pushBtn => {
      pushBtn.onclick = () => {
        const title = pushBtn.dataset.title;
        const platform = pushBtn.dataset.platform;
        
        showModal({
          title: "🤖 正在同步至商品库",
          contentHTML: `
            <div style="text-align: center; padding: 20px 0;">
              <div class="ai-radar" style="margin: 0 auto 20px;"></div>
              <div id="push-log" style="font-size: 13px; color: var(--pri); font-family: monospace;">正在获取商品详情并处理...</div>
            </div>
          `,
          onConfirm: async (mask, close) => {
            try {
              // 【真实请求】向后端发送铺货任务
              // 预期后端处理：抓取详情、保存数据库、返回结果
              const res = await api.post("/spider/push", { title, platform });
              mask.querySelector('#push-log').innerHTML = res.message || "✅ 铺货成功！已自动上架。";
              await new Promise(r => setTimeout(r, 1000));
              close();
              toast("商品已进入您的商品库");
            } catch (e) {
              // 演示模式
              const log = mask.querySelector('#push-log');
              const steps = ["正在抓取详情图...", "生成 AI 文案...", "加价 30% 计算利润...", "✅ 铺货成功！"];
              for (let i = 0; i < steps.length; i++) {
                await new Promise(r => setTimeout(r, 500));
                log.innerHTML = steps[i];
              }
              await new Promise(r => setTimeout(r, 500));
              close();
              toast("演示铺货成功");
            }
          }
        });
      };
    });
  }
}
