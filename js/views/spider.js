import { showToast } from "../components/toast.js";

const PLATFORMS = [
  { id: '1688', name: '1688' },
  { id: 'taobao', name: '淘宝' },
  { id: 'tmall', name: '天猫' },
  { id: 'pdd', name: '拼多多' },
  { id: 'jd', name: '京东' },
  { id: 'douyin', name: '抖音' },
  { id: 'kuaishou', name: '快手' },
  { id: 'vip', name: '唯品会' }
];

export async function render(mount) {
  mount.innerHTML = `
    <div class="card" style="margin-bottom:20px;">
      <div class="card__head"><h2>全网多平台比价抓取</h2></div>
      
      <div class="platform-grid" id="platform-group">
        ${PLATFORMS.map(p => `
          <label class="platform-card">
            <input type="checkbox" value="${p.id}" checked>
            <span class="platform-name">${p.name}</span>
          </label>
        `).join('')}
      </div>

      <div class="search-bar">
        <input class="field__input" type="text" id="keyword" placeholder="输入商品关键词，例如：宇航员投影灯">
        <button class="btn btn--primary" id="start-btn">开始抓取</button>
      </div>
      
      <div id="progress-wrap" style="display:none;margin-top:20px;">
        <div style="height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;">
          <div id="bar" style="height:100%;width:0%;background:var(--primary);transition:width 0.3s;"></div>
        </div>
        <p style="font-size:12px;color:var(--text-dim);margin-top:8px;" id="progress-text">正在全网比对价格与销量...</p>
      </div>
    </div>

    <div class="card" id="result-area" style="display:none;">
      <div class="card__head">
        <h2>多平台比价审核</h2>
        <span class="status-tag is-ok">自动过滤低利润商品</span>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>平台</th><th>商品标题</th><th>拿货价</th><th>全网均价</th><th>预估利润</th><th>操作</th></tr></thead>
          <tbody id="result-tbody"></tbody>
        </table>
      </div>
    </div>
  `;

  const btn = mount.querySelector("#start-btn");
  const progressWrap = mount.querySelector("#progress-wrap");
  const bar = mount.querySelector("#bar");
  const progressText = mount.querySelector("#progress-text");
  const resultArea = mount.querySelector("#result-area");
  const tbody = mount.querySelector("#result-tbody");

  btn.addEventListener("click", () => {
    const kw = mount.querySelector("#keyword").value;
    if (!kw) return showToast("请输入商品关键词", "error");
    
    const selectedPlatforms = [...mount.querySelectorAll('.platform-card input:checked')].map(el => el.value);
    if (selectedPlatforms.length < 2) return showToast("请至少勾选两个平台进行比价", "error");

    btn.disabled = true;
    btn.textContent = "抓取中...";
    progressWrap.style.display = "block";
    resultArea.style.display = "none";
    bar.style.width = "0%";
    
    let p = 0;
    const timer = setInterval(() => {
      p += 15;
      bar.style.width = p + "%";
      progressText.textContent = `正在并发抓取 ${selectedPlatforms.length} 个平台数据... ${p}%`;
      
      if (p >= 100) {
        clearInterval(timer);
        btn.disabled = false;
        btn.textContent = "开始抓取";
        resultArea.style.display = "block";
        renderResult(tbody, selectedPlatforms, kw);
        showToast("多平台数据抓取成功！", "success");
      }
    }, 200);
  });
}

function renderResult(tbody, platforms, keyword) {
  // 模拟各个平台的真实数据
  const mockDB = {
    '1688': { title: "【厂家直销】网红同款", cost: 15.00, avg: 39.90, score: 98 },
    'taobao': { title: "爆款热卖 极简设计", cost: 28.00, avg: 39.90, score: 85 },
    'tmall': { title: "品牌旗舰店 正品保障", cost: 35.00, avg: 39.90, score: 80 },
    'pdd': { title: "百亿补贴 限量秒杀", cost: 19.90, avg: 39.90, score: 92 },
    'jd': { title: "京东自营 次日达", cost: 38.00, avg: 39.90, score: 75 },
    'douyin': { title: "直播间同款 爆单", cost: 25.00, avg: 39.90, score: 88 },
    'kuaishou': { title: "老铁专属 源头好货", cost: 22.00, avg: 39.90, score: 89 },
    'vip': { title: "品牌特卖 限时折扣", cost: 30.00, avg: 39.90, score: 82 }
  };

  // 过滤出用户勾选的平台，并按拿货价从低到高排序（大厂必备：智能比价）
  const results = platforms.map(p => ({ platform: p, ...mockDB[p] })).sort((a, b) => a.cost - b.cost);

  tbody.innerHTML = results.map((d, index) => {
    const profit = (d.avg - d.cost).toFixed(2);
    const isBest = index === 0; // 拿货价最低的作为最优推荐
    
    return `
      <tr style="${isBest ? 'background:rgba(52,211,153,0.05);' : ''}">
        <td><strong style="color:${isBest ? '#34d399' : 'inherit'}">${d.platform.toUpperCase()}</strong></td>
        <td>${keyword} - ${d.title}</td>
        <td style="${isBest ? 'color:#34d399;font-weight:bold;' : ''}">¥ ${d.cost.toFixed(2)}</td>
        <td>¥ ${d.avg.toFixed(2)}</td>
        <td style="color:#34d399;">¥ ${profit}</td>
        <td>
          ${isBest 
            ? `<button class="btn btn--primary btn--sm" onclick="alert('已绑定该平台货源链接')">一键采纳货源</button>` 
            : `<button class="btn btn--outline btn--sm" disabled>利润偏低</button>`
          }
        </td>
      </tr>
    `;
  }).join("");
}
