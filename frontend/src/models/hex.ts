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
  used: boolean;
  visible: boolean;
}
