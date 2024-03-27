import { dndHandler } from "./dnd.handler";

const LONGPRESS_TIMEOUT = 500;

function handleWindowMove(e: MouseEvent | TouchEvent) {
  if (!dndHandler.dragging) {
    dndHandler.cancelDragging();
    removeWindowEventListeners();
    return;
  }
  e.preventDefault();
  const c = (e as TouchEvent).touches
    ? (e as TouchEvent).touches[0]
    : (e as MouseEvent);
  dndHandler.currentMousePosition.x = c.clientX;
  dndHandler.currentMousePosition.y = c.clientY;
  dndHandler.move();
}

function handleWindowUp(e: Event) {
  dndHandler.cancelDragging();
}

export function appendWindowEventListeners() {
  window.addEventListener("mousemove", handleWindowMove, { passive: false });
  window.addEventListener("touchmove", handleWindowMove, {
    passive: false,
    capture: false,
  });
  window.addEventListener("mouseup", handleWindowUp, { passive: true });
  window.addEventListener("touchend", handleWindowUp, { passive: true });
}

export function removeWindowEventListeners() {
  window.removeEventListener("mousemove", handleWindowMove);
  window.removeEventListener("touchmove", handleWindowMove);
  window.removeEventListener("mouseup", handleWindowUp);
  window.removeEventListener("touchend", handleWindowUp);
}

export function handleChildPointerDown(e: Event) {
  console.log("pointer down");
  dndHandler.originalEl = e.currentTarget as HTMLElement;
  const c = (e as TouchEvent).touches
    ? (e as TouchEvent).touches[0]
    : (e as MouseEvent);
  dndHandler.initialMousePosition.x = c.clientX;
  dndHandler.initialMousePosition.y = c.clientY;
  dndHandler.previousMousePosition = { ...dndHandler.initialMousePosition };
  appendWindowEventListeners();
  if (!dndHandler.timeout && !dndHandler.dragging) {
    dndHandler.timeout = setTimeout(() => {
      dndHandler.startDragging();
    }, LONGPRESS_TIMEOUT);
  }
}
