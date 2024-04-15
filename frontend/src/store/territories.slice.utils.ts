import { Hex, Point } from "@models/hex";
import {
  getAllRingNeighborsRowCol,
  isValidRowCol,
  pointToString,
  pointsToString,
  rowColToId,
  stringToPoint,
} from "@models/hex.utils";
import { Sector } from "@models/task/sector";
import { Territory, TerritorySection } from "@models/territory";
import { buildShapes, computeTitlePositionSize } from "@models/territoy.utils";

export function buildPointsMapping(
  targetHexes: Hex[],
  nbrRows: number,
  isDifferentNeighbor: (row: number, col: number) => boolean
): Map<string, string> {
  const points: Map<string, string> = new Map<string, string>();
  for (const hex of targetHexes) {
    const neighbors: { row: number; col: number }[] = getAllRingNeighborsRowCol(
      hex.id,
      nbrRows
    );
    neighbors.forEach((n, i) => {
      if (isDifferentNeighbor(n.row, n.col)) {
        points.set(
          pointToString(hex.corners[(i + 1) % 6]),
          pointToString(hex.corners[(i + 2) % 6])
        );
      }
    });
  }
  return points;
}

export function buildTerritory(
  sectorId: string,
  pointsMap: Map<string, string>,
  userPointsMap: Map<string, string>
): Territory {
  const shapes = buildShapes(pointsMap);
  const sections: TerritorySection[] = [];
  for (const shape of shapes) {
    const { titlePosition, titleSize } = computeTitlePositionSize(shape);
    sections.push({
      points: pointsToString(shape.points),
      inverse: shape.inverse.map((inv) => pointsToString(inv)),
      titlePosition,
      titleSize,
      userControlled: false,
    });
  }

  const userShapes = buildShapes(userPointsMap);
  for (const shape of userShapes) {
    sections.push({
      points: pointsToString(shape.points),
      inverse: shape.inverse.map((inv) => pointsToString(inv)),
      titlePosition: { x: 0, y: 0 },
      titleSize: 0,
      userControlled: true,
    });
  }

  return {
    id: sectorId,
    sections,
  };
}

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
      sectorHexes,
      nbrRows,
      (row: number, col: number) => {
        if (!isValidRowCol(row, col, nbrRows, nbrCols)) return true;
        const idx = rowColToId(row, col, nbrRows);
        const hex = hexes[idx];
        return hex.sectorId !== sector.id;
      }
    );
    const userPoints: Map<string, string> = buildPointsMapping(
      userHexes,
      nbrRows,
      (row: number, col: number) => {
        const idx = rowColToId(row, col, nbrRows);
        if (!isValidRowCol(row, col, nbrRows, nbrCols)) return true;
        const hex = hexes[idx];
        return hex.sectorId !== sector.id || hex.userControlled != true;
      }
    );
    territories.push(buildTerritory(sector.id, points, userPoints));
  }
  return territories;
}
