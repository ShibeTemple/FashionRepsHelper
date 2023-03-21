const verbose = true;
const conversionRate = 0.145; // Update this value according to the current exchange rate
chrome.storage.local.set({ conversionRate }); // update in settings for popup

// define global variable for user settings
let enableConversion; // internal, to be updated by user
console.log("enableConversion: ", enableConversion);


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.hasOwnProperty('FRHenableConversion')) {
		console.log("Message recieved from popup, for FRHenableConversion: ", message.FRHenableConversion)
		enableConversion = message.FRHenableConversion;
		processPage();
	}
});


// get current setting:
chrome.storage.local.get(["FRHenableConversion"], function(result) {
	console.log("inital value retrieved from local storage: ", result.FRHenableConversion);
	// undefined = true, true = true, false = false.
	enableConversion = result.FRHenableConversion ?? true;
	console.log("enableConversion: ", enableConversion);
	// update page correspondingly
	processPage();
});

let modifiedNodes = new Map();

function processPage() {
	//console.log("LOGGING");
	if (enableConversion) {
		replaceTextNodes(document.body);
	} else {
		revertChanges();
	}
}

function replaceTextNodes(node) {
	console.log("updating nodes");
	if (node.nodeType === Node.TEXT_NODE) {
		// Built using RegExr.com.... thank you so much for this tool. 10/10
		// Y|P(digits)Y|P excluding already converted
		// this still fails on some, like ¥45+39 = only ¥49 detected.
		const regex = /(((?:￥|¥|P|CNY|Y|yuan)\.?\~?)(\d+(\.?\d+)?(?!(\ \()|\d|\.)))|((\d+(\.?\d+)?)((?:￥|¥|P|CNY|Y|yuan)(?!\ \(|\d|\.)))/gi;

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
	// check if there are any modified entries
	if (modifiedNodes.size > 0) {
		for (const [node, originalContent] of modifiedNodes.entries()) {
			let currentNode = node;
			let currentContent = node.textContent;
			while (modifiedNodes.has(currentNode)) {
				currentNode.textContent = modifiedNodes.get(currentNode);
				modifiedNodes.delete(currentNode);
				currentNode = currentNode.parentNode;
			}
			// sets the node's text content to its original content.
			currentNode.textContent = originalContent;
		}
	}
}




// global document attribute
document.documentElement.setAttribute("fashionrepshelper", true);


// PAGE UPDATE CHECKER:

// Create a MutationObserver object
const observer = new MutationObserver(mutationsList => {
	// Check if new content has been added to the page (Reddit for instance)
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

		//console.log("New content added")
		// only run if not the first time...
		if (enableConversion != undefined) {
			processPage();
		}

	}
})

// Define the options for the MutationObserver
const options = {
	childList: true,
	subtree: true
}

// Start observing the Reddit page for new content
observer.observe(document.body, options)