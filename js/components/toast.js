export function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  const bg = type === "success" ? "rgba(52,211,153,0.9)" : type === "error" ? "rgba(248,113,113,0.9)" : "rgba(59,130,246,0.9)";
  toast.style.cssText = `padding:10px 20px;border-radius:8px;color:#fff;font-size:14px;font-weight:500;background:${bg};box-shadow:0 10px 30px rgba(0,0,0,0.5);opacity:0;transform:translateY(-10px);transition:all 0.3s;backdrop-filter:blur(10px);`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = "1"; toast.style.transform = "translateY(0)"; });
  setTimeout(() => { toast.style.opacity = "0"; toast.style.transform = "translateY(-10px)"; setTimeout(() => toast.remove(), 300); }, 3000);
}
