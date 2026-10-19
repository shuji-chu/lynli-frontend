import { showBigScreen } from "./bigscreen.js";

export async function render(container) {
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="font-size: 20px;">老板驾驶舱 👋</h2>
      <button class="btn" id="btn-bigscreen" style="width: auto; padding: 10px 20px; margin: 0; background: linear-gradient(135deg, #8b5cf6, #3b82f6); box-shadow: 0 0 20px rgba(59,130,246,0.5); border-radius: 30px;">
        开启全景大屏
      </button>
    </div>
    
    <div class="kpi-grid">
      <div class="card"><div class="kpi-label">今日营收 (实时)</div><div class="kpi-val" style="color:#3b82f6;">¥ 124,500</div></div>
      <div class="card"><div class="kpi-label">今日订单</div><div class="kpi-val">342</div></div>
      <div class="card"><div class="kpi-label">待发货</div><div class="kpi-val" style="color:#f87171;">56</div></div>
      <div class="card"><div class="kpi-label">在售商品</div><div class="kpi-val">1280</div></div>
    </div>

    <div style="margin-bottom: 10px; color: var(--dim); font-size: 13px;">💡 提示：卡片支持拖拽自定义排序</div>
    <div class="drag-container" id="drag-container">
      <div class="card drag-item" draggable="true">
        <div class="kpi-label">近 7 日营收趋势</div>
        <div class="css-chart" style="margin-top: 30px;">
          <div class="chart-bar" style="height: 40%;"><span>4.2k</span></div>
          <div class="chart-bar" style="height: 60%;"><span>6.1k</span></div>
          <div class="chart-bar" style="height: 35%;"><span>3.8k</span></div>
          <div class="chart-bar" style="height: 80%;"><span>8.5k</span></div>
          <div class="chart-bar" style="height: 55%;"><span>5.9k</span></div>
          <div class="chart-bar" style="height: 90%;"><span>9.2k</span></div>
          <div class="chart-bar" style="height: 70%;"><span>7.4k</span></div>
        </div>
      </div>
      <div class="card drag-item" draggable="true">
        <div class="kpi-label">快捷功能 / 系统提醒</div>
        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
          <div style="display: flex; justify-content: space-between; font-size: 14px;"><span>待处理售后</span><span class="badge badge-danger">3 笔</span></div>
          <div style="display: flex; justify-content: space-between; font-size: 14px;"><span>库存预警商品</span><span class="badge badge-warning">12 件</span></div>
          <div style="display: flex; justify-content: space-between; font-size: 14px;"><span>待付款采购</span><span class="badge badge-info">5 单</span></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-bigscreen').onclick = showBigScreen;

  // 拖拽逻辑
  const containerDrag = document.getElementById('drag-container');
  let draggedItem = null;

  containerDrag.querySelectorAll('.drag-item').forEach(item => {
    item.addEventListener('dragstart', function() {
      draggedItem = this;
      setTimeout(() => this.classList.add('dragging'), 0);
    });
    item.addEventListener('dragend', function() {
      this.classList.remove('dragging');
      containerDrag.querySelectorAll('.drag-item').forEach(i => i.classList.remove('drag-over'));
      draggedItem = null;
    });
    item.addEventListener('dragover', function(e) {
      e.preventDefault();
      if (this !== draggedItem) this.classList.add('drag-over');
    });
    item.addEventListener('dragleave', function() { this.classList.remove('drag-over'); });
    item.addEventListener('drop', function() {
      this.classList.remove('drag-over');
      if (this !== draggedItem) {
        let allItems = [...containerDrag.querySelectorAll('.drag-item')];
        let draggedIndex = allItems.indexOf(draggedItem);
        let targetIndex = allItems.indexOf(this);
        if (draggedIndex < targetIndex) this.parentNode.insertBefore(draggedItem, this.nextSibling);
        else this.parentNode.insertBefore(draggedItem, this);
      }
    });
  });
}
