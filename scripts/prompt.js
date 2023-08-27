const promptForm = document.getElementById("form-prompt");
const promptDialog = document.getElementById("dialog-prompt");

/**
 * Handles the click event on the remove button of the context menus.
 * Shows the prompt dialog and initializes the event listeners for the prompt form.
 *
 * @param {MouseEvent} event
 */
function initializePrompt(event) {
	const removeButton = event.target.closest(".remove");
	if (!removeButton) return;

	const target =
		event.target.closest(".category-link") || event.target.closest(".category");
	promptDialog.showModal();

	const message = document.getElementById("prompt-message");

	if (target.classList.contains("category-link")) {
		message.innerHTML = `Are you sure you want delete the link?
        <br />
        This action cannot be undone.`;
	} else if (target.classList.contains("category")) {
		message.innerHTML = `Are you sure you want to delete the entire category?
        <br/>
        This action cannot be undone.`;
	}

	/**
	 * Handles the prompt form submit event.
	 * Confirms the removal of link or category elements and removes it from the DOM.
	 * After removal, the dialog is closed and the initialized event listeners are removed.
	 *
	 * @param {SubmitEvent} event
	 */
	function confirmElementRemoval(event) {
		event.preventDefault();

		target.remove();
		promptDialog.close();
		removeFormPromptListeners();

		const state = { container: container.innerHTML };
		browser.storage.local.set(state);
	}

	function removeFormPromptListeners() {
		promptDialog.close();

		promptForm.removeEventListener("keyup", escapePrompt);
		promptForm.removeEventListener("click", cancelPrompt);
		promptForm.removeEventListener("submit", confirmElementRemoval);
	}

	function cancelPrompt(event) {
		if (event.target !== promptForm.no) return;
		removeFormPromptListeners();
	}

	function escapePrompt(event) {
		if (event.code !== "Escape") return;
		removeFormPromptListeners();
	}

	promptForm.addEventListener("keyup", escapePrompt);
	promptForm.addEventListener("click", cancelPrompt);
	promptForm.addEventListener("submit", confirmElementRemoval);
}

container.addEventListener("click", initializePrompt);
