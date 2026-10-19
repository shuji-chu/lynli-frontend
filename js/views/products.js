import { api } from '../api.js';
export async function renderProducts(container) {
    container.innerHTML = `<div class="bg-white rounded-3xl p-6 shadow-sm"><table class="w-full text-left"><thead><tr class="border-b"><th class="pb-4">商品</th><th class="pb-4">价格</th></tr></thead><tbody id="list"></tbody></table></div>`;
    const res = await api.getProducts();
    document.getElementById('list').innerHTML = (res.data || []).map(i => `<tr class="border-b"><td class="py-4 flex items-center"><img src="${i.image_url}" class="w-10 h-10 rounded mr-3">${i.title}</td><td class="py-4 text-blue-600 font-bold">¥${i.price}</td></tr>`).join('');
}
