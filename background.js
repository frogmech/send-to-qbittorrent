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

async function addTorrent(urls, credentials) {
    const { url } = credentials;
    const response = await fetch(`${url}/api/v2/torrents/add`, {
        method: "POST",
        body: new URLSearchParams({urls}),
    });
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

async function createContextMenu() {
  await browser.contextMenus.removeAll()
  browser.contextMenus.create(
  {
    id: "sendToQbit",
    title: "Send to qBittorrent",
    contexts: ["link"],
  });
}

browser.runtime.onStartup.addListener(() => {
  createContextMenu();
});

browser.runtime.onInstalled.addListener(() => {
  createContextMenu();
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "sendToQbit") {
    const credentials = await getCredentials();
    await login();
    addTorrent(info.linkUrl, credentials)
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
