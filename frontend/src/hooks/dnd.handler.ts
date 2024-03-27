import { TaskType } from "@models/task/task.enums";
import {
  MutableDOMRect,
  createDraggedElementFrom,
  dispatchDragEnded,
  dispatchDragStarted,
  hideElement,
  moveElement,
} from "./dnd.helpers";

type Point = {
  x: number;
  y: number;
};

export class DnDHander {
  public container?: HTMLElement;

  public originalEl?: HTMLElement;
  public originalElIdx?: number;
  public originalElDisplay?: string;
  public originalElType?: TaskType;

  public draggedEl?: HTMLElement;

  public initialMousePosition: Point = { x: 0, y: 0 };
  public currentMousePosition: Point = { x: 0, y: 0 };
  public previousMousePosition: Point = { x: 0, y: 0 };

  public timeout?: NodeJS.Timeout;
  public dragging: boolean = false;
  public finishingDrag: boolean = false;
  public placeholder: HTMLElement;
  public placeholderType?: TaskType;
  private placeholderIdx?: number;

  private distanceBetweenTypes = 32;

  public map = new Map<HTMLElement, MutableDOMRect>();
  private children: HTMLElement[] = [];

  private movingPlaceholder: boolean = false;
  constructor() {
    this.placeholder = document.createElement("div");
    this.placeholder.classList.add("drag-placeholder");
    const line = document.createElement("div");
    line.classList.add("line");
    this.placeholder.appendChild(line);
    const circle = document.createElement("div");
    circle.classList.add("circle");
    const inside = document.createElement("div");
    inside.classList.add("inside");
    circle.appendChild(inside);
    this.placeholder.appendChild(circle);
  }

  public updatePlaceholderType(newType: TaskType) {
    if (this.placeholderType !== undefined) {
      this.placeholder.classList.remove("type" + this.placeholderType);
    }
    this.placeholder.classList.add("type" + newType);
    this.placeholderType = newType;
  }

  public startDragging() {
    this.timeout = undefined;
    this.dragging = true;
    this.map.clear();
    this.children = [];

    for (let i = 0; i < this.container!.children.length; i++) {
      const child = this.container!.children[i] as HTMLElement;
      if (this.originalEl === child) {
        this.originalElIdx = i;
        this.placeholderIdx = this.originalElIdx;
        break;
      }
    }
    dispatchDragStarted(this.originalEl!);

    this.originalElType = Number(this.originalEl!.getAttribute("data-type"));

    this.draggedEl = createDraggedElementFrom(this.originalEl!);
    this.draggedEl.classList.add("dragging");
    this.draggedEl.style.transition = "";

    this.originalElDisplay = hideElement(this.originalEl!);
    this.container!.insertBefore(this.placeholder, this.originalEl!);

    this.updatePlaceholderType(this.originalElType);
    setTimeout(() => {
      let idx = -1;
      const scrollTop = this.container!.parentElement!.scrollTop;
      for (let i = 0; i < this.container!.children.length; i++) {
        const child = this.container!.children[i] as HTMLElement;
        if (this.originalEl === child) continue;
        idx++;
        const rect = child.getBoundingClientRect();
        this.map.set(child, {
          top: rect.top + scrollTop,
          bottom: rect.bottom + scrollTop,
          height: rect.height,
          translate: 0,
        });
        this.children[idx] = child;
      }
    }, 20);
  }

  public cancelDragging() {
    if (this.timeout !== undefined) {
      clearTimeout(this.timeout);
    }
    this.timeout = undefined;
    this.finishDragging();
  }

  public finishDragging() {
    if (this.finishingDrag) return;
    this.dragging = false;
    if (this.originalEl && this.draggedEl) {
      this.draggedEl!.style.transition =
        "transform 200ms cubic-bezier(0, 0, 0.2, 1)";
      const placeholderRect = this.map.get(this.placeholder)!;
      this.draggedEl!.style.transform = `translate(0px, ${placeholderRect.translate}px)`;
      this.finishingDrag = true;
      dispatchDragEnded(
        this.container!,
        this.originalEl.id,
        this.originalElType!,
        this.placeholderType!,
        this.originalElIdx!,
        this.placeholderIdx!
      );
      this.container!.removeChild(this.placeholder);
      this.placeholder.style.transform = "";
      setTimeout(() => {
        document.body.removeChild(this.draggedEl!);
        for (let i = 0; i < this.container!.children.length; i++) {
          const child = this.container!.children[i] as HTMLElement;
          child.style.transform = "";
        }
        this.originalEl!.style.display = this.originalElDisplay!;
        this.draggedEl = undefined;
        this.finishingDrag = false;
        dispatchDragEnded(this.originalEl!);
      }, 200);
    }
  }

