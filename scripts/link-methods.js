const container = document.getElementById("container");

const linkDialog = document.getElementById("dialog-link");
const linkForm = document.getElementById("form-link");

/**
 * Triggers on submit, cancel button click, and escape keydown events.
 * Clears the form label, url, and name fields and closes the dialog.
 */
function resetLinkForm() {
	const linkAction = document.querySelector("#link-action");

	linkAction.innerText = "";
	linkForm.name.value = "";
	linkForm.url.value = "";
	clearPreview();

	linkDialog.close();
}

function escapeLink(event) {
	if (event.code !== "Escape") return;
	resetLinkForm();
}

linkForm.addEventListener("keydown", escapeLink);

function cancelLink(event) {
	if (event.target !== linkForm.cancel) return;
	resetLinkForm();
}

linkForm.addEventListener("click", cancelLink);

function clearPreview() {
	const previewImg = document.querySelector(".preview");
	const previewName = document.querySelector(".upload-image-name");
	previewName.innerText = "";
	previewImg.removeAttribute("src");

	linkForm.upload.value = "";
}

/**
 * Checks if the selected file type is either PNG, JPG, or JPEG.
 * If the selected file type is one of the accepted formats, it is shown as a preview and the file name is displayed.
 * If not, it stops the file from being selected, clears the preview and shows a tooltip message.
 */
function validateFileInput() {
	const hasTooltip = document.querySelector(".tooltip");
	if (hasTooltip) removeTooltip();

	const file = linkForm.upload.files[0];
	const accepted = /(png|jpg|jpeg)$/;

	const previewImg = document.querySelector(".preview");
	const previewName = document.querySelector(".upload-image-name");
	if (!accepted.test(file.type)) {
		clearPreview();

		if (document.querySelector(".tooltip")) return;
		const imageInput = document.querySelector(".image-input");

		const top = imageInput.offsetHeight + "px";
		const left = "auto";
		const message = "Only JPG, JPEG, or PNG files are accepted";
		const tooltip = createTooltip(top, left, message);

		imageInput.append(tooltip);

		previewImg.removeAttribute("src");

		setTimeout(() => {
			tooltip.remove();
		}, 2000);
	} else {
		const reader = new FileReader();

		/**
		 * Sets the image preview to the chosen file.
		 */
		function setCustomFavicon() {
			previewImg.src = reader.result;
			reader.removeEventListener("load", setCustomFavicon);
		}

		reader.addEventListener("load", setCustomFavicon);
		reader.readAsDataURL(file);

		previewName.innerText = file.name;
	}
}

linkForm.upload.addEventListener("change", validateFileInput);

/**
 * Checks whether the submitted url input is a valid URL.
 * If valid, returns a URL object containing the parsed URL.
 * If invalid, displays a tooltip with a warning.
 */
function validateURL() {
	let url = linkForm.url.value;

	const protocol = /^https?:\/\//;
	if (!protocol.test(url)) url = "https://" + url;
	try {
		let urlObj = new URL(url);

		return urlObj;
	} catch {
		if (document.querySelector(".tooltip")) return;
		const target = linkForm.url;

		const message = "Please enter a valid URL";
		const top = target.offsetHeight + target.offsetTop + "px";
		const left = target.offsetLeft + "px";

		const tooltip = createTooltip(top, left, message);
		target.after(tooltip);
	}
}

/**
 * Assigns the link's href and innerText and favicon.
 * Sets the link's favicon to either the selected file or from its URL.
 * If a file has been selected, sets the image's src attribute to the selected file.
 * Otherwise, retrieves the favicon from the given URL and sets the image's src attribute.
 *
 * @param {HTMLDivElement} anchorText - The HTML area where the link name will be added.
 * @param {HTMLAnchorElement} anchorElem - The HTML anchor element where the href attribute will be assigned.
 * @param {HTMLImageElement} image - The HTML image to set the src attribute.
 * @param {Object} urlObj - the URL object with the parsed URL.
 */
function assignLinkValues(anchorText, anchorElem, image, urlObj) {
	const name = linkForm.name.value;
	anchorElem.href = urlObj.href;

	if (name === "") {
		anchorText.innerText = urlObj.hostname;
	} else {
		anchorText.innerText = name;
	}

	if (linkForm.upload.files.length !== 0) {
		const preview = document.querySelector(".preview");
		image.src = preview.src;
	} else {
		const faviconRetrievalAPI =
			"https://www.google.com/s2/favicons?sz=32&domain_url=";
		let faviconURL = faviconRetrievalAPI + urlObj.href;

		image.removeAttribute("src");
		image.setAttribute("src", faviconURL);
	}
}

