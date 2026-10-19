import { api } from '../api.js';
export async function renderProducts(container) {
    container.innerHTML = `
        <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center"><h3 class="font-bold text-lg text-slate-800">已上架商品</h3></div>
            <table class="w-full text-left border-collapse">
                <thead><tr class="bg-slate-50 text-slate-500 text-sm"><th class="p-4 font-medium">商品信息</th><th class="p-4 font-medium">成本价</th><th class="p-4 font-medium">售价</th><th class="p-4 font-medium">状态</th></tr></thead>
                <tbody id="product-list" class="divide-y divide-slate-100"><tr><td colspan="4" class="p-8 text-center text-slate-400">加载中...</td></tr></tbody>
            </table>
        </div>`;
    try {
        const res = await api.getProducts();
        const list = res.data || [];
        const tbody = document.getElementById('product-list');
        if (list.length === 0) { tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-slate-400">暂无商品</td></tr>`; return; }
        tbody.innerHTML = list.map(item => `
            <tr class="hover:bg-slate-50 transition">
                <td class="p-4 flex items-center"><img src="${item.image_url || 'https://via.placeholder.com/50'}" class="w-12 h-12 rounded-lg object-cover mr-3"><div><div class="font-bold text-slate-800">${item.title}</div><div class="text-xs text-slate-400">ID: ${item.id}</div></div></td>
                <td class="p-4 text-slate-600">¥${item.cost_price || 0}</td>
                <td class="p-4 font-bold text-slate-800">¥${item.price || 0}</td>
                <td class="p-4"><span class="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold">在售</span></td>
            </tr>
        `).join('');
    } catch (e) { document.getElementById('product-list').innerHTML = `<tr><td colspan="4" class="p-8 text-center text-red-500">加载失败</td></tr>`; }
}