  public move() {
    this.moveDraggedEl();
    const mouseY = this.currentMousePosition.y;
    const dy = Math.abs(mouseY - this.previousMousePosition.y);
    if (dy >= 10 && !this.movingPlaceholder) {
      // we only move if it is superior to 10px
      this.movingPlaceholder = true;
      this.previousMousePosition = { ...this.currentMousePosition };
      this.movePlaceholder(mouseY);
      this.movingPlaceholder = false;
    }
  }

  public moveDraggedEl() {
    const y = this.currentMousePosition.y;
    let dx = this.currentMousePosition.x - this.initialMousePosition.x;
    let dy = y - this.initialMousePosition.y;
    this.draggedEl!.style.transform = `translate(${dx}px, ${dy}px)`;

    let type = Math.floor(
      this.originalElType! + dx / this.distanceBetweenTypes
    );
    type = type < 0 ? 0 : type > 3 ? 3 : type;
    this.updatePlaceholderType(type);
    // scroll
    const parent = this.container!.parentElement!;
    if (parent.scrollTop > y) {
      parent.scrollTo({ behavior: "smooth", top: parent.scrollTop - 200 });
    } else if (parent.scrollTop + parent.clientHeight < y) {
      parent.scrollTo({ behavior: "smooth", top: parent.scrollTop + 200 });
    }
  }

  public movePlaceholder(mouseY: number) {
    let idx: number | undefined;
    let lastOffset: number | undefined;
    let lastBox: MutableDOMRect | undefined;
    let closest: HTMLElement | undefined;
    const length = this.children.length;
    mouseY = mouseY + this.container!.parentElement!.scrollTop;
    for (let i = 0; i < length; i++) {
      const child = this.children[i] as HTMLElement;
      lastBox = this.map.get(child)!;
      lastOffset = mouseY - lastBox.top;
      if (lastOffset > 0 && lastOffset < lastBox.height) {
        closest = child;
        if (this.placeholder === child) break;
        idx = i;
        break;
      }
    }
    if (closest === this.placeholder) return;

    if (idx === undefined) {
      if (lastOffset !== undefined) {
        if (lastOffset > 0) {
          // we are at the bottom
          idx = length - 1;
        } else {
          // we are at the top
          idx = 0;
        }
      }
    }

    if (idx !== undefined) {
      if (closest === undefined) return;
      const closestRect = this.map.get(closest)!;
      const placeholderRect = this.map.get(this.placeholder)!;
      let dy = closestRect.top - placeholderRect.top;
      let placeholderHeight = placeholderRect.height;
      if (dy < 0) {
        // if we are not at the top no need to move
        if (lastOffset! > lastBox!.height / 2) return;
        // we went up
        moveElement(this.placeholder, dy, placeholderRect);
        for (let i = this.placeholderIdx!; i > idx; i--) {
          const child = this.children[i - 1];
          this.children[i] = child;
          moveElement(child, placeholderHeight, this.map.get(child)!);
        }
      } else {
        // we went down
        if (lastOffset! < lastBox!.height / 2) return;
        dy = closestRect.bottom - placeholderRect.top - placeholderHeight;
        placeholderHeight *= -1;
        moveElement(this.placeholder, dy, placeholderRect);
        for (let i = this.placeholderIdx!; i < idx; i++) {
          const child = this.children[i + 1];
          this.children[i] = child;
          moveElement(child, placeholderHeight, this.map.get(child)!);
        }
      }
      this.children[idx] = this.placeholder;
      this.placeholderIdx = idx;
    }
    // there is no other element;
  }
}

export const dndHandler = new DnDHander();
