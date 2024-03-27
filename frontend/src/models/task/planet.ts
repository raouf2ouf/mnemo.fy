import { Moon, MoonDataExport, deflateMoon } from "./moon";
import { BasicTaskData, Task, TaskData, TaskDataExport } from "./task";
import { TaskColor, TaskType } from "./task.enums";

export interface BasicPlanetData extends BasicTaskData {
  type: TaskType.PLANET;
}
export interface PlanetDataExport extends BasicPlanetData, TaskDataExport {
  type: TaskType.PLANET;
  children: MoonDataExport[];
}
export interface Planet extends BasicPlanetData, TaskData {
  type: TaskType.PLANET;
}

export function deflatePlanet(planet: Planet, tasks: Task[]): PlanetDataExport {
  const children: Task[] = [];
  const rest: Task[] = [];
  for (const task of tasks) {
    if (task.parent == planet.id) {
      children.push(task);
    } else {
      rest.push(task);
    }
  }
  const deflatedChildren: MoonDataExport[] = [];
  for (const child of children) {
    deflatedChildren.push(deflateMoon(child as Moon));
  }
  return { ...planet, children: deflatedChildren };
}

export function inflatePlanet(
  data: PlanetDataExport,
  galaxyId: string,
  index: number,
  parent: string,
  color: TaskColor
): Planet {
  const inflated = { ...data, color, galaxyId, displayed: true, index, parent };
  //@ts-ignore
  delete inflated.children;
  return inflated as Planet;
}