/**
 * Creates a tooltip with a given message at the specified top and left positions.
 *
 * @param {string} top - The unit value that positions the tooltip's vertical position.
 * @param {string} left - The unit value that positions the tooltip's horizontal position.
 * @param {string} message - The message to display in the tooltip.
 * @returns {HTMLDivElement} tooltip - The tooltip element.
 */
function createTooltip(top, left, message) {
	const tooltipTemplate = document.getElementById("error-tooltip");
	const clone = tooltipTemplate.content.cloneNode(true);

	const tooltip = clone.querySelector(".tooltip");
	const tooltipText = clone.querySelector(".tooltip-text");

	tooltipText.innerText = message;
	tooltip.style.top = top;
	tooltip.style.left = left;

	return tooltip;
}

/**
 * Handles the input event on value change and close event on dialog exit.
 * Removes the existing tooltip.
 */
function removeTooltip() {
	const tooltip = document.querySelector(".tooltip");
	if (!tooltip) return;

	tooltip.remove();
}

linkForm.url.addEventListener("input", removeTooltip);
linkDialog.addEventListener("close", removeTooltip);

/**
 * Handles the click event on link creation buttons.
 * Shows the link dialog and initializes the event listeners for the link form.
 *
 * @param {MouseEvent} event
 */
function initLinkCreation(event) {
	const newLinkButton = event.target.closest(".category-create");
	if (!newLinkButton) return;
	linkDialog.showModal();
	const linkAction = document.querySelector("#link-action");
	linkAction.innerText = "Create new link";

	/**
	 * Handles the link form submit event.
	 * Creates a new link element and inserts it before the link creation button.
	 *
	 * @param {SubmitEvent} event
	 */
	function createLink(event) {
		event.preventDefault();

		const linkTemplate = document.getElementById("link-template");
		const clone = linkTemplate.content.cloneNode(true);

		const anchorText = clone.querySelector(".link-text");
		const anchorElem = clone.querySelector(".link");
		const image = clone.querySelector(".favicon");

		const result = validateURL();
		if (result) {
			assignLinkValues(anchorText, anchorElem, image, result);

			newLinkButton.before(clone);

			resetLinkForm();
			removeCreateLinkHandlers();
			saveState();
		}
	}

	function removeCreateLinkHandlers() {
		linkForm.removeEventListener("submit", createLink);
		linkDialog.removeEventListener("close", removeCreateLinkHandlers);
	}

	linkForm.addEventListener("submit", createLink);
	linkDialog.addEventListener("close", removeCreateLinkHandlers);
}

container.addEventListener("click", initLinkCreation);

/**
 * Handles the click event on the edit button of the context menu.
 * Shows the link dialog with pre-filled icon fields and an icon when the edit button is clicked.
 * Initializes the link creation event listeners.
 *
 * @param {MouseEvent} event
 */
function initLinkEdit(event) {
	const editLinkButton = event.target.closest(".edit-link");
	if (!editLinkButton) return;

	linkDialog.showModal();

	const linkAction = document.querySelector("#link-action");
	linkAction.innerText = "Edit link";

	const link = event.target.closest(".category-link");

	const previewImg = document.querySelector(".preview");
	previewImg.src = link.querySelector(".favicon").src;

	const anchorText = link.querySelector(".link-text");
	const anchorElem = link.querySelector(".link");
	const image = anchorElem.querySelector(".favicon");
	linkForm.url.value = anchorElem.href;
	linkForm.name.value = anchorText.innerText;

	/**
	 * Handles the link form submit event.
	 * Edits the existing link element with the new name and URL.
	 * Removes the initialized link creation event listeners.
	 *
	 * @param {SubmitEvent} event
	 */
	function editLink(event) {
		event.preventDefault();
		const result = validateURL();

		if (result) {
			assignLinkValues(anchorText, anchorElem, image, result);

			resetLinkForm();
			removeEditLinkHandlers();
			saveState();
		}
	}

	function removeEditLinkHandlers() {
		linkForm.removeEventListener("submit", editLink);
		linkDialog.removeEventListener("close", removeEditLinkHandlers);
	}

	linkForm.addEventListener("submit", editLink);
	linkDialog.addEventListener("close", removeEditLinkHandlers);
}

