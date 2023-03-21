/*

chrome.storage.local.get(["FRHenableConversion"]).then((result) => {
	console.log("Value currently is " + result.key);
	let ec = result.key ?? true;
	console.log("Value after determination " + ec);
	document.getElementById('toggle').checked = ec;
});




// listen for toggle change
document.getElementById('toggle').addEventListener('change', (e) => {
	const enableConversion = e.target.checked;
	console.log("e.target.checked: ", e.target.checked);
	console.log("enableConversion: ", enableConversion);
	chrome.storage.local.set({ FRHenableConversion: enableConversion }).then(() => {
		console.log("Value set");
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			chrome.tabs.sendMessage(tabs[0].id, { enableConversion });
		});
		//getConversionStatus();
		chrome.storage.local.get(["FRHenableConversion"]).then((result) => {
			console.log("Value currently is " + result.key);
			let ec = result.key ?? true;
			console.log("Value after determination " + ec);
		});
	});
});


*/

// define global variable for user settings
let enableConversion;
console.log("enableConversion: ", enableConversion);

// get current setting:
chrome.storage.local.get(["FRHenableConversion"], function(result) {
	console.log("inital value retrieved from local storage: ", result.FRHenableConversion);
	// undefined = true, true = true, false = false.
	enableConversion = result.FRHenableConversion ?? true;
	console.log("enableConversion: ", enableConversion);
	// make sure UI togglebox reflects saved state
	document.getElementById('toggle').checked = enableConversion;
});

/*
chrome.storage.local.set({ FRHenableConversion: false }, function() {
	console.log("Value set in local storage");
});

chrome.storage.local.get(["FRHenableConversion"], function(result) {
	console.log("Value retrieved from local storage: ", result.FRHenableConversion);
	enableConversion = result.FRHenableConversion ?? true;
	console.log("enableConversion: ", enableConversion);
});


chrome.storage.local.set({ FRHenableConversion: true }, function() {
	console.log("Value updated in local storage");
});

chrome.storage.local.get(["FRHenableConversion"], function(result) {
	console.log("Value retrieved from local storage: ", result.FRHenableConversion);
	enableConversion = result.FRHenableConversion ?? true;
	console.log("enableConversion: ", enableConversion);
});
*/


// listen for toggle change
document.getElementById('toggle').addEventListener('change', (e) => {
	enableConversion = e.target.checked;
	console.log("e.target.checked: ", e.target.checked);
	console.log("enableConversion: ", enableConversion);

	chrome.storage.local.set({ FRHenableConversion: enableConversion }, function() {
		console.log("Value set in local storage");
	});

	// Send a message with multiple key-value pairs to the content script
	chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		// i.e. { var1: "value1", var2: "value2", var3: "value3" }
		chrome.tabs.sendMessage(tabs[0].id, { FRHenableConversion: enableConversion });
	});

});



// conversion rate
function updateConversionRate() {
	chrome.storage.local.get('conversionRate', (data) => {
		const conversionRate = data.conversionRate;
		document.getElementById('conversionRate').textContent = `${conversionRate} CNY to 1 USD`;
	});
}
updateConversionRate();