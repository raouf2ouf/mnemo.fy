import { Task } from "@models/task/task";
import { getAllChildren } from "./tasks.slice.utils";
import { HEX_SIZE, Hex } from "@models/hex";
import { getFreeNeighbors } from "@models/hex.utils";
import { System } from "@models/task/system";
import { TaskType } from "@models/task/task.enums";
import { HexChange } from "@models/backup";

export function proposeSystemPosition(
  systems: Task[],
  system: System,
  hexes: Hex[],
  starts: number[],
  nbrRows: number,
  nbrCols: number
): number {
  const siblings = systems.filter((s) => s.parent == system.parent);
  let sibling: System | undefined;
  for (let i = 0; i < siblings.length; ++i) {
    const s = siblings[i];
    if (s === system) {
      if (i > 0) {
        sibling = siblings[i - 1] as System;
      } else if (i + 1 < siblings.length) {
        sibling = siblings[i] as System;
      }
      break;
    }
  }
  if (sibling && sibling.hex !== undefined) {
    let neighbors = getFreeNeighbors(sibling.hex, hexes, nbrRows, nbrCols);
    if (neighbors.length > 0) {
      const rand = Math.floor(Math.random() * neighbors.length);
      return neighbors[rand];
    }
  } else {
    // no sibling, so check potential starts
    for (let i = 0; i < starts.length; ++i) {
      const hex = hexes[starts[i]];
      if (!hex.sectorId) {
        return hex.id;
      }
    }
  }
  // no good open space possible, so take the first one available
  for (let i = 0; i < hexes.length; ++i) {
    const hex = hexes[i];
    if (!hex.sectorId) {
      return hex.id;
    }
  }
  return 0; // should not be possible
}

export function computeHexesControl(
  hexes: Hex[],
  allTasks: Task[]
): { rollbackHexes: HexChange[]; rollforwardHexes: HexChange[] } {
  const rollbackHexes: HexChange[] = [];
  const rollforwardHexes: HexChange[] = [];
  const influenceRadius = 1;
  const radius = (influenceRadius * HEX_SIZE) / 2;
  const threshold = 1 / 10;

  const systemDataMap = new Map<
    string,
    { strength: number; control: number }
  >();
  const systems = allTasks.filter((t) => t.type == TaskType.SYSTEM) as System[];
  let remaining: Task[] = allTasks;
  for (const system of systems) {
    const { children, rest } = getAllChildren(remaining, system.id);
    let strength = 0;
    let control = 0;
    for (const child of children) {
      if (child.type == TaskType.PLANET) {
        strength += 1;
      }
      if (child.checked) {
        control += 1;
      }
    }
    if (system.checked) {
      control += 1;
    }
    systemDataMap.set(system.id, {
      strength: 1 + strength / 8,
      control: control / (children.length + 1),
    });
    remaining = rest;
  }

  for (const hex of hexes) {
    if (hex.visible) {
      const center = hex.center;
      const strengthMap = new Map<
        string,
        { sectorId: string; sectorStrength: number; userStrength: number }
      >();
      for (const system of systems) {
        const { strength, control } = systemDataMap.get(system.id)!;
        const coords = hexes[system.hex!].center;
        const dx = Math.abs(coords.x - center.x);
        const dy = Math.abs(coords.y - center.y);
        let sectorStrength =
          Math.pow(strength * radius, 2) / (dx * dx + dy * dy + 0.0001);
        if (sectorStrength > threshold) {
          let strengthObject = {
            sectorId: system.parent!,
            sectorStrength: 0,
            userStrength: 0,
          };
          if (strengthMap.has(system.parent!)) {
            strengthObject = strengthMap.get(system.parent!)!;
          } else {
            strengthMap.set(system.parent!, strengthObject);
          }
          strengthObject.sectorStrength += sectorStrength;
          strengthObject.userStrength += sectorStrength * control;
        }
      }
      const sotredStrength = Array.from(strengthMap.values()).sort(
        (a, b) => b.sectorStrength - a.sectorStrength
      );
      rollbackHexes.push({
        id: hex.id,
        changes: { sectorId: hex.sectorId, userControlled: hex.userControlled },
      });
      if (sotredStrength.length > 0) {
        const winning = sotredStrength[0];
        // changes needed;
        hex.sectorId = winning.sectorId;
        hex.userControlled = winning.userStrength > winning.sectorStrength / 2;
      } else {
        hex.sectorId = undefined;
        hex.userControlled = false;
      }
      rollforwardHexes.push({
        id: hex.id,
        changes: { sectorId: hex.sectorId, userControlled: hex.userControlled },
      });
    }
  }
  return { rollforwardHexes, rollbackHexes };
}
