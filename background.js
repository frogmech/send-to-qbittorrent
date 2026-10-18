async function getCredentials() {
    const credentials = await browser.storage.local.get(['apiScheme', 'apiHost', 'apiPort', 'apiUsername', 'apiPassword']);
    return {
      username: credentials.apiUsername,
      password: credentials.apiPassword,
      url: `${credentials.apiScheme}://${credentials.apiHost}:${credentials.apiPort}`,
      credentials: credentials
    };
}

async function login() {
    const { username, password, url } = await getCredentials();
    const response = await fetch(`${url}/api/v2/auth/login`, {
      method: "POST",
      body: new URLSearchParams({username, password})
    });
    return response.text();
}

async function addTorrent(urls, credentials, category) {
    const { url } = credentials;
    const response = await fetch(`${url}/api/v2/torrents/add`, {
        method: "POST",
        body: new URLSearchParams(category ? {urls, category, autoTMM: "true"} : {urls}),
    });
    if (response.status === 200) {
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        if (tabs.length === 0) return;
        browser.tabs.sendMessage(tabs[0].id, {
          action: "torrentAdded"
        });
      });
    }
}

async function openQbit() {
  const { url } = await getCredentials();
  const newTab = await browser.tabs.create({ url: url });
  return newTab.id;
}

async function regularLogin(tabId) {
  const { username, password } = await getCredentials();
  await browser.tabs.executeScript(tabId, {
    code: `
      if (document.getElementById('loginform')) {
        document.getElementById('username').value = '${username}';
        document.getElementById('password').value = '${password}';
        document.getElementById('loginButton').click();
      }
    `
    });
}

let menuCategories = null;

async function createContextMenu(categories = []) {
  await browser.contextMenus.removeAll()
  menuCategories = categories.join('\n');
  browser.contextMenus.create({
    id: "sendToQbit",
    title: "Send to qBittorrent",
    contexts: ["link"],
  });
  if (!categories.length) return;
  browser.contextMenus.create({ id: "sendToQbitNone", parentId: "sendToQbit", title: "(no category)", contexts: ["link"] });
  for (const name of categories) {
    browser.contextMenus.create({ id: `cat:${name}`, parentId: "sendToQbit", title: name.replace(/&/g, "&&"), contexts: ["link"] });
  }
}

async function fetchCategories() {
  try {
    const { url } = await getCredentials();
    await login();
    const response = await fetch(`${url}/api/v2/torrents/categories`);
    return Object.keys(await response.json()).sort((a, b) => a.localeCompare(b));
  } catch (e) {
    return [];
  }
}

// Categories live in qBittorrent, so refresh the submenu each time the menu opens.
browser.contextMenus.onShown.addListener(async (info, tab) => {
  if (!info.contexts.includes("link")) return;
  const categories = await fetchCategories();
  if (categories.join('\n') !== menuCategories) await createContextMenu(categories);
  browser.contextMenus.refresh();
});

browser.runtime.onStartup.addListener(() => {
  createContextMenu();
});

browser.runtime.onInstalled.addListener(() => {
  createContextMenu();
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  const id = String(info.menuItemId);
  if (id === "sendToQbit" || id === "sendToQbitNone" || id.startsWith("cat:")) {
    const credentials = await getCredentials();
    await login();
    addTorrent(info.linkUrl, credentials, id.startsWith("cat:") ? id.slice(4) : undefined)
  }
});

browser.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === "local" && changes.magnetLink) {
    const credentials = await getCredentials();
    await login();
    addTorrent(changes.magnetLink.newValue, credentials)
  }
});

let loginTabs = new Set();
browser.runtime.onMessage.addListener(async (message) => {
  if (message.action === 'disableCSRF') {
    const tabId = await openQbit();
    await regularLogin();
    loginTabs.add(tabId);
  }
  if (message.action === "openQbit") {
    const response = await login();
    const tabId = await openQbit();
    if (response !== 'Ok.') {
      await regularLogin(tabId)
    }
  }
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && loginTabs.has(tabId)) {
    setTimeout(() => {
      browser.tabs.executeScript(tabId, {
        code: `
          if (document.getElementById('preferencesButton')) {
            document.getElementById('preferencesButton').click();
            setTimeout(() => {document.getElementById('PrefWebUILink').click();}, 500);
            setTimeout(() => {if (document.getElementById('csrf_protection_checkbox').checked) {document.getElementById('csrf_protection_checkbox').click();}}, 500);
            setTimeout(() => {document.querySelector('input[type="button"][value="Save"]').click();}, 500);
          }
        `
      });
    }, 500);
    loginTabs.delete(tabId);
  }
});
