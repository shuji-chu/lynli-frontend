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
            // 根据机器人类型动态渲染 KPI，分离签到与付费业务线
            let cards = `<div class="card stat-card"><div class="stat-label">${escapeHtml(cur.name || '--')} · 总用户</div><div class="stat-num">${cur.total_users ?? 0}</div></div>`;
            
            if (cur.bot === 'safew') {
              // 签到机器人专属
              cards += `<div class="card stat-card"><div class="stat-label">今日签到</div><div class="stat-num">${cur.today_sign ?? 0}</div></div>`;
            } else {
              // 综合/晴天机器人走付费体系
              cards += `<div class="card stat-card"><div class="stat-label">付费用户</div><div class="stat-num">${cur.paid_users ?? 0}</div></div>`;
            }

            cards += `
              <div class="card stat-card"><div class="stat-label">封禁中</div><div class="stat-num">${cur.banned ?? 0}</div></div>
              <div class="card stat-card"><div class="stat-label">进程状态</div><div style="margin-top:8px">${online}</div></div>`;
              
            box.innerHTML = cards;
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
            const name = (u.nickname || u.username || u.tg_id).slice(0, 1).toUpperCase();
            const expire = u.expire > 0 ? fmtTime(u.expire) : '未开通';
            const banned = Number(u.banned) === 1;
            const sub = `${u.username ? '@' + escapeHtml(u.username) + ' · ' : ''}ID ${escapeHtml(u.tg_id)}`;
            const avatar = u.avatar
                ? `<img class="staff-avatar bot-avatar-sm bot-avatar-img" src="${escapeHtml(u.avatar)}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
                   <span class="staff-avatar bot-avatar-sm" style="display:none">${escapeHtml(name)}</span>`
                : `<span class="staff-avatar bot-avatar-sm">${escapeHtml(name)}</span>`;
            return `
            <div class="bot-user-item ${banned ? 'bot-user-banned' : ''}">
              <div class="bot-avatar-wrap">${avatar}</div>
              <div class="staff-main">
                <div class="staff-nick">${escapeHtml(u.nickname || u.username || u.tg_id)}${banned ? '<span class="bot-ban-badge">已封禁</span>' : ''}</div>
                <div class="staff-mail">${sub} · ${fmtBytes(u.traffic_mb)} · 到期 ${expire}${u.suser ? ' · ' + escapeHtml(u.suser) : ''}</div>
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

    // ---------- 沉浸式客服系统（会话列表 + 气泡流 + 2 秒轮询） ----------
    _conv: [],
    _pending: new Set(),     // 本地"发送中"的临时消息文本去重

    // 进入「实时对话」Tab
    pollChat() { this.refreshConversations(); if (this._chatUid) this.pollHistory(); },

    // 左栏会话列表
    async refreshConversations() {
        try {
            this._conv = await this._get(`/admin/bots/matrix/chat/users?bot=${this._bot}`);
            this.renderConversations();
        } catch (e) { /* 静默重试 */ }
    },

    avatarHtml(u, cls) {
        const name = (u.nickname || u.username || u.uid || '?').slice(0, 1).toUpperCase();
        return u.avatar
            ? `<img class="staff-avatar ${cls}" src="${escapeHtml(u.avatar)}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><span class="staff-avatar ${cls}" style="display:none">${escapeHtml(name)}</span>`
            : `<span class="staff-avatar ${cls}">${escapeHtml(name)}</span>`;
    },

    renderConversations() {
        const box = document.getElementById('bot-im-list');
        if (!box) return;
        if (!this._conv.length) { box.innerHTML = '<div class="empty-tip">暂无会话（机器人上报消息后自动出现）</div>'; return; }
        box.innerHTML = this._conv.map(u => `
          <div class="bot-im-item ${String(u.uid) === String(this._chatUid) ? 'active' : ''}" onclick="BotMX.pickUid('${escapeHtml(u.uid)}')">
            <div class="bot-avatar-wrap">${this.avatarHtml(u, 'bot-avatar-sm')}</div>
            <div class="bot-im-item-main">
              <div class="bot-im-item-top">
                <span class="bot-im-item-name">${escapeHtml(u.nickname || u.uid)}</span>
                <span class="bot-im-item-time">${u.last_ts ? fmtTime(u.last_ts) : ''}</span>
              </div>
              <div class="bot-im-item-last">${escapeHtml(u.last_text || '(无消息)')}</div>
            </div>
            ${Number(u.unread) > 0 ? `<span class="bot-im-unread">${u.unread}</span>` : ''}
          </div>`).join('');
    },

    // 选择客户 → 清理上一轮轮询，开启 2 秒轮询
    pickUid(uid) {
        this.stopChatPoll();
        this._chatUid = uid;
        const u = this._conv.find(x => String(x.uid) === String(uid)) || {};
        document.getElementById('im-avatar').innerHTML = this.avatarHtml(u, 'bot-avatar-sm');
        document.getElementById('im-name').textContent = u.nickname || uid;
        document.getElementById('im-uid').textContent = (u.username ? '@' + u.username + ' · ' : '') + 'ID ' + uid;
        document.getElementById('im-live').style.display = '';
        document.getElementById('bot-im-stream').innerHTML = '<div class="empty-tip">加载中...</div>';
        this.renderConversations();
        this.pollHistory();
        this._chatTimer = setInterval(() => this.pollHistory(), 2000);
    },

    // 2 秒轮询：只拉当前用户的记录
    async pollHistory() {
        if (!this._chatUid) return;
        const uid = this._chatUid;
        try {
            const msgs = await this._get(`/admin/bots/matrix/chat/history?bot=${this._bot}&user_id=${encodeURIComponent(uid)}`);
            document.getElementById('bot-chat-status').textContent = `2 秒轮询中 · ${msgs.length} 条记录`;
            this.renderBubbles(msgs);
            this.refreshConversations();
        } catch (e) { /* 静默重试 */ }
    },

    renderBubbles(msgs) {
        const win = document.getElementById('bot-im-stream');
        const self = this;
        const atBottom = win.scrollHeight - win.scrollTop - win.clientHeight < 80;
        if (!msgs.length) { win.innerHTML = '<div class="empty-tip">暂无消息，发一条试试</div>'; return; }
        const u = this._conv.find(x => String(x.uid) === String(this._chatUid)) || {};
        const myAvatar = this.avatarHtml({ nickname: '客服', avatar: '' }, 'bot-avatar-xs');
        const peerAvatar = this.avatarHtml({ nickname: u.nickname || u.uid, avatar: u.avatar }, 'bot-avatar-xs');
        win.innerHTML = msgs.map(mm => {
            const mine = mm.role === 'bot';
            const pending = self._pending.has(mm.text);
            return `
            <div class="bot-im-row ${mine ? 'mine' : 'theirs'}">
              <div class="bot-avatar-wrap bot-im-row-avatar">${mine ? myAvatar : peerAvatar}</div>
              <div class="bot-im-col">
                <div class="bot-msg-bubble ${pending ? 'pending' : ''}">${escapeHtml(mm.text || '')}</div>
                <div class="bot-msg-meta">${escapeHtml(mm.time || '')}${mm.from_admin ? ' · 人工客服' : ''}${pending ? ' · 发送中' : ''}</div>
              </div>
            </div>`;
        }).join('');
        if (atBottom) win.scrollTop = win.scrollHeight;
    },

    // 发送：先插"发送中"气泡 → 调用后端 → 成功即刷新
    async sendChat() {
        const uid = this._chatUid || (document.getElementById('bot-chat-uid')?.value || '').trim();
        const input = document.getElementById('bot-chat-text');
        const text = (input.value || '').trim();
        if (!uid) { showToast('请先在左侧选择一个客户', 'error'); return; }
        if (!text) { showToast('消息不能为空', 'error'); return; }
        const btn = document.getElementById('bot-im-send');
        btn.disabled = true; btn.textContent = '发送中';
        this._pending.add(text);
        input.value = '';
        // 立即插入发送中气泡
        const win = document.getElementById('bot-im-stream');
        const tmp = document.createElement('div');
        tmp.className = 'bot-im-row mine';
        tmp.innerHTML = `<div class="bot-avatar-wrap bot-im-row-avatar"><span class="staff-avatar bot-avatar-xs">客</span></div>
          <div class="bot-im-col"><div class="bot-msg-bubble pending">${escapeHtml(text)}</div><div class="bot-msg-meta">发送中</div></div>`;
        win.appendChild(tmp); win.scrollTop = win.scrollHeight;
        try {
            const r = await this._post('/admin/bots/matrix/action', { bot: this._bot, action: 'send_msg', uid, text });
            if (r.code === 1) showToast('已发送', 'success');
            else showToast(r.msg || '发送失败', 'error');
        } catch (e) { showToast(e.message, 'error'); }
        finally {
            this._pending.delete(text);
            btn.disabled = false; btn.textContent = '发送';
            this.pollHistory();
        }
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
