import { Hex, Point } from "@models/hex";
import {
  getAllRingNeighborsRowCol,
  isValidRowCol,
  pointToString,
  rowColToId,
  stringToPoint,
} from "@models/hex.utils";
import { Sector } from "@models/task/sector";
import { Territory, territoryId } from "@models/territory";

export function buildPointsMapping(
  hexes: Hex[],
  targetHexes: Hex[],
  nbrRows: number,
  nbrCols: number,
  isValidNeighbor: (hex: Hex) => boolean
): Map<string, string> {
  const points: Map<string, string> = new Map<string, string>();
  for (const hex of targetHexes) {
    const neighbors: { row: number; col: number }[] = getAllRingNeighborsRowCol(
      hex.id,
      nbrRows
    );
    neighbors.forEach((n, i) => {
      if (isValidRowCol(n.row, n.col, nbrRows, nbrCols)) {
        const neighborHex = hexes[rowColToId(n.row, n.col, nbrRows)];
        if (isValidNeighbor(neighborHex)) {
          points.set(
            pointToString(hex.corners[(i + 1) % 6]),
            pointToString(hex.corners[(i + 2) % 6])
          );
        }
      }
    });
  }
  return points;
}

export function buildShapes(pointsMap: Map<string, string>): Point[][] {
  const shapes: Point[][] = [];

  let startingPt: string | undefined = undefined;
  let currentPt: string | undefined = undefined;
  let shape: Point[] = [];

  while (pointsMap.size > 0) {
    if (!startingPt) {
      startingPt = pointsMap.keys().next().value;
      currentPt = startingPt;
      shape = [stringToPoint(startingPt!)];
      shapes.push(shape);
    }
    const nextPt = pointsMap.get(currentPt!);
    if (nextPt === undefined || nextPt === startingPt) {
      // we close the shape
      pointsMap.delete(currentPt!);
      startingPt = undefined;
    } else {
      pointsMap.delete(currentPt!);
      shape.push(stringToPoint(nextPt));
      currentPt = nextPt;
    }
  }
  return shapes;
}

export function buildTerritory(
  pointsMap: Map<string, string>,
  userPointsMap: Map<string, string>
): Territory {}

export function buildTerritories(
  sectors: Sector[],
  hexes: Hex[],
  nbrRows: number,
  nbrCols: number
): Territory[] {
  const territories: Territory[] = [];
  for (const sector of sectors) {
    const sectorHexes = hexes.filter((h) => h.sectorId == sector.id);
    const userHexes: Hex[] = sectorHexes.filter(
      (h) => h.userControlled == true
    );

    const points: Map<string, string> = buildPointsMapping(
      hexes,
      sectorHexes,
      nbrRows,
      nbrCols,
      (hex: Hex) => hex.sectorId == sector.id
    );
    const userPoints: Map<string, string> = buildPointsMapping(
      hexes,
      userHexes,
      nbrRows,
      nbrCols,
      (hex: Hex) => hex.sectorId == sector.id && hex.userControlled == true
    );
    territories.push(buildTerritory(points, userPoints));
  }
  return territories;
}
