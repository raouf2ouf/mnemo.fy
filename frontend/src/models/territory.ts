import { Point } from "./hex";

export interface TerritorySection {
  points: string;
  inverse: string[];
  titleSize: number;
  titlePosition: Point;
  userControlled: boolean;
}

export interface Territory {
  id: string;
  sections: TerritorySection[];
  color?: string; // used only for minimap representation
  title?: string;
}

export interface Shape {
  points: Point[];
  inverse: Point[][];
  min: Point;
  max: Point;
  contained: boolean;
}
