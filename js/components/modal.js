export function showModal({ title, content, onConfirm, confirmText = "确定", cancelText = "取消" }) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">${content}</div>
      <div class="modal-footer">
        <button class="btn btn--outline btn--sm" id="modal-cancel">${cancelText}</button>
        <button class="btn btn--primary btn--sm" id="modal-confirm">${confirmText}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  // 强制重排触发动画
  requestAnimationFrame(() => overlay.classList.add("is-active"));

  const close = () => {
    overlay.classList.remove("is-active");
    setTimeout(() => overlay.remove(), 300);
  };

  overlay.querySelector(".modal-close").onclick = close;
  overlay.querySelector("#modal-cancel").onclick = close;
  overlay.querySelector("#modal-confirm").onclick = () => {
    if (onConfirm && onConfirm() === false) return; // 如果返回 false 则不关闭
    close();
  };
}
