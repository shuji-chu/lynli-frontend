import { api } from '../api.js';
export async function renderSpider(container) {
    container.innerHTML = `<div class="bg-blue-600 p-8 rounded-3xl text-white"><h3 class="text-2xl mb-4 font-bold">AI 选品</h3><input id="kw" class="text-black p-3 rounded-xl w-64 mr-4"><button id="btn" class="bg-white text-blue-600 font-bold px-6 py-3 rounded-xl">开始抓取</button></div>`;
    document.getElementById('btn').onclick = async () => {
        const res = await api.startSpider(document.getElementById('kw').value);
        alert(res.msg);
    }
}
