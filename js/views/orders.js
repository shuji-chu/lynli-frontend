import { api } from '../api.js';

export async function renderOrders() {
    const res = await api.getOrders();
    const orders = res.data || [];
    
    const cards = orders.map(o => `
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
            <div class="flex justify-between items-center pb-3 border-b border-gray-100">
                <span class="font-bold text-gray-700">${o.trade_no}</span>
                <span class="text-xs px-2 py-1 rounded-full ${o.status === 0 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}">${o.status === 0 ? '待发货' : '已发货'}</span>
            </div>
            <div class="text-sm text-gray-500 leading-relaxed">
                <p>收件人：${o.receiver} <span class="text-gray-400">(${o.phone})</span></p>
                <p>地址：${o.address}</p>
            </div>
            <div class="flex justify-between items-center mt-2">
                <span class="text-lg font-bold text-red-500">¥${o.total_amount}</span>
                ${o.status === 0 
                    ? `<button onclick="window.doShip('${o.trade_no}')" class="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">立即发货</button>`
                    : `<button onclick="window.showMap('${o.tracking_no}')" class="text-blue-600 text-sm font-medium hover:underline">查看物流 (${o.tracking_no})</button>`
                }
            </div>
        </div>
    `).join('');

    return `<div class="fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${cards || '暂无订单'}</div>`;
}
