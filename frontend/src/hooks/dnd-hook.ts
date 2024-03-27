import { RefObject, useEffect } from "react";
import { dndHandler } from "./dnd.handler";
import {
  handleChildPointerDown,
  removeWindowEventListeners,
} from "./dnd.listener";

export function attachDndChildListeners(
  node: HTMLDivElement | null
): () => void {
  if (node) {
    node.style.transition = "transform 200ms";
    node.addEventListener("mousedown", handleChildPointerDown, {
      passive: true,
    });
    node.addEventListener("touchstart", handleChildPointerDown, {
      passive: true,
    });
  }
  return () => {
    if (node) {
      node.removeEventListener("mousedown", handleChildPointerDown);
      node.removeEventListener("touchstart", handleChildPointerDown);
    }
  };
}

export function attachDndZoneListeners(
  node: HTMLDivElement | null
): () => void {
  if (node) {
    dndHandler.container = node;
  }

  return () => {
    removeWindowEventListeners();
  };
}
