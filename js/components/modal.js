export function showModal({ title, content, onConfirm }) {
  const ov = document.createElement("div"); ov.className = "modal-overlay";
  ov.innerHTML = `<div class="modal-box"><div class="modal-header"><h3>${title}</h3><button class="modal-close">&times;</button></div><div class="modal-body">${content}</div><div class="modal-footer"><button class="btn btn--outline btn--sm" id="m-cancel">取消</button><button class="btn btn--primary btn--sm" id="m-confirm">确定</button></div></div>`;
  document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add("is-active"));
  const close = () => { ov.classList.remove("is-active"); setTimeout(() => ov.remove(), 300); };
  ov.querySelector(".modal-close").onclick = close; ov.querySelector("#m-cancel").onclick = close;
  ov.querySelector("#m-confirm").onclick = () => { if (onConfirm && onConfirm() === false) return; close(); };
}
