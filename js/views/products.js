import { api } from '../api.js';

export async function renderProducts(container) {
    container.innerHTML = `
        <div class="flex flex-col space-y-4">
            <!-- 顶部工具栏 -->
            <div class="flex gap-2">
                <div class="relative flex-1">
                    <i class="fa-solid fa-search absolute left-3 top-3 text-slate-400"></i>
                    <input type="text" placeholder="搜索商品名称或ID" class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-sm shadow-sm">
                </div>
                <button class="px-4 py-2.5 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>

            <!-- 商品列表 -->
            <div id="product-list" class="space-y-3 pb-10">
                <div class="flex justify-center items-center py-10 text-slate-400"><i class="fa-solid fa-spinner fa-spin mr-2"></i>加载中...</div>
            </div>
        </div>
    `;

    try {
        const res = await api.getProducts();
        const list = res.data || [];
        const listEl = document.getElementById('product-list');

        if (list.length === 0) {
            listEl.innerHTML = `<div class="text-center py-10 text-slate-400">暂无商品，请去 AI 选品抓取</div>`;
            return;
        }

        listEl.innerHTML = list.map(item => `
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
                <div class="flex gap-4">
                    <!-- 商品图片 -->
                    <img src="${item.image_url || 'https://via.placeholder.com/100'}" class="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0">
                    
                    <!-- 商品信息 -->
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start mb-1">
                            <h3 class="font-bold text-slate-800 text-sm truncate pr-2">${item.title}</h3>
                            <span class="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full border border-emerald-100 shrink-0 font-medium">在售</span>
                        </div>
                        <div class="text-xs text-slate-400 mb-2">ID: ${item.id} | 成本: ¥${item.cost_price || 0}</div>
                        <div class="flex items-end justify-between">
                            <div class="flex items-baseline gap-1">
                                <span class="text-xs text-slate-500">售价</span>
                                <span class="text-lg font-black text-blue-600">¥${item.price || 0}</span>
                            </div>
                            <div class="flex gap-2">
                                <button class="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-100">编辑</button>
                                <button class="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg border border-blue-100 hover:bg-blue-100">采购</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        document.getElementById('product-list').innerHTML = `<div class="text-center py-10 text-red-500">加载失败，请重试</div>`;
    }
}
