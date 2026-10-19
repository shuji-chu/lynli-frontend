import { showToast } from "../components/toast.js";
import { initTabs } from "../components/tabs.js";

export async function render(mount) {
  mount.innerHTML = `
    <div class="card">
      <div class="card__head" style="align-items:flex-start;flex-wrap:wrap;gap:16px;">
        <div class="tabs-header" style="flex:1;border:0;" id="prod-tabs">
          <div class="tab-item is-active" data-target="pane-selling">出售中 (120)</div>
          <div class="tab-item" data-target="pane-warehouse">仓库中 (45)</div>
          <div class="tab-item" data-target="pane-draft">草稿箱 (3)</div>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn--outline btn--sm">导入商品</button>
          <button class="btn btn--primary btn--sm" onclick="alert('打开新建商品页面')">+ 发布新商品</button>
        </div>
      </div>

      <div class="tabs-content" style="margin-top:20px;">
        <div class="tab-pane is-active" id="pane-selling">
          <div class="filter-bar">
            <select class="field__input" style="width:150px;height:32px;padding:0 10px;font-size:12px;"><option>全部分类</option><option>家居生活</option></select>
            <input type="text" class="field__input" placeholder="搜索商品名称..." style="width:240px;height:32px;font-size:12px;">
            <button class="btn btn--outline btn--sm">筛选</button>
          </div>
          
          <div class="product-grid">
            ${generateProducts()}
          </div>
          
          <div class="pagination" style="margin-top:20px;">
            <span class="page-info">共 120 件商品</span>
            <div class="page-btns">
              <button class="btn btn--outline btn--sm" disabled>上一页</button>
              <button class="btn btn--primary btn--sm">1</button>
              <button class="btn btn--outline btn--sm">2</button>
              <button class="btn btn--outline btn--sm">下一页</button>
            </div>
          </div>
        </div>
        
        <div class="tab-pane" id="pane-warehouse">
          <div class="view-empty"><h2>仓库暂无商品</h2></div>
        </div>
        <div class="tab-pane" id="pane-draft">
          <div class="view-empty"><h2>暂无草稿</h2></div>
        </div>
      </div>
    </div>
  `;
  
  initTabs(mount.querySelector("#prod-tabs"));
}

function generateProducts() {
  return Array.from({ length: 6 }).map((_, i) => `
    <div class="product-card">
      <div class="product-img">
        <img src="https://picsum.photos/300/300?random=${i}" alt="商品图">
        <span class="product-status">出售中</span>
      </div>
      <div class="product-info">
        <div class="product-title">智能感应保温杯 大容量 北欧风 厂家直供 - 颜色随机发</div>
        <div class="product-price-row">
          <div class="product-price">¥ 69.90</div>
          <div class="product-cost">成本 ¥ 25.00</div>
        </div>
        <div class="product-meta">
          <span>库存: 120</span>
          <span>销量: 45</span>
        </div>
        <div class="product-actions">
          <button class="btn btn--outline btn--sm" onclick="alert('编辑商品')">编辑</button>
          <button class="btn btn--outline btn--sm" onclick="alert('下架商品')">下架</button>
        </div>
      </div>
    </div>
  `).join('');
}
