export async function renderDashboard(container) {
    container.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100"><p class="text-xs text-slate-500">今日营收</p><h3 class="text-xl font-black text-slate-800 mt-1">¥ 12,450</h3></div>
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100"><p class="text-xs text-slate-500">订单总数</p><h3 class="text-xl font-black text-slate-800 mt-1">142</h3></div>
        </div>
        <div class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 class="font-bold text-slate-700 mb-4 text-sm">近7天营收趋势</h3>
            <div id="chart" class="w-full h-64 md:h-80"></div>
        </div>
    `;
    setTimeout(() => {
        const myChart = echarts.init(document.getElementById('chart'));
        myChart.setOption({
            grid: { top: 10, right: 10, bottom: 20, left: 40 },
            xAxis: { type: 'category', data: ['周一','周二','周三','周四','周五','周六','周日'], axisLine: { lineStyle: { color: '#e2e8f0' } } },
            yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9' } } },
            series: [{ data: [1200, 2000, 1500, 3000, 2400, 4000, 3200], type: 'line', smooth: true, areaStyle: { color: '#3b82f6' }, itemStyle: { color: '#3b82f6' } }]
        });
        window.addEventListener('resize', () => myChart.resize());
    }, 100);
}
