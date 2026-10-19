export function showToast(msg, type = "success") {
  let c = document.getElementById("toast-c");
  if (!c) { c = document.createElement("div"); c.id = "toast-c"; c.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:10px;"; document.body.appendChild(c); }
  const t = document.createElement("div"); const bg = type === "success" ? "#34d399" : type === "error" ? "#f87171" : "#3b82f6";
  t.style.cssText = `padding:10px 20px;border-radius:8px;color:#fff;font-size:14px;background:${bg};box-shadow:0 10px 30px rgba(0,0,0,0.5);opacity:0;transform:translateY(-10px);transition:all 0.3s;`;
  t.textContent = msg; c.appendChild(t); requestAnimationFrame(() => { t.style.opacity = "1"; t.style.transform = "translateY(0)"; });
  setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateY(-10px)"; setTimeout(() => t.remove(), 300); }, 3000);
}
