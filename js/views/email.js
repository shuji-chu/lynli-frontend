export function renderEmail() {
    return `
        <div class="fade-in max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 class="text-xl font-bold mb-6 text-gray-800">Resend 邮件群发中心</h3>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-600 mb-2">邮件主题</label>
                <input type="text" id="email-subject" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500" placeholder="例如：LYNLI 私密上新">
            </div>
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-600 mb-2">邮件正文 (HTML 格式)</label>
                <textarea id="email-content" rows="6" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500 font-mono text-sm" placeholder="<h1>新品上市</h1><p>点击查看...</p>"></textarea>
            </div>
            <button onclick="window.sendBroadcast()" class="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                立即发送至所有用户
            </button>
        </div>
    `;
}
