import { toast } from "../../components/ui/toast.js";

export async function render(m) {
  m.innerHTML = `
    <div class="card">
      <h2>全网真实接口抓取</h2>
      <div style="display:flex;gap:12px;margin-top:20px;">
        <input class="input" id="kw" placeholder="输入英文关键词（如：phone, shoe）">
        <button class="btn btn-primary" id="start" style="width:120px;flex:none;">开始抓取</button>
      </div>
    </div>
    <div class="card" id="result" style="display:none;">
      <h2>真实抓取结果（来自服务器网络请求）</h2>
      <table class="table"><thead><tr><th>平台</th><th>商品图</th><th>标题</th><th>成本</th><th>利润</th><th>操作</th></tr></thead><tbody id="tb"></tbody></table>
    </div>`;

  m.querySelector("#start").onclick = async () => {
    const kw = m.querySelector("#kw").value;
    if(!kw) return toast("请输入关键词", "error");
    
    m.querySelector("#start").disabled = true;
    m.querySelector("#start").textContent = "请求中...";

    try {
      const res = await fetch("https://spider.lynli.me/api/spider/search", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: kw })
      });
      const resData = await res.json();
      if(resData.code === 200) {
        m.querySelector("#result").style.display = "block";
        m.querySelector("#tb").innerHTML = resData.data.map(item => `
          <tr>
            <td>${item.platform}</td>
            <td><img src="${item.img}" style="width:40px;height:40px;border-radius:4px;"></td>
            <td>${item.title}</td>
            <td style="color:#34d399;">¥${item.cost}</td>
            <td style="color:var(--pri);">¥${item.profit}</td>
            <td><button class="btn btn-sm btn-primary" onclick="window.importProduct('${item.title}', ${item.cost}, ${item.price})">一键上架</button></td>
          </tr>`).join('');
        toast("服务器真实抓取完成", "success");
      } else {
        toast(resData.msg, "error");
      }
    } catch(e) { toast("服务器请求外网失败", "error"); }
    m.querySelector("#start").disabled = false;
    m.querySelector("#start").textContent = "开始抓取";
  };

  window.importProduct = async (title, cost, price) => {
    await fetch("https://spider.lynli.me/api/products", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, cost, price })
    });
    toast("商品已真实入库！", "success");
  };
}
