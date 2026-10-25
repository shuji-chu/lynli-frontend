// ============================================================
// bots_matrix.js - 机器人矩阵控制中心（真实对接 /admin/bots/matrix/*，无假数据）
// 三平台数据完全隔离，按 bot key 独立请求与渲染
// 依赖：app.js 的 API_BASE / showToast / escapeHtml / fmtTime
// ============================================================

const BOT_NAMES = { safew: '签到机器人', mivra: '综合机器人', qingtian: '晴天机器人' };

window.BotMX = {
    _bot: 'safew',
    _stats: [],
    _users: [],
    _chatTimer: null,
    _chatUid: '',

    _headers() { return { 'Authorization': 'Bearer ' + localStorage.getItem('lynli_admin_token'), 'Content-Type': 'application/json' }; },

    async _get(path) {
        const res = await fetch(`${API_BASE}${path}`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('lynli_admin_token') } });
        const j = await res.json();
        if (j.code !== 1) throw new Error(j.msg || '请求失败');
        return j.data;
    },
    async _post(path, body) {
        const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: this._headers(), body: JSON.stringify(body) });
        const j = await res.json();
        if (j.code !== 1) throw new Error(j.msg || '操作失败');
        return j;
    },

    load() { this.switchBot(this._bot, true); },

    switchBot(bot, silent) {
        const prevBot = this._bot;
        if (bot !== 'chat') this._bot = bot;
        document.querySelectorAll('#bot-tabs .bot-tab').forEach(t => t.classList.toggle('active', t.dataset.bot === bot));
        const isChat = bot === 'chat';
        document.querySelector('.bot-users-card').style.display = isChat ? 'none' : '';
        document.getElementById('bot-chat-card').style.display = isChat ? '' : 'none';
        document.getElementById('bot-kpis').style.display = isChat ? 'none' : '';
        if (isChat) {
            this.stopChatPoll();
            this.pollChat();
            this._chatTimer = setInterval(() => this.pollChat(), 3000);
        } else {
            this.stopChatPoll();
            this.loadStats();
            this.loadUsers();
        }
    },

    stopChatPoll() { if (this._chatTimer) { clearInterval(this._chatTimer); this._chatTimer = null; } },

    // ---------- KPI ----------
    async loadStats() {
        const box = document.getElementById('bot-kpis');
        try {
            this._stats = await this._get('/admin/bots/matrix/stats');
            const cur = this._stats.find(s => s.bot === this._bot) || {};
            const online = cur.online
                ? '<span class="bot-online bot-online-yes">在线运行</span>'
                : '<span class="bot-online bot-online-no">未检测到进程</span>';
            box.innerHTML = `
              <div class="card stat-card"><div class="stat-label">${escapeHtml(cur.name || '--')} · 总用户</div><div class="stat-num">${cur.total_users ?? 0}</div></div>
              <div class="card stat-card"><div class="stat-label">今日签到</div><div class="stat-num">${cur.today_sign ?? 0}</div></div>
              <div class="card stat-card"><div class="stat-label">付费用户</div><div class="stat-num">${cur.paid_users ?? 0}</div></div>
              <div class="card stat-card"><div class="stat-label">封禁中</div><div class="stat-num">${cur.banned ?? 0}</div></div>
              <div class="card stat-card"><div class="stat-label">进程状态</div><div style="margin-top:8px">${online}</div></div>`;
        } catch (e) {
            box.innerHTML = `<div class="empty-tip">KPI 加载失败：${escapeHtml(e.message)}</div>`;
            showToast('机器人状态加载失败：' + e.message, 'error');
        }
    },

    // ---------- 用户列表 ----------
    async loadUsers() {
        const box = document.getElementById('bot-user-list');
        document.getElementById('bot-users-title').textContent = BOT_NAMES[this._bot] + ' · 用户列表';
        box.innerHTML = '<div class="empty-tip">加载中...</div>';
        try {
            this._users = await this._get(`/admin/bots/matrix/users?bot_name=${this._bot}`);
            this.renderUsers();
        } catch (e) {
            box.innerHTML = '<div class="empty-tip">加载失败，请重试</div>';
            showToast('用户列表加载失败：' + e.message, 'error');
        }
    },

    search() { this.renderUsers(); },

    renderUsers() {
        const box = document.getElementById('bot-user-list');
        const kw = (document.getElementById('bot-search-input')?.value || '').trim().toLowerCase();
        let rows = this._users;
        if (kw) rows = rows.filter(u => String(u.tg_id).includes(kw) || (u.nickname || '').toLowerCase().includes(kw) || (u.suser || '').toLowerCase().includes(kw));
        if (!rows.length) { box.innerHTML = `<div class="empty-tip">${kw ? '没有匹配的用户' : '暂无用户数据'}</div>`; return; }
        box.innerHTML = rows.map(u => {
            const name = (u.nickname || u.tg_id).slice(0, 1).toUpperCase();
            const expire = u.expire > 0 ? fmtTime(u.expire) : '未开通';
            const banned = Number(u.banned) === 1;
            return `
            <div class="bot-user-item ${banned ? 'bot-user-banned' : ''}">
              <div class="staff-avatar bot-avatar-sm">${escapeHtml(name)}</div>
              <div class="staff-main">
                <div class="staff-nick">${escapeHtml(u.nickname || '--')}${banned ? '<span class="bot-ban-badge">已封禁</span>' : ''}</div>
                <div class="staff-mail">ID ${escapeHtml(u.tg_id)} · ${fmtBytes(u.traffic_mb)} · 到期 ${expire}${u.suser ? ' · ' + escapeHtml(u.suser) : ''}</div>
              </div>
              <button class="btn btn-ghost btn-xs" onclick="BotMX.openAction('${escapeHtml(u.tg_id)}')">操作</button>
            </div>`;
        }).join('');
    },

    // ---------- 操作弹窗 ----------
    openAction(uid) {
        const u = this._users.find(x => String(x.tg_id) === String(uid));
        if (!u) return;
        document.getElementById('ba-uid').value = uid;
        document.getElementById('ba-avatar').textContent = (u.nickname || uid).slice(0, 1).toUpperCase();
        document.getElementById('ba-nick').textContent = u.nickname || '--';
        document.getElementById('ba-meta').textContent = `ID ${u.tg_id} · ${BOT_NAMES[this._bot]}`;
        const badge = document.getElementById('ba-banned');
        const isBanned = Number(u.banned) === 1;
        badge.style.display = isBanned ? '' : 'none';
        document.getElementById('ba-ban-toggle').textContent = isBanned ? '解封' : '封禁';
        document.getElementById('ba-gb').value = '';
        document.getElementById('ba-days').value = '';
        document.getElementById('ba-msg').value = '';
        document.getElementById('bot-action-mask').style.display = 'flex';
    },

    closeAction() { document.getElementById('bot-action-mask').style.display = 'none'; },

    _curUid() { return document.getElementById('ba-uid').value; },

    async doBan() {
        const isBanned = Number((this._users.find(x => String(x.tg_id) === String(this._curUid())) || {}).banned) === 1;
        try {
            const r = await this._post('/admin/bots/matrix/action', { bot: this._bot, action: isBanned ? 'unban' : 'ban', uid: this._curUid() });
            showToast(r.msg || '已执行', 'success');
            this.closeAction(); this.loadStats(); this.loadUsers();
        } catch (e) { showToast(e.message, 'error'); }
    },

    async doAction(action) {
        try {
            const r = await this._post('/admin/bots/matrix/action', { bot: this._bot, action, uid: this._curUid() });
            showToast(r.msg || '已执行', 'success');
        } catch (e) { showToast(e.message, 'error'); }
    },

    async doGrant() {
        const gb = parseFloat(document.getElementById('ba-gb').value || 0);
        const days = parseFloat(document.getElementById('ba-days').value || 0);
        if (gb <= 0 && days <= 0) { showToast('流量与天数至少填一项', 'error'); return; }
        try {
            const r = await this._post('/admin/bots/matrix/action', { bot: this._bot, action: 'grant', uid: this._curUid(), gb, days });
            showToast(r.msg || '已到账', 'success');
            this.closeAction(); this.loadUsers();
        } catch (e) { showToast(e.message, 'error'); }
    },

    async doSend() {
        const text = (document.getElementById('ba-msg').value || '').trim();
        if (!text) { showToast('消息不能为空', 'error'); return; }
        try {
            const r = await this._post('/admin/bots/matrix/action', { bot: this._bot, action: 'send_msg', uid: this._curUid(), text });
            showToast(r.msg || '发送成功', 'success');
            document.getElementById('ba-msg').value = '';
        } catch (e) { showToast(e.message, 'error'); }
    },

    // ---------- 全站群发 ----------
    openBroadcast() {
        document.getElementById('bb-text').value = '';
        document.getElementById('bot-broadcast-mask').style.display = 'flex';
    },
    closeBroadcast() { document.getElementById('bot-broadcast-mask').style.display = 'none'; },
    async doBroadcast() {
        const text = (document.getElementById('bb-text').value || '').trim();
        if (!text) { showToast('消息不能为空', 'error'); return; }
        const btn = document.getElementById('bb-send');
        btn.disabled = true; const old = btn.textContent; btn.textContent = '启动中...';
        try {
            const r = await this._post('/admin/bots/matrix/action', { bot: this._bot, action: 'broadcast', text });
            showToast(r.msg || '群发已启动', 'success');
            this.closeBroadcast();
        } catch (e) { showToast(e.message, 'error'); }
        finally { btn.disabled = false; btn.textContent = old; }
    },

    // ---------- 实时对话（3 秒轮询） ----------
    async pollChat() {
        const win = document.getElementById('bot-chat-window');
        try {
            const q = this._chatUid ? `&uid=${encodeURIComponent(this._chatUid)}` : '';
            const msgs = await this._get(`/admin/bots/matrix/chat?bot=${this._bot}${q}`);
            document.getElementById('bot-chat-status').textContent = `轮询中 · 每 3 秒刷新 · ${msgs.length} 条记录`;
            if (!msgs.length) { win.innerHTML = '<div class="empty-tip">暂无对话记录（机器人上报后自动出现）</div>'; }
            else {
                win.innerHTML = msgs.map(mm => `
                  <div class="bot-msg ${Number(mm.is_admin) === 1 ? 'bot-msg-right' : 'bot-msg-left'}">
                    <div class="bot-msg-bubble">${escapeHtml(mm.text || '')}</div>
                    <div class="bot-msg-meta">${Number(mm.is_admin) === 1 ? '机器人/客服' : '用户 ' + escapeHtml(mm.uid)} · ${fmtTime(mm.ts)}</div>
                  </div>`).join('');
                win.scrollTop = win.scrollHeight;
            }
            if (!this._chatUid) {
                const us = await this._get(`/admin/bots/matrix/chat/users?bot=${this._bot}`);
                document.getElementById('bot-chat-uids').innerHTML =
                    '<span class="bot-uid-chip active" onclick="BotMX.pickUid(\'\')">全部</span>' +
                    us.map(x => `<span class="bot-uid-chip" onclick="BotMX.pickUid('${escapeHtml(x.uid)}')">${escapeHtml(x.uid)} (${x.count})</span>`).join('');
            }
        } catch (e) { /* 轮询失败静默，下一轮重试 */ }
    },

    pickUid(uid) {
        this._chatUid = uid;
        document.querySelectorAll('.bot-uid-chip').forEach(c => c.classList.toggle('active', c.textContent.startsWith(uid ? uid + ' ' : '全部')));
        this.pollChat();
    },

    async sendChat() {
        const uid = (document.getElementById('bot-chat-uid').value || '').trim();
        const text = (document.getElementById('bot-chat-text').value || '').trim();
        if (!uid || !text) { showToast('请填写对方 TG ID 与消息内容', 'error'); return; }
        try {
            const r = await this._post('/admin/bots/matrix/action', { bot: this._bot, action: 'send_msg', uid, text });
            showToast(r.msg || '发送成功', 'success');
            document.getElementById('bot-chat-text').value = '';
            this.pollChat();
        } catch (e) { showToast(e.message, 'error'); }
    }
};

// 兼容列表头：群发按钮注入（用户卡标题旁）
document.addEventListener('DOMContentLoaded', () => {
    const head = document.querySelector('.bot-users-head');
    if (head && !document.getElementById('bot-broadcast-btn')) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-ghost btn-xs'; btn.id = 'bot-broadcast-btn';
        btn.textContent = '全站群发'; btn.onclick = () => BotMX.openBroadcast();
        head.appendChild(btn);
    }
});
