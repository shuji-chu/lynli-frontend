export function renderFinance() {
    return `
        <div class="fade-in grid grid-cols-2 gap-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 class="text-lg font-bold mb-4">财务对账</h3>
                <p class="text-gray-500 text-sm mb-6">记录每笔订单的收入和商品成本，自动计算毛利。</p>
                <table class="w-full text-left">
                    <tr class="border-b border-gray-100 text-gray-400 text-sm"><th class="pb-2">交易单号</th><th class="pb-2">流水金额</th><th class="pb-2">状态</th></tr>
                    <tr class="border-b border-gray-50"><td class="py-3">ORD-001</td><td class="text-green-500 font-bold">+ ¥299</td><td>已支付</td></tr>
                </table>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 class="text-lg font-bold mb-4">利润分析</h3>
                <div class="text-4xl font-bold text-blue-600 mb-2">¥ 8,240.00</div>
                <p class="text-gray-500 text-sm">本月预计净利润（扣除代发成本）</p>
            </div>
        </div>
    `;
}
