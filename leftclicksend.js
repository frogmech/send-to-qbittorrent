(async ()=> {
  const { leftClickSend } = await browser.storage.local.get('leftClickSend');
  if (leftClickSend) {
    let lastClickX = 0;
    let lastClickY = 0;
    document.addEventListener("click", (e) => {
      lastClickX = e.clientX;
      lastClickY = e.clientY;
      const magnet = e.target.closest('a[href^="magnet:"]');
      if (magnet) {
        e.preventDefault();
        e.stopPropagation();
        browser.storage.local.set({ magnetLink: magnet.href });
      }
    });

    function showToast(message, x, y) {
      const existing = document.getElementById("qb-toast");
      if (existing) existing.remove();

      const toast = document.createElement("div");
      toast.id = "qb-toast";
      toast.textContent = message;

      Object.assign(toast.style, {
        position: "fixed",
        left: `${x + 15}px`,
        top: `${y + 15}px`,
        backgroundColor: "#222",
        color: "#fff",
        padding: "6px 10px",
        borderRadius: "5px",
        fontSize: "12px",
        zIndex: 9999,
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 0.3s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        userSelect: "none",
      });

      document.body.appendChild(toast);

      getComputedStyle(toast).opacity;
      toast.style.opacity = 1;

      setTimeout(() => {
        toast.style.opacity = 0;
        setTimeout(() => toast.remove(), 300);
      }, 1000);
    }
    browser.runtime.onMessage.addListener((message) => {
      if (message.action === "torrentAdded") {
        showToast("✓ Sent to qBittorrent", lastClickX, lastClickY);
      }
    });
  }
})();
