import { showToast } from "../components/toast.js";

export async function render(mount) {
  mount.innerHTML = `
    <div class="card" style="margin-bottom:20px;">
      <div class="card__head"><h2>1688 智能抓取</h2></div>
      <div style="display:flex;gap:12px;margin-top:16px;">
        <input class="field__input" type="text" id="keyword" placeholder="输入关键词或 1688 商品链接..." style="flex:1;">
        <button class="btn btn--primary" id="start-btn" style="width:auto;padding:0 24px;">开始抓取</button>
      </div>
      <div id="progress" style="display:none;margin-top:16px;">
        <div style="height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;">
          <div id="bar" style="height:100%;width:0%;background:var(--primary);transition:width 0.3s;"></div>
        </div>
        <p style="font-size:12px;color:var(--text-dim);margin-top:8px;">正在分析图文并计算利润空间...</p>
      </div>
    </div>

    <div class="card">
      <div class="card__head"><h2>抓取结果审核</h2><span>已抓取 2 件商品</span></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>主图 / 标题</th><th>拿货价</th><th>建议售价</th><th>预估利润</th><th>操作</th></tr></thead>
          <tbody>
            <tr>
              <td><div style="display:flex;align-items:center;gap:10px;"><img src="https://picsum.photos/40" style="border-radius:4px;">星空投影灯</div></td>
              <td>¥ 18.50</td><td>¥ 49.90</td><td style="color:#34d399;">¥ 31.40</td>
              <td><button class="btn btn--outline btn--sm" onclick="alert('已上架')">一键上架</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const btn = mount.querySelector("#start-btn");
  const progress = mount.querySelector("#progress");
  const bar = mount.querySelector("#bar");

  btn.addEventListener("click", () => {
    const kw = mount.querySelector("#keyword").value;
    if (!kw) return showToast("请输入关键词", "error");
    
    btn.disabled = true;
    btn.textContent = "抓取中...";
    progress.style.display = "block";
    bar.style.width = "0%";
    
    let p = 0;
    const timer = setInterval(() => {
      p += 20;
      bar.style.width = p + "%";
      if (p >= 100) {
        clearInterval(timer);
        btn.disabled = false;
        btn.textContent = "开始抓取";
        showToast("抓取完成！已生成草稿", "success");
      }
    }, 400);
  });
}
