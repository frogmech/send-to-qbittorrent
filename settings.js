document.getElementById('backButton').addEventListener('click', () => {
  window.location.href = 'config.html';
});
document.getElementById('disableCSRF').addEventListener('click', async () => {browser.runtime.sendMessage({ action: "disableCSRF" });});


async function getDarkMode() {
  const result = await browser.storage.local.get('darkMode');
  const darkMode = result.darkMode || false;
  return darkMode;
}

async function getLeftClickSend() {
  const result = await browser.storage.local.get('leftClickSend');
  const leftClickSend = result.leftClickSend || false;
  return leftClickSend;
}

function enableDarkMode() { 
  document.body.classList.add("dark-mode-body");
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

const leftClickSendSlider = document.getElementById('leftClickSlider');
const darkModeSlider = document.getElementById('darkModeSlider');

darkModeSlider.addEventListener('click', async (event) => {
  let darkMode = await getDarkMode();
  darkMode = !darkMode;
  browser.storage.local.set({ darkMode: darkMode });
  if (darkMode) {
    enableDarkMode();
  } else {
    disableDarkMode();
  }
});

leftClickSendSlider.addEventListener('click', async (event) => {
  let leftClickSend = await getLeftClickSend();
  leftClickSend = !leftClickSend;
  browser.storage.local.set({ leftClickSend: leftClickSend });
});

browser.storage.local.get(['darkMode', 'leftClickSend']).then(data => {
  if (data.darkMode) {
    darkModeSlider.checked = data.darkMode;
  }
  if (data.leftClickSend) {
    leftClickSendSlider.checked = data.leftClickSend;
  }
});

document.body.classList.add("no-animation");
window.addEventListener('DOMContentLoaded', async () => {
  const darkMode = await getDarkMode();
  const leftClickSend = await getLeftClickSend();

  darkModeSlider.checked = darkMode;
  leftClickSendSlider.checked = leftClickSend;

  setTimeout(() => {
    document.body.classList.remove("no-animation");
  }, 50);
});