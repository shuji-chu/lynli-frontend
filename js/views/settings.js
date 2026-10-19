export function renderSettings() {
    return `
        <div class="fade-in max-w-3xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 class="text-xl font-bold mb-6">系统与权限配置</h3>
            <div class="space-y-6">
                <div class="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div><div class="font-medium">API 网关地址</div><div class="text-sm text-gray-400">用于前后端通信</div></div>
                    <input type="text" value="https://spider.lynli.me" class="border border-gray-200 rounded px-4 py-2 text-sm bg-gray-50" disabled>
                </div>
                <div class="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div><div class="font-medium">超级管理员</div><div class="text-sm text-gray-400">拥有所有权限（发货、对账、群发）</div></div>
                    <button class="text-blue-600 text-sm font-medium">编辑</button>
                </div>
                <div class="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div><div class="font-medium">运营人员角色</div><div class="text-sm text-gray-400">仅可查看报表和商品库，无法操作发货</div></div>
                    <button class="text-blue-600 text-sm font-medium">编辑</button>
                </div>
            </div>
        </div>
    `;
}
