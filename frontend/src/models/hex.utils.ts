import { Hex, Point } from "./hex";

export function buildSpaceFlatHexes(
  size: number,
  nbrRows: number,
  nbrCols: number
): { hexes: Hex[]; starts: number[] } {
  const halfSize = size / 2;
  const quarterSize = size / 4;

  const X = nbrCols * 3 + 1 + 4;
  const Y = nbrRows * 2 + 1 + 2;
  const grid: Point[][] = [];

  // create grid points (corners)
  for (let x = 0; x < X; ++x) {
    const c: Point[] = [];
    grid[x] = c;
    const offsetX = x * quarterSize;
    for (let y = 0; y < Y; ++y) {
      const offsetY = y * halfSize;
      c.push({ x: offsetX, y: offsetY });
    }
  }
  const hexes: Hex[] = [];
  for (let col = 0; col < nbrCols; ++col) {
    const odd = col % 2 == 0;
    const offsetX = col * 3;
    for (let row = 0; row < nbrRows; ++row) {
      const offsetY = odd ? row * 2 + 1 : row * 2 + 2;
      const c1 = grid[offsetX][offsetY]; // middle-left corner;
      const c2 = grid[offsetX + 1][offsetY - 1]; // top-left
      const c3 = grid[offsetX + 3][offsetY - 1]; // top-right
      const c4 = grid[offsetX + 4][offsetY]; // middle-right
      const c5 = grid[offsetX + 3][offsetY + 1]; // bottom-right
      const c6 = grid[offsetX + 1][offsetY + 1]; // bottom-left

      const hex: Hex = {
        id: hexes.length,
        col,
        row,
        corners: [c1, c2, c3, c4, c5, c6],
        center: grid[offsetX + 2][offsetY],
      };
      hexes.push(hex);
    }
  }
  const qr = nbrRows / 4;
  const qc = nbrCols / 4;
  const starts: number[] = [
    rowColToId(Math.floor(qr), Math.floor(qc), nbrRows), // top left
    rowColToId(Math.floor(3 * qr), Math.floor(3 * qc), nbrRows), // bottom right
    rowColToId(Math.floor(qr), Math.floor(3 * qc), nbrRows), // top right
    rowColToId(Math.floor(3 * qr), Math.floor(qc), nbrRows), // bottom left
    rowColToId(Math.floor(2 * qr), Math.floor(qc), nbrRows), // middle left
    rowColToId(Math.floor(2 * qr), Math.floor(qc * 3), nbrRows), // middle right
  ];

  return { hexes, starts };
}

export function rowColToId(row: number, col: number, nbrRows: number) {
  return col * nbrRows + row;
}

export function idToRowCol(
  id: number,
  nbrRows: number
): { row: number; col: number } {
  return {
    row: id % nbrRows,
    col: Math.floor(id / nbrRows),
  };
}

export function pointToString(point: Point): string {
  return `${point.x},${point.y}`;
}

export function stringToPoint(str: string): Point {
  const s = str.split(",");
  return { x: Number(s[0]), y: Number(s[1]) };
}

export function pointsToString(points: Point[]): string {
  return points.map((p) => pointToString(p)).join(" ");
}

export function isValidRowCol(
  row: number,
  col: number,
  nbrRows: number,
  nbrCols: number
): boolean {
  return row >= 0 && row < nbrRows && col >= 0 && col < nbrCols;
}

export function getAllRingNeighborsRowCol(
  id: number,
  nbrRows: number
): { row: number; col: number }[] {
  const { row, col } = idToRowCol(id, nbrRows);
  const odd = col % 2 != 0 ? 0 : 1;
  return [
    { row: row - 1, col }, // top
    { row: row - odd, col: col + 1 }, // top-right
    { row: row + 1 - odd, col: col + 1 }, // bottom-right
    { row: row + 1, col }, // bottom
    { row: row + 1 - odd, col: col - 1 }, // bottom-left
    { row: row - odd, col: col - 1 }, // top-left
  ];
}

export function getRingNeighborsRowCol(
  id: number,
  nbrRows: number,
  nbrCols: number
): { row: number; col: number }[] {
  return getAllRingNeighborsRowCol(id, nbrRows).filter((coords) =>
    isValidRowCol(coords.row, coords.col, nbrRows, nbrCols)
  );
}

export function getRingNeighbors(
  id: number,
  nbrRows: number,
  nbrCols: number
): number[] {
  const ring = getRingNeighborsRowCol(id, nbrRows, nbrCols);
  return ring.map(({ row, col }) => rowColToId(row, col, nbrRows));
}

export function getFreeNeighbors(
  id: number,
  hexes: Hex[],
  nbrRows: number,
  nbrCols: number
): number[] {
  const validNeighbors: number[] = [];
  const neighbors1 = getRingNeighbors(id, nbrRows, nbrCols); // first ring of neighbors
  for (let i = 0; i < neighbors1.length; ++i) {
    const n = neighbors1[i];
    if (n >= 0 && n < hexes.length) {
      if (!hexes[n].sectorId) {
        validNeighbors.push(n);
      }
    }
  }
  if (validNeighbors.length > 0) return validNeighbors;
  // check second ring
  let neighbors2: number[] = [];
  for (let i = 0; i < neighbors1.length; ++i) {
    const n = neighbors1[i];
    if (n >= 0 && n < hexes.length) {
      const ns = getRingNeighbors(n, nbrRows, nbrCols);
      neighbors2 = [...neighbors2, ...ns];
    }
  }
  for (const neighbor of neighbors2) {
    if (neighbor >= 0 && neighbor < hexes.length) {
      if (!hexes[neighbor].sectorId) {
        validNeighbors.push(neighbor);
      }
    }
  }
  return validNeighbors;
}
