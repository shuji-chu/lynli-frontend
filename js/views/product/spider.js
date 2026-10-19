import { toast } from "../../components/ui/toast.js";
import { store } from "../../store/data.js";

export async function render(m) {
  const platforms = ['1688', '淘宝', '拼多多', '京东', '抖音'];
  
  m.innerHTML = `
    <div class="card">
      <h2>全网多平台智能抓取（真实接口）</h2>
      <div style="display:flex;gap:10px;margin:20px 0;flex-wrap:wrap;">
        ${platforms.map(p => `<label class="platform-tag"><input type="checkbox" checked value="${p}"> ${p}</label>`).join('')}
      </div>
      <div style="display:flex;gap:12px;">
        <input class="input" id="kw" placeholder="输入商品关键词，例如：宇航员投影灯">
        <button class="btn btn-primary" id="start" style="width:120px;flex:none;">开始抓取</button>
      </div>
      <div id="progress" style="display:none;margin-top:20px;">
        <div style="height:6px;background:var(--line);border-radius:4px;overflow:hidden;"><div id="bar" style="height:100%;width:50%;background:var(--pri);transition:width 0.3s;"></div></div>
        <p style="font-size:12px;color:var(--dim);margin-top:8px;">已发送请求至服务器，正在穿透风控...</p>
      </div>
    </div>

    <div class="card" id="result" style="display:none;">
      <h2>比价审核矩阵</h2>
      <table class="table">
        <thead><tr><th>平台</th><th>商品标题</th><th>拿货价</th><th>建议售价</th><th>预估利润</th><th>操作</th></tr></thead>
        <tbody id="tb"></tbody>
      </table>
    </div>
  `;

  m.querySelector("#start").onclick = async () => {
    const kw = m.querySelector("#kw").value;
    if(!kw) return toast("请输入关键词", "error");
    
    m.querySelector("#progress").style.display = "block";
    m.querySelector("#start").disabled = true;

    try {
      // 真实请求你的阿里云服务器
      const res = await fetch("https://spider.lynli.me/api/spider/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: kw })
      });
      const resData = await res.json();

      if (resData.code === 200) {
        m.querySelector("#progress").style.display = "none";
        m.querySelector("#result").style.display = "block";
        m.querySelector("#start").disabled = false;

        m.querySelector("#tb").innerHTML = resData.data.map(item => `
          <tr>
            <td><strong>${item.platform}</strong></td>
            <td>${item.title}</td>
            <td style="color:#34d399;font-weight:bold;">¥${item.cost}</td>
            <td>¥${item.price}</td>
            <td>¥${item.profit}</td>
            <td><button class="btn btn-sm btn-primary" onclick="window.importProduct('${item.title}', ${item.cost}, ${item.price})">一键上架</button></td>
          </tr>
        `).join('');
        toast("服务器爬虫返回数据成功", "success");
      }
    } catch (err) {
      toast("请求服务器失败，请检查 7002 端口", "error");
      m.querySelector("#start").disabled = false;
    }
  };

  window.importProduct = (title, cost, price) => {
    const data = store.get();
    data.products.push({ id: "P" + Date.now(), title, cost, price, stock: 100, img: "https://picsum.photos/200?random=" + Date.now() });
    store.set(data);
    toast("商品已成功入库！", "success");
  };
}
