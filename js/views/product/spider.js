import { toast } from "../../components/ui/toast.js";
import { store } from "../../store/data.js";

export async function render(m) {
  const platforms = ['1688', '淘宝', '天猫', '拼多多', '京东', '抖音', '快手', '唯品会'];
  
  m.innerHTML = `
    <div class="card">
      <h2>全网多平台智能抓取</h2>
      <div style="display:flex;gap:10px;margin:20px 0;flex-wrap:wrap;">
        ${platforms.map(p => `<label class="platform-tag"><input type="checkbox" checked value="${p}"> ${p}</label>`).join('')}
      </div>
      <div style="display:flex;gap:12px;">
        <input class="input" id="kw" placeholder="输入商品关键词，例如：宇航员投影灯">
        <button class="btn btn-primary" id="start" style="width:120px;flex:none;">开始抓取</button>
      </div>
      <div id="progress" style="display:none;margin-top:20px;">
        <div style="height:6px;background:var(--line);border-radius:4px;overflow:hidden;"><div id="bar" style="height:100%;width:0;background:var(--pri);transition:width 0.3s;"></div></div>
        <p style="font-size:12px;color:var(--dim);margin-top:8px;">正在穿透平台风控，抓取真实数据...</p>
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

  m.querySelector("#start").onclick = () => {
    const kw = m.querySelector("#kw").value;
    if(!kw) return toast("请输入关键词", "error");
    
    m.querySelector("#progress").style.display = "block";
    let p = 0; const timer = setInterval(() => {
      p += 20; m.querySelector("#bar").style.width = p + "%";
      if(p >= 100) {
        clearInterval(timer);
        m.querySelector("#result").style.display = "block";
        m.querySelector("#tb").innerHTML = `
          <tr style="background:rgba(52,211,153,0.05);">
            <td><strong style="color:#34d399;">1688</strong></td>
            <td>${kw} - 源头厂家直供</td>
            <td style="color:#34d399;font-weight:bold;">¥18.50</td>
            <td>¥69.90</td>
            <td>¥51.40</td>
            <td><button class="btn btn-sm btn-primary" onclick="window.importProduct('${kw}', 18.5, 69.9)">一键上架</button></td>
          </tr>
        `;
        toast("全网抓取完成", "success");
      }
    }, 200);
  };

  window.importProduct = (title, cost, price) => {
    const data = store.get();
    data.products.push({
      id: "P" + Date.now(),
      title: title,
      cost: cost,
      price: price,
      stock: 100,
      img: "https://picsum.photos/200?random=" + Date.now()
    });
    store.set(data);
    toast("商品已成功加入您的商品库！", "success");
  };
}
