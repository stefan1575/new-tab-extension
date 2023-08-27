const categoryDialog = document.getElementById("dialog-category");
const categoryForm = document.getElementById("form-category");

/**
 * Triggers on submit, cancel button click, and escape keydown events.
 * Clears the form label, title form fields, and closes the dialog.
 */
function resetCategoryForm() {
	const categoryAction = document.querySelector("#category-action");

	categoryAction.innerText = "";
	categoryForm.title.value = "";

	categoryDialog.close();
}

function escapeCategory(event) {
	if (event.code !== "Escape") return;
	resetCategoryForm();
}

categoryForm.addEventListener("keydown", escapeCategory);

function cancelCategory(event) {
	if (event.target !== categoryForm.cancel) return;
	resetCategoryForm();
}

categoryForm.addEventListener("click", cancelCategory);

/**
 * Checks whether the submitted title input is not empty.
 * If not empty, assigns the title to the provided div element.
 * If empty, displays a tooltip with a warning.
 *
 * @param {HTMLDivElement} categoryTitle - the HTML area where the title will be added.
 * @returns {Boolean} true - indicates that the title input is valid.
 */

function processTitleInput(categoryTitle) {
	const title = categoryForm.title.value;
	if (title.trim() !== "") {
		categoryTitle.innerText = title;
		return true;
	} else {
		if (document.querySelector(".tooltip")) return;
		const target = categoryForm.title;

		const message = "Title cannot be empty";
		const top = target.offsetHeight + target.offsetTop + "px";
		const left = target.offsetLeft + "px";
		const tooltip = createTooltip(top, left, message);
		target.after(tooltip);
	}
}

categoryDialog.addEventListener("close", removeTooltip);
categoryForm.title.addEventListener("input", removeTooltip);

/**
 * Handles the click event on the category creation button.
 * Shows the category dialog and initializes the event listeners for the category form.
 *
 * @param {MouseEvent} event
 */
function initCategoryCreation(event) {
	const newCategoryButton = event.target.closest("#new-category");
	if (!newCategoryButton) return;

	categoryDialog.showModal();

	const categoryAction = document.querySelector("#category-action");
	categoryAction.innerText = "Create new category";

	/**
	 * Handles the submit event for the category form.
	 * Creates a new category element beside the category creation button.
	 *
	 * @param {SubmitEvent} event
	 */
	function createCategory(event) {
		event.preventDefault();

		const template = document.getElementById("title-template");
		const clone = template.content.cloneNode(true);
		const categoryTitle = clone.querySelector(".category-title");
		const target = document.getElementById("new-category-container");

		const title = categoryTitle.querySelector(".title");
		const result = processTitleInput(title);
		if (result) {
			target.before(clone);

			resetCategoryForm();
			removeCreateCategoryHandlers();
			saveState();
		}
	}

	function removeCreateCategoryHandlers() {
		categoryForm.removeEventListener("submit", createCategory);
		categoryDialog.removeEventListener("close", removeCreateCategoryHandlers);
	}

	categoryForm.addEventListener("submit", createCategory);
	categoryDialog.addEventListener("close", removeCreateCategoryHandlers);
}

container.addEventListener("click", initCategoryCreation);

/**
 * Handles the click event on the edit button of the context menu.
 * Shows the category dialog with pre-filled fields when the edit button is clicked.
 * Initializes the event listeners for the category form.
 *
 * @param {MouseEvent} event
 */
function initTitleEdit(event) {
	const editTitleButton = event.target.closest(".edit-title");
	if (!editTitleButton) return;

	categoryDialog.showModal();

	const categoryAction = document.querySelector("#category-action");
	categoryAction.innerText = "Edit category title";

	const categoryTitle = event.target.closest(".category-title");
	const title = categoryTitle.querySelector(".title");
	categoryForm.title.value = title.innerText;

	/**
	 * Handles the category form submit event.
	 * Edits the existing title with the new one.
	 * Removes the initialized category form event listeners.
	 *
	 * @param {SubmitEvent} event
	 */
	function editTitle(event) {
		event.preventDefault();

		const result = processTitleInput(title);
		if (result) {
			resetCategoryForm();
			removeEditTitleHandlers();
			saveState();
		}
	}

	function removeEditTitleHandlers() {
		categoryForm.removeEventListener("submit", editTitle);
		categoryDialog.removeEventListener("close", removeEditTitleHandlers);
	}

	categoryForm.addEventListener("submit", editTitle);
	categoryDialog.addEventListener("close", removeEditTitleHandlers);
}

