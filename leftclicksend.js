(async ()=> {
  const { leftClickSend } = await browser.storage.local.get('leftClickSend');
  if (leftClickSend) {
    document.addEventListener("click", (e) => {
      const magnet = e.target.closest('a[href^="magnet:"]');
      if (magnet) {
        e.preventDefault();
        e.stopPropagation();
        browser.storage.local.set({ magnetLink: magnet.href });
      }
    });
  }
})();