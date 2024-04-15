/**
 * Task types
 */
export enum TaskType {
  SECTOR = 0,
  SYSTEM = 1,
  PLANET = 2,
  MOON = 3,
}

/**
 * Task colors
 */
export enum TaskColor {
  VIOLET = "#9488F0",
  GREEN = "#6FDCBA",
  BLUE = "#3CA1ED",
  RED = "#F33F5B",
  ORANGE = "#F98654",
  YELLOW = "#F6D083",
  BROWN = "#BC768B",
}
export const COLORS = Object.values(TaskColor);

export enum DisplayTaskChange {
  EDIT_ON,
  EDIT_OFF,
  CLOSED,
  OPENED,
  FOCUS,
  DISPLAYABLE,
}

export enum GraphChange {}