container.addEventListener("click", initLinkEdit);

/**
 * Opens the link in another tab or window depending on the clicked context menu element.
 *
 * @param {MouseEvent} event
 */
function openWindow(event) {
	const newTab = document.querySelector(".new-tab");
	const newWindow = document.querySelector(".new-window");

	if (!newWindow || !newTab) return;

	const url = event.target
		.closest(".category-link")
		.querySelector(".link").href;

	if (event.target === newTab) {
		window.open(url, "_blank");
	} else if (event.target === newWindow) {
		browser.windows.create({
			url: url,
		});
	}
}

container.addEventListener("click", openWindow);

/**
 * Handles the pointerdown event on the category link elements.
 * Initializes the event listener and the draggable attribute for the link and its children.
 * Prevents the context menu from starting a drag event.
 *
 * @param {PointerEvent} event
 */
function initLinkDrag(event) {
	const link = event.target.closest(".category-link");
	const contextMenu = event.target.closest(".context-menu");
	if (contextMenu !== null) return;
	if (event.button !== 0) return;
	if (!link) return;

	const linkChildren = link.querySelectorAll("*");
	link.setAttribute("draggable", "true");

	linkChildren.forEach((elem) => {
		elem.setAttribute("draggable", "false");
	});

	/**
	 * Removes the draggable attribute of the link and its children.
	 */
	function removeChildrenDraggable() {
		link.removeAttribute("draggable");
		linkChildren.forEach((elem) => {
			elem.removeAttribute("draggable");
		});

		link.removeEventListener("pointerup", removeChildrenDraggable);
		container.removeEventListener("dragstart", initDraggedElem);
	}

	link.addEventListener("pointerup", removeChildrenDraggable);

	/**
	 * Handles the dragstart event on the category link elements.
	 * Initializes the link drag event listeners and classes.
	 *
	 * @param {PointerEvent} event
	 */
	function initDraggedElem(event) {
		const link = event.target.closest(".category-link");
		if (!link) return;
		link.classList.add("dragging");
		const draggedElem = document.querySelector(".dragging");

		/**
		 * Handles the dragover event on the category-link elements.
		 * Allows the dragged element to be dropped and indicates the valid drop targets.
		 * If the drop target is a link, appends dragged element based on the cursor's position relative to the middle point of the drop target.
		 * If the drop target category contains no links, appends the dragged element before the link creation button.
		 *
		 * @param {DragEvent} event
		 */
		function checkDropTarget(event) {
			event.preventDefault();
			const dropTarget = event.target.closest(".category-link:not(.dragging)");
			const createButton = event.target.closest(".category-create");

			draggedElem.style.backgroundColor = "gray";

			if (dropTarget !== null) {
				const dropTargetBox = dropTarget.getBoundingClientRect();

				const middlePointY = (dropTargetBox.bottom + dropTargetBox.top) / 2;

				if (event.clientY <= middlePointY) {
					dropTarget.before(draggedElem);
				} else {
					dropTarget.after(draggedElem);
				}
			}

			if (createButton !== null) {
				if (createButton.previousElementSibling !== dropTarget) {
					createButton.before(draggedElem);
				}
			}
		}

		/**
		 * Handles the dragend event on the category link elements.
		 * Removes the initialized link drag event listeners and classes.
		 *
		 * @param {DragEvent} event
		 */
		function dragendHandler(event) {
			const link = event.target.closest(".category-link");
			const linkChildren = link.querySelectorAll("*");

			link.classList.remove("dragging");
			link.removeAttribute("draggable");

			linkChildren.forEach((elem) => {
				elem.removeAttribute("draggable");
			});

			draggedElem.removeAttribute("style");
			container.removeEventListener("dragend", dragendHandler);
			container.removeEventListener("dragover", checkDropTarget);
			container.removeEventListener("dragstart", initDraggedElem);
			link.removeEventListener("pointerup", removeChildrenDraggable);

			saveState();
		}

		container.addEventListener("dragover", checkDropTarget);
		container.addEventListener("dragend", dragendHandler);
	}

	container.addEventListener("dragstart", initDraggedElem);
}

container.addEventListener("pointerdown", initLinkDrag);
