import { api } from '../api.js';
export async function renderOrders(container) {
    container.innerHTML = `<div class="bg-white rounded-3xl p-6 shadow-sm"><h3 class="mb-4 font-bold">订单列表</h3><div id="list" class="space-y-4"></div></div>`;
    const res = await api.getOrders();
    document.getElementById('list').innerHTML = (res.data || []).map(i => `<div class="border p-4 rounded-xl flex justify-between"><div>${i.order_no} - ${i.receiver_name}</div><span class="text-orange-500 font-bold">${i.status}</span></div>`).join('');
}
