import { BasicTaskData, TaskData, TaskDataExport } from "./task";
import { TaskColor, TaskType } from "./task.enums";

export interface BasicMoonData extends BasicTaskData {
  type: TaskType.MOON;
}
export interface MoonDataExport extends BasicMoonData, TaskDataExport {
  type: TaskType.MOON;
}

export interface Moon extends BasicMoonData, TaskData {
  type: TaskType.MOON;
}

export function deflateMoon(moon: Moon): MoonDataExport {
  return { ...moon, children: [] };
}

export const inflateMoon = (
  data: MoonDataExport,
  galaxyId: string,
  index: number,
  parent: string,
  color: TaskColor
): Moon => {
  const inflated = { ...data, color, galaxyId, displayed: true, index, parent };
  return inflated as Moon;
};
