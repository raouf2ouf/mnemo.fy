import { Point } from "./hex";
import Queue from "tinyqueue";

export interface Territory {
  id: string;
  points: Point[];
  inverse: Point[][];
  min: Point;
  max: Point;
  titlePosition?: Point;
  titleSize?: number;
}

export function territoryId(sectorId: string, isUser: boolean = false): string {
  return isUser ? `u-${sectorId}` : sectorId;
}

export function computeMinMax(points: Point[]): { min: Point; max: Point } {
  const ps = [...points].sort((a, b) => a.x - b.x);
  const minX = ps[0].x;
  const maxX = ps[ps.length - 1].x;
  ps.sort((a, b) => a.y - b.y);
  const minY = ps[0].y;
  const maxY = ps[ps.length - 1].y;
  return {
    min: {
      x: minX,
      y: minY,
    },
    max: {
      x: maxX,
      y: maxY,
    },
  };
}

export function contains(t1: Territory, t2: Territory): boolean {
  return (
    t1.min.x < t2.min.x &&
    t1.min.y < t2.min.y &&
    t1.max.x > t2.max.x &&
    t1.max.y > t2.max.y
  );
}

/* Algorithm for titlePosition&TitleSize from: https://github.com/mapbox/polylabel */
const PRECISION = 100.0;

const getCentroidCell = (shape: Territory) => {
  let area = 0;
  let x = 0;
  let y = 0;
  const points = shape.points;
  // find the centroid
  for (let i = 0, len = points.length, j = len - 1; i < len; j = i++) {
    const a = points[i];
    const b = points[j];
    const f = a.x * b.y - b.x * a.y;
    x += (a.x + b.x) * f;
    y += (a.y + b.y) * f;
    area += f * 3;
  }
  if (area === 0) return new Cell(points[0].x, points[0].y, 0, shape);
  return new Cell(x / area, y / area, 0, shape);
};

// get squared distance from a point to a segement
const getSegDistSq = (px: number, py: number, a: Point, b: Point) => {
  let x = a.x;
  let y = a.y;
  let dx = b.x - x;
  let dy = b.y - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = b.x;
      y = b.y;
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = px - x;
  dy = py - y;
  return dx * dx + dy * dy;
};

// Signed distance from point to shape outline (negative if point is outside)
const pointToPolygonDist = (x: number, y: number, shape: Territory) => {
  let inside = false;
  let minDistSq = Infinity;

  const rings = [shape.points].concat(shape.inverse);
  for (let k = 0; k < rings.length; k++) {
    const ring = rings[k];
    for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
      const a = ring[i];
      const b = ring[j];

      if (
        a.y > y !== b.y > y &&
        x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x
      )
        inside = !inside;

      minDistSq = Math.min(minDistSq, getSegDistSq(x, y, a, b));
    }
  }
  return minDistSq === 0 ? 0 : (inside ? 1 : -1) * Math.sqrt(minDistSq);
};

class Cell {
  x: number;
  y: number;
  radius: number;
  distance: number;
  max: number;
  constructor(x: number, y: number, radius: number, shape: Territory) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.distance = pointToPolygonDist(x, y, shape); // distance from cell center to shape
    this.max = this.distance + this.radius * Math.SQRT2; // max distance to shape within a cell
  }
}

export function computeTitlePositionSize(t: Territory): {
  titlePosition: Point;
  titleSize: number;
} {
  let titlePosition: Point = { ...t.min };
  let titleSize: number = 0;
  const size = { ...t.max };
  size.x -= t.min.x;
  size.y -= t.min.y;
  const cellSize = Math.min(size.x, size.y);
  let radius = cellSize / 2;

  if (cellSize === 0) {
    titlePosition = { ...t.min };
    titleSize = 0;
  } else {
    const cellQueue = new Queue<Cell>(undefined, (a, b) => b.max - a.max);

    // Cover shape with initial cells;
    for (let x = t.min.x; x < t.max.x; x += cellSize) {
      for (let y = t.min.y; y < t.max.y; y += cellSize) {
        cellQueue.push(new Cell(x + radius, y + radius, radius, t));
      }
    }

    // Take centroid as the first best guess
    let bestCell = getCentroidCell(t);

    // Second guess: bounding box centroid
    const bboxCell = new Cell(t.min.x + size.x / 2, t.min.y + size.y / 2, 0, t);
    if (bboxCell.distance > bestCell.distance) bestCell = bboxCell;

    let nbrIterations = 0;
    while (cellQueue.length) {
      nbrIterations++;
      // pick the most promising cell
      const cell = cellQueue.pop()!;
      // update the best cell if we found a better one
      if (cell.distance > bestCell.distance) bestCell = cell;

      // do not drill down further if there's no chance of a better solution
      if (cell.max - bestCell.distance <= PRECISION) continue;

      // split the cell into four cells
      radius = cell.radius / 2;
      cellQueue.push(new Cell(cell.x - radius, cell.y - radius, radius, t));
      cellQueue.push(new Cell(cell.x + radius, cell.y - radius, radius, t));
      cellQueue.push(new Cell(cell.x - radius, cell.y + radius, radius, t));
      cellQueue.push(new Cell(cell.x + radius, cell.y + radius, radius, t));
    }

    titlePosition = { x: bestCell.x, y: bestCell.y };
    titleSize = bestCell.distance;
  }

  return { titlePosition, titleSize };
}
