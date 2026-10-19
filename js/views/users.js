export function renderUsers(users) {
    return `
        <div class="data-card">
            <table style="width:100%; border-collapse:collapse; text-align:left;">
                <tr style="border-bottom:1px solid var(--border); color:var(--text-sub);">
                    <th style="padding:10px;">头像</th>
                    <th>昵称/ID</th>
                    <th>邮箱账号</th>
                    <th>状态</th>
                </tr>
                ${users.map(u => `
                    <tr style="border-bottom:1px solid var(--border);">
                        <td style="padding:10px;"><img src="${u.avatar || 'https://via.placeholder.com/32'}" class="avatar"></td>
                        <td>${u.nickname || '未命名'} <br><span style="color:var(--text-sub);font-size:12px;">UID: ${u.uid || u.id}</span></td>
                        <td>${u.email}</td>
                        <td style="color:${u.banned ? 'var(--danger)' : 'var(--success)'}">${u.banned ? '封禁' : '正常'}</td>
                    </tr>
                `).join('')}
            </table>
        </div>
    `;
}
