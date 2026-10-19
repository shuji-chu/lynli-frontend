import { api } from '../api.js';
export async function renderOrders(container) {
    container.innerHTML = `<div id="list" class="space-y-4"><div class="text-center text-slate-400 py-10"><i class="fa-solid fa-spinner fa-spin"></i></div></div>`;
    const res = await api.getOrders();
    document.getElementById('list').innerHTML = (res.data || []).map(o => `
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div class="flex justify-between items-center pb-3 border-b border-dashed mb-3">
                <span class="text-xs font-mono text-slate-500">${o.order_no}</span>
                <span class="text-xs px-2 py-1 bg-orange-50 text-orange-600 rounded border border-orange-100 font-bold">${o.status}</span>
            </div>
            <div class="flex justify-between items-center">
                <div>
                    <p class="font-bold text-slate-800">${o.receiver_name}</p>
                    <p class="text-xs text-slate-500 mt-1">${o.receiver_phone}</p>
                </div>
                <button class="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow">发货</button>
            </div>
        </div>
    `).join('');
}
