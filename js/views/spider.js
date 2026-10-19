import { showToast } from "../components/toast.js";
export async function render(mount) {
  mount.innerHTML = `
    <div class="card"><div class="card__head"><h2>全网多平台比价抓取</h2></div>
      <div style="display:flex;gap:10px;margin:20px 0;"><label class="check"><input type="checkbox" checked> 1688</label><label class="check"><input type="checkbox" checked> 淘宝</label><label class="check"><input type="checkbox" checked> 拼多多</label></div>
      <div style="display:flex;gap:10px;"><input class="field__input" id="kw" placeholder="输入关键词"><button class="btn btn--primary" id="btn" style="width:auto;">开始抓取</button></div>
    </div>
    <div class="card" id="res" style="display:none;margin-top:20px;"><div class="table-wrap"><table class="data-table"><thead><tr><th>平台</th><th>拿货价</th><th>利润</th><th>操作</th></tr></thead><tbody id="tb"></tbody></table></div></div>
  `;
  mount.querySelector("#btn").onclick = () => {
    if(!mount.querySelector("#kw").value) return showToast("请输入关键词","error");
    mount.querySelector("#btn").textContent = "抓取中...";
    setTimeout(() => {
      mount.querySelector("#btn").textContent = "开始抓取"; mount.querySelector("#res").style.display = "block";
      mount.querySelector("#tb").innerHTML = `<tr><td><strong>1688</strong></td><td>¥18</td><td style="color:#34d399">¥31</td><td><button class="btn btn--outline btn--sm">采纳</button></td></tr><tr><td>淘宝</td><td>¥25</td><td>¥24</td><td><button class="btn btn--outline btn--sm" disabled>利润低</button></td></tr>`;
      showToast("抓取完成");
    }, 1000);
  };
}
