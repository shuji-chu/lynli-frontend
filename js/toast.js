(function () {
  let stack = null;
  function ensureStack() {
    if (stack) return stack;
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
    return stack;
  }
  function toast(message, type = 'info', duration = 2600) {
    const el = document.createElement('div');
    el.className = 'toast' + (type !== 'info' ? ' is-' + type : '');
    el.textContent = String(message);
    ensureStack().appendChild(el);
    const timer = setTimeout(remove, duration);
    function remove() {
      clearTimeout(timer);
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), 160);
    }
    el.addEventListener('click', remove);
  }
  window.toast = toast;
  window.toast.success = (m, d) => toast(m, 'success', d);
  window.toast.error   = (m, d) => toast(m, 'error', d);
  window.toast.warning = (m, d) => toast(m, 'warning', d);
})();
