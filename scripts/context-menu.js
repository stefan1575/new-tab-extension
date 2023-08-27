/**
 * Handles the click event for the link and title meatball menu elements.
 * Toggles the context menu on the target meatball menu element.
 * If a context menu is already open, it will be removed.
 *
 * @param {MouseEvent} event
 */
function toggleContextMenu(event) {
	const meatballMenu =
		event.target.closest(".meatball-menu-link") ||
		event.target.closest(".meatball-menu-title");

	const hasContextMenu = document.querySelector(".context-menu");
	const hasOpenedContextMenu = document.querySelector(".context-menu-open");

	if (!meatballMenu) {
		if (hasOpenedContextMenu) {
			removeContextMenu();
		}
		return;
	} else if (meatballMenu === hasOpenedContextMenu) {
		removeContextMenu();
		return;
	} else if (hasContextMenu) {
		removeContextMenu();
	}

	createContextMenu();

	/**
	 * Creates a context menu based on the clicked meatball menu and appends the context menu below it.
	 * Determines which context menu template to append depending on the class of the clicked meatball menu.
	 * Positions the context menu below the meatball menu and centers it horizontally.
	 */
	function createContextMenu() {
		let contextMenuContent;
		if (meatballMenu.classList.contains("meatball-menu-title")) {
			const titleTemplate = document.getElementById("title-context-menu");
			contextMenuContent = titleTemplate.content.cloneNode(true);
		} else if (meatballMenu.classList.contains("meatball-menu-link")) {
			const linkTemplate = document.getElementById("link-context-menu");
			contextMenuContent = linkTemplate.content.cloneNode(true);
		}

		meatballMenu.classList.add("context-menu-open");
		meatballMenu.before(contextMenuContent);

		let contextMenu = document.querySelector(".context-menu");
		contextMenu.style.top =
			meatballMenu.offsetTop + meatballMenu.offsetHeight + "px";
		contextMenu.style.left =
			meatballMenu.offsetLeft + meatballMenu.offsetWidth / 2 + "px";
	}

	function removeContextMenu() {
		hasOpenedContextMenu.classList.remove("context-menu-open");
		if (hasContextMenu) hasContextMenu.remove();
	}
}

document.body.addEventListener("click", toggleContextMenu);

function removeContextMenuDrag() {
	const contextMenu = container.querySelector(".context-menu");
	if (contextMenu) contextMenu.remove();
}

document.body.addEventListener("dragstart", removeContextMenuDrag);
