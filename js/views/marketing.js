export function renderMarketing() {
    return `
        <div class="fade-in max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 class="text-xl font-bold mb-6">Resend 邮件群发</h3>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-600 mb-2">邮件主题</label>
                <input type="text" id="email-subject" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500" placeholder="例如：LYNLI 私密上新">
            </div>
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-600 mb-2">邮件正文 (HTML)</label>
                <textarea id="email-content" rows="6" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500 font-mono text-sm" placeholder="<h1>新品上市</h1>"></textarea>
            </div>
            <button onclick="window.sendBroadcast()" class="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors">立即发送至所有会员</button>
        </div>
    `;
}
