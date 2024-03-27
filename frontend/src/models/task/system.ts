import { Planet, PlanetDataExport, deflatePlanet } from "./planet";
import { BasicTaskData, Task, TaskData, TaskDataExport } from "./task";
import { TaskColor, TaskType } from "./task.enums";

export interface BasicSystemData extends BasicTaskData {
  type: TaskType.SYSTEM;
  hex?: number;
}
export interface SystemDataExport extends BasicSystemData, TaskDataExport {
  type: TaskType.SYSTEM;
  children: PlanetDataExport[];
}
export interface System extends BasicSystemData, TaskData {
  type: TaskType.SYSTEM;
}

export function deflateSystem(system: System, tasks: Task[]): SystemDataExport {
  const children: Task[] = [];
  const rest: Task[] = [];
  for (const task of tasks) {
    if (task.parent == system.id) {
      children.push(task);
    } else {
      rest.push(task);
    }
  }
  const deflatedChildren: PlanetDataExport[] = [];
  for (const child of children) {
    deflatedChildren.push(deflatePlanet(child as Planet, rest));
  }
  return { ...system, children: deflatedChildren };
}

export const inflateSystem = (
  data: SystemDataExport,
  galaxyId: string,
  index: number,
  parent: string,
  color: TaskColor
): System => {
  const inflated = { ...data, color, galaxyId, displayed: true, index, parent };
  //@ts-ignore
  delete inflated.children;
  return inflated as System;
};
