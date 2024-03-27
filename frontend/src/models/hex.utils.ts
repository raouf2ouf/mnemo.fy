import { Hex, Point } from "./space";

export function buildSpaceFlatHexes(
  size: number,
  nbrRows: number,
  nbrCols: number
): Hex[] {
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
        used: false,
        visible: row < nbrRows - 1 || odd,
      };
      hexes.push(hex);
    }
  }
  return hexes;
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

export function getRingNeighborsRowCol(
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

export function getRingNeighbors(id: number, nbrRows: number): number[] {
  const ring = getRingNeighborsRowCol(id, nbrRows);
  return ring.map(({ row, col }) => rowColToId(row, col, nbrRows));
}

export function getFreeNeighbors(
  hexes: Hex[],
  id: number,
  nbrRows: number
): number[] {
  const validNeighbors: number[] = [];
  const neighbors1 = getRingNeighbors(id, nbrRows); // first ring of neighbors
  for (let i = 0; i < neighbors1.length; ++i) {
    const n = neighbors1[i];
    if (n >= 0 && n < hexes.length) {
      if (!hexes[n].used) {
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
      const ns = getRingNeighbors(n, nbrRows);
      neighbors2 = [...neighbors2, ...ns];
    }
  }
  for (const neighbor of neighbors2) {
    if (neighbor >= 0 && neighbor < hexes.length) {
      if (!hexes[neighbor].used) {
        validNeighbors.push(neighbor);
      }
    }
  }
  return validNeighbors;
}
