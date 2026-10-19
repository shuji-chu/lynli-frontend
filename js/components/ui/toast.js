export function toast(msg, type="success") {
  let c = document.getElementById("toasts") || document.body.appendChild(Object.assign(document.createElement("div"), {id:"toasts", style:"position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;"}));
  const t = document.createElement("div"); const bg = type === "success" ? "#34d399" : "#f87171";
  t.style.cssText = `background:${bg};color:#fff;padding:10px 20px;border-radius:8px;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,0.5);opacity:0;transition:all 0.3s;`;
  t.textContent = msg; c.appendChild(t); requestAnimationFrame(() => t.style.opacity = "1");
  setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 2500);
}
