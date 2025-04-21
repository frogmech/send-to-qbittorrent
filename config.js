const form = document.getElementById('config-form');
const apiSchemeInput = document.getElementById('apiScheme');
const apiHostInput = document.getElementById('apiHost');
const apiPortInput = document.getElementById('apiPort');
const apiUsernameInput = document.getElementById('apiUsername');
const apiPasswordInput = document.getElementById('apiPassword');

// Load saved credentials if they exist
browser.storage.local.get(['apiScheme', 'apiHost', 'apiPort', 'apiUsername', 'apiPassword']).then(data => {
  if (data.apiScheme) {
    apiSchemeInput.value = data.apiScheme;
  }
  if (data.apiHost) {
    apiHostInput.value = data.apiHost;
  }
  if (data.apiPort) {
    apiPortInput.value = data.apiPort;
  }
  if (data.apiUsername) {
    apiUsernameInput.value = data.apiUsername;
  }
  if (data.apiPassword) {
    apiPasswordInput.value = data.apiPassword;
  }
});

// Handle form submission
const saveButton = document.getElementById('submit');
saveButton.addEventListener('click', (event) => {
  event.preventDefault();

  const apiScheme = apiSchemeInput.value;
  const apiHost = apiHostInput.value;
  const apiPort = apiPortInput.value;
  const apiUsername = apiUsernameInput.value;
  const apiPassword = apiPasswordInput.value;

  // Save credentials to storage
  browser.storage.local.set({
    apiScheme: apiScheme,
    apiHost: apiHost,
    apiPort: apiPort,
    apiUsername: apiUsername,
    apiPassword: apiPassword,
  }).then(() => {
      const checkmark = document.getElementById('success-checkmark');
      checkmark.style.display = 'inline';
      setTimeout(() => {
        checkmark.style.display = 'none';
    }, 2000);
  }).catch(err => {
      console.error('Error saving credentials:', err);
      const failurex = document.getElementById('failure-x');
      failurex.style.display = 'inline';
      setTimeout(() => {
        failurex.style.display = 'none';
    }, 2000);
  });
});

// Dark mode
async function getDarkMode() {
  const result = await browser.storage.local.get('darkMode');
  const darkMode = result.darkMode || false;
  return darkMode;
}

function enableDarkMode() { 
  document.body.classList.add("dark-mode-body");
  document.getElementById('github').classList.remove("github-light");
  document.getElementById('github').classList.add("github-dark");
  document.getElementById('settings').classList.remove("settings-button-light");
  document.getElementById('settings').classList.add("settings-button-dark");
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => input.classList.add("dark-mode-others"));
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => button.classList.add("dark-mode-others"));
  const selects = document.querySelectorAll('select');
  selects.forEach(select => select.classList.add("dark-mode-others"));
  const labels = document.querySelectorAll('label');
  labels.forEach(label => label.classList.add("dark-mode-body"));
}

function disableDarkMode() {
  document.body.classList.remove("dark-mode-body");
  document.getElementById('github').classList.remove("github-dark");
  document.getElementById('github').classList.add("github-light");
  document.getElementById('settings').classList.remove("settings-button-dark");
  document.getElementById('settings').classList.add("settings-button-light");
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => input.classList.remove("dark-mode-others"));
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => button.classList.remove("dark-mode-others"));
  const selects = document.querySelectorAll('select');
  selects.forEach(select => select.classList.remove("dark-mode-others"));
  const labels = document.querySelectorAll('label');
  labels.forEach(label => label.classList.remove("dark-mode-body"));
}

async function initializeDarkMode() {
  const darkMode = await getDarkMode();
  if (darkMode) {
    enableDarkMode();
  } else {
    disableDarkMode();
  }
}

initializeDarkMode()

//Handle clicks on settings and open WebUI buttons
document.getElementById('openQbit').addEventListener('click', async () => {browser.runtime.sendMessage({ action: "openQbit" });});
document.getElementById('settings').addEventListener('click', () => {
  window.location.href = 'settings.html';
});