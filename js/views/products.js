import { showToast } from "../components/toast.js";

export async function render(mount) {
  mount.innerHTML = `
    <div class="card">
      <div class="card__head"><h2>在售商品</h2><button class="btn btn--primary btn--sm" style="width:auto;" id="add-btn">+ 发布商品</button></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>商品名称</th><th>售价</th><th>库存</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr><td>极简陶瓷马克杯</td><td>¥ 39.9</td><td>120</td><td><span class="status-tag is-ok">在售</span></td><td><button class="btn btn--outline btn--sm" onclick="alert('编辑商品')">编辑</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  mount.querySelector("#add-btn").addEventListener("click", () => showToast("打开新建商品抽屉...", "info"));
}
