/**
 * Stores the container content to the browser's local storage.
 */

function saveState() {
	let state = { container: container.innerHTML };
	browser.storage.local.set(state);
}

/**
 * Synchronizes the container content between each tabs.
 *
 * @param {Object} changes - Contains all of the keys stored in the local storage.
 * @param {string} areaName - The name of the storage area where the change is made.
 */
function syncState(changes, areaName) {
	if (
		areaName === "local" &&
		changes.container.newValue !== changes.container.oldValue
	) {
		container.innerHTML = changes.container.newValue;
	}
}

browser.storage.onChanged.addListener(syncState);

/**
 * Lets the container content persist on tab exit.
 */
function loadState() {
	browser.storage.local.get("container").then((value) => {
		if (value.container) container.innerHTML = value.container;
	});

	container.classList.remove("hidden");
}

window.addEventListener("load", loadState);
