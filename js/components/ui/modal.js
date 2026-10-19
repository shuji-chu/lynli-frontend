export function modal({ title, content, onConfirm }) {
  const ov = document.createElement("div"); ov.className = "modal-overlay";
  ov.innerHTML = `<div class="modal-box"><div class="modal-header"><h3>${title}</h3><button class="close">&times;</button></div><div class="modal-body">${content}</div><div class="modal-footer"><button class="btn btn-outline" id="c-btn">取消</button><button class="btn btn-primary" id="ok-btn">确定</button></div></div>`;
  document.body.appendChild(ov); setTimeout(() => ov.classList.add("active"), 10);
  const close = () => { ov.classList.remove("active"); setTimeout(() => ov.remove(), 300); };
  ov.querySelector(".close").onclick = close; ov.querySelector("#c-btn").onclick = close;
  ov.querySelector("#ok-btn").onclick = () => { if(onConfirm && onConfirm() === false) return; close(); };
}