container.addEventListener("click", initTitleEdit);

/**
 * Handles the pointerdown event on the category element.
 * Initializes the event listener and the draggable attribute for the category and its children.
 * Prevents the context menu from starting a drag event.
 *
 * @param {PointerEvent} event
 */
function initCategoryDrag(event) {
	const categoryTitle = event.target.closest(".category-title");
	const contextMenu = event.target.closest(".context-menu");
	if (contextMenu !== null) return;
	if (event.button !== 0) return;
	if (!categoryTitle) return;

	const category = event.target.closest(".category");
	const categoryChildren = category.querySelectorAll("*");
	category.setAttribute("draggable", "true");

	categoryChildren.forEach((elem) => {
		elem.setAttribute("draggable", "false");
	});

	/**
	 * Removes the draggable attribute of the category and its children.
	 */
	function removeChildrenDraggable() {
		category.removeAttribute("draggable");
		categoryChildren.forEach((elem) => {
			elem.removeAttribute("draggable");
		});

		category.removeEventListener("pointerup", removeChildrenDraggable);
		container.removeEventListener("dragstart", initDraggedElem);
	}

	category.addEventListener("pointerup", removeChildrenDraggable);

	/**
	 * Handles the dragstart event on the category elements.
	 * Initializes the category drag event listeners and classes.
	 *
	 * @param {PointerEvent} event
	 */
	function initDraggedElem(event) {
		const category = event.target.closest(".category");

		category.classList.add("dragging");

		const draggedElem = document.querySelector(".dragging");
		const draggedElemChildren = draggedElem.querySelectorAll(".rectangle");

		/**
		 * Handles the dragover event on the category elements.
		 * Allows the dragged element to be dropped on another category.
		 * Appends dragged element based on the cursor's position relative to the middle point of the drop target.
		 *
		 * @param {DragEvent} event
		 */
		function checkDropTarget(event) {
			event.preventDefault();
			const dropTarget = event.target.closest(".category:not(.dragging)");

			draggedElemChildren.forEach((elem) => {
				elem.style.opacity = 0.8;
			});

			if (dropTarget !== null) {
				const dropTargetBox = dropTarget.getBoundingClientRect();

				const middlePointX = (dropTargetBox.left + dropTargetBox.right) / 2;

				if (event.clientX <= middlePointX) {
					dropTarget.after(draggedElem);
				} else {
					dropTarget.before(draggedElem);
				}
			}
		}

		/**
		 * Handles the dragend event on the category  elements.
		 * Removes the initialized category drag event listeners and classes.
		 *
		 * @param {DragEvent} event
		 */
		function dragendHandler(event) {
			const category = event.target.closest(".category");
			const categoryChildren = category.querySelectorAll("*");

			category.classList.remove("dragging");
			category.removeAttribute("draggable");

			categoryChildren.forEach((elem) => {
				elem.removeAttribute("draggable");
			});

			draggedElemChildren.forEach((elem) => {
				elem.removeAttribute("style");
			});

			container.removeEventListener("dragend", dragendHandler);
			container.removeEventListener("dragover", checkDropTarget);
			container.removeEventListener("dragstart", initDraggedElem);
			category.removeEventListener("pointerup", removeChildrenDraggable);

			saveState();
		}

		container.addEventListener("dragover", checkDropTarget);
		container.addEventListener("dragend", dragendHandler);
	}

	container.addEventListener("dragstart", initDraggedElem);
}

container.addEventListener("pointerdown", initCategoryDrag);
