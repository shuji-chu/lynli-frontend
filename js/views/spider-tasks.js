import { showToast } from "../components/toast.js";

export async function render(mount) {
  mount.innerHTML = `
    <div class="card">
      <div class="card__head">
        <h2>抓取任务队列</h2>
        <div style="display:flex;gap:8px;">
          <button class="btn btn--outline btn--sm" id="clear-btn">清除已完成</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>任务 ID</th><th>抓取关键词</th><th>目标平台</th><th>抓取数量</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr>
              <td><strong>TSK-20231019-01</strong></td>
              <td>智能保温杯</td>
              <td><span class="status-tag">1688, 淘宝, 拼多多</span></td>
              <td>45 件</td>
              <td><span class="status-tag is-warn">进行中</span></td>
              <td><button class="btn btn--outline btn--sm">查看进度</button></td>
            </tr>
            <tr>
              <td><strong>TSK-20231018-09</strong></td>
              <td>宇航员投影灯</td>
              <td><span class="status-tag">1688, 抖音</span></td>
              <td>120 件</td>
              <td><span class="status-tag is-ok">已完成</span></td>
              <td><button class="btn btn--outline btn--sm" id="view-btn">查看结果</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  mount.querySelector("#view-btn").addEventListener("click", () => showToast("跳转到商品比对页", "success"));
  mount.querySelector("#clear-btn").addEventListener("click", () => showToast("已清理 3 个历史任务", "success"));
}
