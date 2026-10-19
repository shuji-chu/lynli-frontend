export function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed; top:20px; left:50%; transform:translateX(-50%); background:${type === 'success' ? '#10b981' : '#f87171'}; color:#fff; padding:10px 20px; border-radius:8px; z-index:9999; box-shadow:0 4px 12px rgba(0,0,0,0.15); font-size:14px; transition:opacity 0.3s;`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2000);
}
export function showModal({ title, contentHTML, onConfirm }) {
  const mask = document.createElement('div');
  mask.className = 'modal-mask';
  mask.innerHTML = `
    <div class="modal-box">
      <div class="modal-title">${title}</div>
      <div class="modal-body">${contentHTML}</div>
      <div class="modal-actions">
        <button class="btn btn-cancel" style="background:var(--sur); border:1px solid var(--line); width:auto; margin:0; padding:8px 16px;">取消</button>
        <button class="btn btn-confirm" style="width:auto; margin:0; padding:8px 16px;">确认提交</button>
      </div>
    </div>
  `;
  document.body.appendChild(mask);
  requestAnimationFrame(() => mask.classList.add('show'));
  const close = () => { mask.classList.remove('show'); setTimeout(() => mask.remove(), 300); };
  mask.querySelector('.btn-cancel').onclick = close;
  mask.querySelector('.btn-confirm').onclick = async () => {
    const btn = mask.querySelector('.btn-confirm');
    btn.textContent = '处理中...'; btn.disabled = true;
    await onConfirm(mask, close);
    btn.textContent = '确认提交'; btn.disabled = false;
  };
}
