import { api } from '../api.js';
export async function renderOrders(container) {
    container.innerHTML = `
        <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h3 class="font-bold text-lg mb-4 text-slate-800">全部订单</h3>
            <div id="order-list" class="space-y-4"><div class="text-center text-slate-400 p-8">加载订单中...</div></div>
        </div>`;
    try {
        const res = await api.getOrders();
        const list = res.data || [];
        const listEl = document.getElementById('order-list');
        if(list.length === 0) { listEl.innerHTML = '<div class="text-center text-slate-400 p-8">暂无订单</div>'; return; }
        listEl.innerHTML = list.map(order => `
            <div class="border border-slate-200 rounded-2xl p-4 hover:shadow-md transition">
                <div class="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
                    <span class="text-sm text-slate-500">订单号: <span class="font-mono text-slate-800">${order.order_no}</span></span>
                    <span class="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold">${order.status || '待发货'}</span>
                </div>
                <div class="flex justify-between items-center">
                    <div><div class="text-sm text-slate-800 font-medium">收件人: ${order.receiver_name}</div><div class="text-xs text-slate-500 mt-1">电话: ${order.receiver_phone}</div></div>
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">发货</button>
                </div>
            </div>`).join('');
    } catch (e) { document.getElementById('order-list').innerHTML = `<div class="text-red-500 text-center p-8">加载失败</div>`; }
}
