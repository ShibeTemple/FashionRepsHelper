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
	console.log("LOGGING");
	if (enableConversion) {
		replaceTextNodes(document.body);
	} else {
		revertChanges();
	}
}

function replaceTextNodes(node) {
	if (node.nodeType === Node.TEXT_NODE) {
		// ChatGPT generated.... a starting point but not good enough.
		//const regex = /((?:￥|¥|P)\.?~?\d+(?:\.\d{1,2})?)(?<!\s\()/;
		//const regex = /((?:￥|¥|P)\.?~?\d+(?:\.\d{1,2})?)/gi;
		//const regex2 = /(\d+(?:\.\d+)?)\s*(Yuan)/i;
		// Built using RegExr.com.... thank you so much for this tool. 10/10
		console.log("from within...")
		const regex = /((?:￥|¥|P)\.?\~?(\d+(\.?\d+)?(?!\ \(|\d)))/gi;
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
		
		//console.log("hello", node.textContent);

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

let flag = 0;

// PAGE UPDATE CHECKER:

// Create a MutationObserver object
const observer = new MutationObserver(mutationsList => {
	// Check if new content has been added to the Reddit page
	const newElements = mutationsList.reduce((acc, mutation) => {
		mutation.addedNodes.forEach(node => {
			if (node.nodeType === Node.ELEMENT_NODE) {
				acc.push(node)
			}
		})
		return acc
	}, [])

	if (newElements.length > 0) {
		// Run your code here when new content is added to the Reddit page
		//if (!flag) {
			console.log("New content added")
			processPage()
			flag = 1
		//}
	
	}
})

// Define the options for the MutationObserver
const options = {
	childList: true,
	subtree: true
}

// Start observing the Reddit page for new content
observer.observe(document.body, options)