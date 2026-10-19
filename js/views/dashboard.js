export async function renderDashboard(container) {
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            ${createStatCard('今日营收', '¥ 12,450.00', 'fa-wallet', 'text-emerald-500', 'bg-emerald-100')}
            ${createStatCard('订单总数', '142', 'fa-shopping-cart', 'text-blue-500', 'bg-blue-100')}
            ${createStatCard('活跃商品', '856', 'fa-box', 'text-purple-500', 'bg-purple-100')}
            ${createStatCard('AI待抓取', '12', 'fa-robot', 'text-orange-500', 'bg-orange-100')}
        </div>
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 class="font-bold text-lg mb-4 text-slate-700">近 7 天营收趋势</h3>
            <div id="chart-revenue" style="height: 350px; width: 100%;"></div>
        </div>
    `;
    const chartDom = document.getElementById('chart-revenue');
    if (chartDom && window.echarts) {
        const myChart = echarts.init(chartDom);
        myChart.setOption({
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLine: { lineStyle: { color: '#e2e8f0' } } },
            yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9' } } },
            series: [{
                data: [1200, 2000, 1500, 3000, 2400, 4000, 3200], type: 'line', smooth: true,
                areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59, 130, 246, 0.5)' }, { offset: 1, color: 'rgba(59, 130, 246, 0.01)' }]) },
                itemStyle: { color: '#3b82f6' }, lineStyle: { width: 3 }
            }]
        });
        window.addEventListener('resize', () => myChart.resize());
    }
}
function createStatCard(title, value, icon, iconColor, iconBg) {
    return `<div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div><p class="text-sm text-slate-500 font-medium mb-1">${title}</p><h3 class="text-2xl font-black text-slate-800 tracking-tight">${value}</h3></div>
            <div class="w-14 h-14 ${iconBg} ${iconColor} rounded-2xl flex items-center justify-center text-xl"><i class="fa-solid ${icon}"></i></div>
        </div>`;
}
