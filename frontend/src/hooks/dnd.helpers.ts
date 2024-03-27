import { TaskType } from "@models/task/task.enums";

export const DRAG_STARTED_EVENT = "customDragStarted";
export const DRAG_ENDED_EVENT = "customDragEnded";

export interface MutableDOMRect {
  top: number;
  height: number;
  bottom: number;
  translate: number;
}

export function dispatchDragStarted(el: HTMLElement) {
  el.dispatchEvent(new CustomEvent(DRAG_STARTED_EVENT));
}

export function dispatchDragEnded(
  el: HTMLElement,
  taskId?: string,
  oldType?: TaskType,
  newType?: TaskType,
  startIdx?: number,
  endIdx?: number
) {
  el.dispatchEvent(
    new CustomEvent(DRAG_ENDED_EVENT, {
      detail: { taskId, newType, oldType, startIdx, endIdx },
    })
  );
}

function copyStylesFrom(fromEl: HTMLElement, toEl: HTMLElement) {
  const computedStyle = window.getComputedStyle(fromEl);
  Array.from(computedStyle).forEach((prop) => {
    toEl.style.setProperty(
      prop,
      computedStyle.getPropertyValue(prop),
      computedStyle.getPropertyPriority(prop)
    );
  });
  // nested elements
  for (let i = 0; i < fromEl.children.length; i++) {
    const sourceChild = fromEl.children[i] as HTMLElement;
    const targetChild = toEl.children[i] as HTMLElement;
    copyStylesFrom(sourceChild, targetChild);
  }
}

export function createDraggedElementFrom(originalEl: HTMLElement) {
  const rect = originalEl.getBoundingClientRect();
  const draggedEl = originalEl.cloneNode(true) as HTMLElement;
  copyStylesFrom(originalEl, draggedEl);

  draggedEl.style.position = "fixed";
  draggedEl.style.margin = "0";
  draggedEl.style.boxSizing = "border-box";
  draggedEl.style.width = `${rect.width}px`;
  draggedEl.style.height = `${rect.height}px`;
  draggedEl.style.top = `${rect.top}px`;
  draggedEl.style.left = `${rect.left}px`;

  draggedEl.style.zIndex = "9999";
  draggedEl.style.cursor = "grabbing";
  draggedEl.style.backgroundColor = "var(--background-color-light)";

  document.body.appendChild(draggedEl);

  return draggedEl;
}

export function hideElement(el: HTMLElement): string {
  const display = el.style.display;
  el.style.display = "none";
  return display;
}

export function moveElement(
  el: HTMLElement,
  dy: number,
  rect: MutableDOMRect
): void {
  const newY = rect.translate + dy;
  el.style.transform = `translateY(${newY}px)`;
  rect.translate = newY;
  rect.top += dy;
  rect.bottom += dy;
}
