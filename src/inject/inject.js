let enableConversion = true;
const verbose = true;
const conversionRate = 0.145; // Update this value according to the current exchange rate
chrome.storage.local.set({ conversionRate });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.hasOwnProperty('enableConversion')) {
    enableConversion = message.enableConversion;
    processPage();
  }
});

chrome.storage.local.get('enableConversion', (data) => {
  enableConversion = data.enableConversion ?? true;
  processPage();
});

const modifiedNodes = new Map();

function processPage() {
  if (enableConversion) {
    replaceTextNodes(document.body);
  } else {
    revertChanges();
  }
}

function replaceTextNodes(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const regex = /((?:￥|¥|P)\.?~?\d+(?:\.\d{1,2})?)/gi;
    const originalContent = node.textContent;

    const replacement = (matched) => {
      let amount;
      if (matched.includes('￥.') || matched.includes('¥.')) {
        amount = parseFloat(matched.replace(/[^0-9]+/g, ''));
      } else {
        amount = parseFloat(matched.replace(/[^0-9.]+/g, ''));
      }
      const usdAmount = amount * conversionRate;
	  
	  if (verbose) {
		  console.log(`Input: ${matched}, Amount: ${amount} CNY, Output: ${usdAmount.toFixed(2)} USD`);
	  }

      return `${matched} ($${usdAmount.toFixed(2)})`;
    };

    node.textContent = node.textContent.replace(regex, replacement);

    if (node.textContent !== originalContent) {
      modifiedNodes.set(node, originalContent);
    }
  } else {
    for (let i = 0; i < node.childNodes.length; i++) {
      replaceTextNodes(node.childNodes[i]);
    }
  }
}

function revertChanges() {
  for (const [node, originalContent] of modifiedNodes.entries()) {
    node.textContent = originalContent;
  }
  modifiedNodes.clear();
}





document.documentElement.setAttribute("fashionrepshelper", "true");


console.log("Hello.");