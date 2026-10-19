import { showToast } from "../components/toast.js";
import { showModal } from "../components/modal.js";

export async function render(mount) {
  mount.innerHTML = `
    <div class="card" style="margin-bottom:20px;">
      <div class="card__head"><h2>全网多平台比价抓取</h2></div>
      
      <div style="display:flex;gap:16px;margin-top:16px;flex-wrap:wrap;">
        <div class="platform-select">
          <label class="check"><input type="checkbox" checked value="1688"> 1688 货源</label>
          <label class="check"><input type="checkbox" checked value="taobao"> 淘宝</label>
          <label class="check"><input type="checkbox" checked value="pdd"> 拼多多</label>
          <label class="check"><input type="checkbox" value="jd"> 京东</label>
          <label class="check"><input type="checkbox" value="douyin"> 抖音</label>
        </div>
      </div>

      <div style="display:flex;gap:12px;margin-top:16px;">
        <input class="field__input" type="text" id="keyword" placeholder="输入商品关键词，例如：宇航员投影灯" style="flex:1;">
        <button class="btn btn--primary" id="start-btn" style="width:auto;padding:0 24px;">开始多平台抓取</button>
      </div>
      
      <div id="progress" style="display:none;margin-top:16px;">
        <div style="height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;">
          <div id="bar" style="height:100%;width:0%;background:var(--primary);transition:width 0.3s;"></div>
        </div>
        <p style="font-size:12px;color:var(--text-dim);margin-top:8px;">正在全网比对价格与销量，请稍候...</p>
      </div>
    </div>

    <div class="card" id="result-area" style="display:none;">
      <div class="card__head">
        <h2>多平台比价审核</h2>
        <span class="status-tag is-ok">已过滤低利润商品</span>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>平台</th><th>商品标题</th><th>拿货价</th><th>全网均价</th><th>建议售价</th><th>预估利润</th><th>操作</th></tr></thead>
          <tbody id="result-tbody">
            <!-- 动态注入 -->
          </tbody>
        </table>
      </div>
    </div>
  `;

  const btn = mount.querySelector("#start-btn");
  const progress = mount.querySelector("#progress");
  const bar = mount.querySelector("#bar");
  const resultArea = mount.querySelector("#result-area");
  const tbody = mount.querySelector("#result-tbody");

  btn.addEventListener("click", () => {
    const kw = mount.querySelector("#keyword").value;
    if (!kw) return showToast("请输入关键词", "error");
    
    // 获取选中的平台
    const platforms = [...mount.querySelectorAll(".platform-select input:checked")].map(el => el.value);
    if (platforms.length === 0) return showToast("请至少选择一个抓取平台", "error");

    btn.disabled = true;
    btn.textContent = "抓取中...";
    progress.style.display = "block";
    resultArea.style.display = "none";
    bar.style.width = "0%";
    
    let p = 0;
    const timer = setInterval(() => {
      p += 10;
      bar.style.width = p + "%";
      if (p >= 100) {
        clearInterval(timer);
        btn.disabled = false;
        btn.textContent = "开始多平台抓取";
        resultArea.style.display = "block";
        renderResult(tbody, platforms, kw);
        showToast("抓取完成！已生成多平台比价清单", "success");
      }
    }, 200);
  });
}

function renderResult(tbody, platforms, keyword) {
  const mockData = [
    { platform: "1688", title: `${keyword} - 厂家直销 极简风`, cost: 18.50, avg: 45.00, price: 49.90 },
    { platform: "淘宝", title: `${keyword} - 爆款网红同款`, cost: 32.00, avg: 45.00, price: 49.90 },
    { platform: "拼多多", title: `${keyword} - 百亿补贴正品`, cost: 22.80, avg: 45.00, price: 49.90 },
    { platform: "抖音", title: `${keyword} - 直播间爆卖推荐`, cost: 28.00, avg: 45.00, price: 49.90 },
  ];

  const filtered = mockData.filter(d => platforms.includes(d.platform.toLowerCase()) || (d.platform === "1688" && platforms.includes("1688")));

  tbody.innerHTML = filtered.map(d => {
    const profit = (d.price - d.cost).toFixed(2);
    const isBest = d.platform === "1688"; // 假设1688最便宜
    return `
      <tr>
        <td><strong style="color:${isBest ? '#34d399' : 'inherit'}">${d.platform}</strong></td>
        <td>${d.title}</td>
        <td>¥ ${d.cost.toFixed(2)}</td>
        <td>¥ ${d.avg.toFixed(2)}</td>
        <td>¥ ${d.price.toFixed(2)}</td>
        <td style="color:#34d399;font-weight:bold;">¥ ${profit}</td>
        <td>
          ${isBest 
            ? `<button class="btn btn--primary btn--sm" onclick="alert('已采用 1688 链接作为货源')">一键采纳</button>` 
            : `<button class="btn btn--outline btn--sm" disabled>利润偏低</button>`
          }
        </td>
      </tr>
    `;
  }).join("");
}
