import { api } from '../api.js';
export async function renderProducts(container) {
    container.innerHTML = `<div id="list" class="space-y-3"><div class="text-center text-slate-400 py-10"><i class="fa-solid fa-spinner fa-spin"></i></div></div>`;
    const res = await api.getProducts();
    document.getElementById('list').innerHTML = (res.data || []).map(item => `
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
            <img src="${item.image_url}" class="w-20 h-20 rounded-xl object-cover border">
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start">
                    <h3 class="font-bold text-slate-800 truncate pr-2">${item.title}</h3>
                    <span class="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shrink-0">在售</span>
                </div>
                <p class="text-xs text-slate-400 mt-1">成本: ¥${item.cost_price}</p>
                <div class="flex justify-between items-end mt-2">
                    <span class="text-lg font-black text-blue-600">¥${item.price}</span>
                    <button class="px-3 py-1 bg-slate-50 text-slate-600 text-xs border rounded-lg">编辑</button>
                </div>
            </div>
        </div>
    `).join('');
}
