import { api } from '../api.js';
export async function renderSpider(container) {
    container.innerHTML = `
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white mb-8 shadow-xl shadow-blue-500/20">
            <h2 class="text-2xl font-bold mb-2">AI 智能选品抓取</h2>
            <p class="text-blue-100 mb-6 text-sm">输入商品关键词，系统自动从 1688 抓取。</p>
            <div class="flex space-x-4 max-w-2xl">
                <input type="text" id="spider-keyword" class="flex-1 px-4 py-3 rounded-xl text-slate-800 focus:outline-none" placeholder="例如: 夏季纯棉短袖">
                <button id="spider-btn" class="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition shadow-lg">开始抓取</button>
            </div>
        </div>
        <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h3 class="font-bold text-lg mb-4 text-slate-800">抓取草稿箱</h3>
            <div id="spider-drafts" class="text-center text-slate-400 p-8">暂未抓取商品。</div>
        </div>`;
    document.getElementById('spider-btn').addEventListener('click', async () => {
        const keyword = document.getElementById('spider-keyword').value;
        if (!keyword) return alert('请输入关键词');
        const btn = document.getElementById('spider-btn');
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 抓取中...'; btn.disabled = true;
        try {
            const res = await api.startSpider(keyword);
            document.getElementById('spider-drafts').innerHTML = `<pre class="text-xs text-left text-slate-500 bg-slate-50 p-4 rounded-xl">${JSON.stringify(res, null, 2)}</pre>`;
        } catch(e) { alert('抓取失败'); } finally { btn.innerHTML = '开始抓取'; btn.disabled = false; }
    });
}
