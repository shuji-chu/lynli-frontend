import { toast } from "../../components/ui/toast.js";
const platforms = ['1688', '淘宝', '拼多多'];

export async function render(m) {
  m.innerHTML = `
    <div class="card">
      <h2>全网多平台并发抓取</h2>
      <div style="display:flex;gap:10px;margin:20px 0;flex-wrap:wrap;">
        ${platforms.map(p => `<label class="platform-tag"><input type="checkbox" class="plat-cb" checked value="${p}"> ${p}</label>`).join('')}
      </div>
      <div style="display:flex;gap:12px;">
        <input class="input" id="kw" placeholder="输入商品关键词">
        <button class="btn btn-primary" id="start" style="width:120px;flex:none;">开始抓取</button>
      </div>
    </div>
    <div class="card" id="result" style="display:none;">
      <h2>真实抓取结果（按利润排序）</h2>
      <table class="table"><thead><tr><th>平台</th><th>商品标题</th><th>拿货价</th><th>预估利润</th><th>操作</th></tr></thead><tbody id="tb"></tbody></table>
    </div>`;

  m.querySelector("#start").onclick = async () => {
    const selected = Array.from(m.querySelectorAll('.plat-cb:checked')).map(cb => cb.value);
    if(selected.length === 0) return toast("请至少勾选一个平台", "error");
    
    m.querySelector("#start").disabled = true;
    m.querySelector("#start").textContent = "并发中...";

    const res = await fetch("https://spider.lynli.me/api/spider/search", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: m.querySelector("#kw").value, platforms: selected })
    });
    const resData = await res.json();
    
    m.querySelector("#result").style.display = "block";
    m.querySelector("#tb").innerHTML = resData.data.map(item => `
      <tr>
        <td><strong>${item.platform}</strong></td><td>${item.title}</td><td style="color:#34d399;">¥${item.cost}</td><td style="color:var(--pri);">¥${item.profit}</td>
        <td><button class="btn btn-sm btn-primary" onclick="window.importProduct('${item.title}', ${item.cost}, ${item.price})">一键上架</button></td>
      </tr>`).join('');
    m.querySelector("#start").disabled = false;
    m.querySelector("#start").textContent = "开始抓取";
  };

  window.importProduct = async (title, cost, price) => {
    await fetch("https://spider.lynli.me/api/products", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, cost, price })
    });
    toast("商品已真实存入服务器数据库！", "success");
  };
}
