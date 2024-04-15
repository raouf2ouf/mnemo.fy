export const HEX_SIZE = 130;
export const SPACE_SIZE = 975;
export const NBR_ROWS = 7;
export const NBR_COLS = 9;

export interface Point {
  x: number;
  y: number;
}

export interface Hex {
  id: number;
  col: number;
  row: number;
  corners: Point[];
  center: Point;
  sectorId?: string;
  userControlled?: boolean;
}
