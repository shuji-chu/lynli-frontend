export async function renderDashboard(container) {
    container.innerHTML = `<div class="bg-white p-6 rounded-3xl shadow-sm h-96"><div id="chart" class="w-full h-full"></div></div>`;
    const myChart = echarts.init(document.getElementById('chart'));
    myChart.setOption({ xAxis: { type: 'category', data: ['一', '二', '三', '四', '五', '六', '日'] }, yAxis: { type: 'value' }, series: [{ data: [120, 200, 150, 80, 70, 110, 130], type: 'line', smooth: true, itemStyle: { color: '#3b82f6' } }] });
}
