import { GalaxyDataExport } from "@models/galaxy";
import { HEX_SIZE, Hex, NBR_COLS, NBR_ROWS } from "@models/hex";
import { buildSpaceFlatHexes } from "@models/hex.utils";
import {
  computeHexesControl,
  proposeSystemPosition,
} from "./hexes.slice.utils";
import { Task } from "@models/task/task";
import { buildTerritories } from "./territories.slice.utils";
import { Sector } from "@models/task/sector";
import { System } from "@models/task/system";
import { Territory } from "@models/territory";

export function buildMinimapRepresentation(galaxy: GalaxyDataExport): {
  hexes: Hex[];
  territories: Territory[];
  systems: System[];
} {
  const nbrRows = NBR_ROWS;
  const nbrCols = NBR_COLS;
  const { hexes, starts } = buildSpaceFlatHexes(HEX_SIZE, nbrRows, nbrCols);
  const tasks: Task[] = [];
  const sectors: Sector[] = [];
  const systems: System[] = [];
  for (const sector of galaxy.tasks) {
    tasks.push(sector as any);
    sectors.push(sector as any);
    for (const system of sector.children) {
      tasks.push(system as any);
      systems.push(system as any);
      for (const planet of system.children) {
        tasks.push(planet as any);
        for (const moon of planet.children) {
          tasks.push(moon as any);
        }
      }
    }
  }
  for (const system of systems) {
    if (system.hex === undefined) {
      system.hex = proposeSystemPosition(
        systems,
        system,
        hexes,
        starts,
        nbrRows,
        nbrCols
      );
      hexes[system.hex].sectorId = system.parent;
    }
  }
  computeHexesControl(hexes, tasks);
  const territories = buildTerritories(sectors, hexes, nbrRows, nbrCols);

  for (const t of territories) {
    const sec = sectors.find((s) => s.id == t.id)!;
    t.color = sec.color;
    t.title = sec.name;
  }

  return { hexes, territories, systems };
}
