function updateConversionRate() {
  chrome.storage.local.get('conversionRate', (data) => {
    const conversionRate = data.conversionRate;
    document.getElementById('conversionRate').textContent = `${conversionRate} CNY to 1 USD`;
  });
}

document.getElementById('toggle').addEventListener('change', (e) => {
  const enableConversion = e.target.checked;
  chrome.storage.local.set({ enableConversion }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { enableConversion });
    });
  });
});

chrome.storage.local.get('enableConversion', (data) => {
  const enableConversion = data.enableConversion ?? true;
  document.getElementById('toggle').checked = enableConversion;
});

updateConversionRate();
