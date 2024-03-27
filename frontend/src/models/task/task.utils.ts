import { TaskType } from "./task.enums";

export function getTypeText(t: TaskType): string {
  switch (t) {
    case TaskType.SECTOR:
      return "sec";
    case TaskType.SYSTEM:
      return "sys";
    case TaskType.PLANET:
      return "pla";
    default:
      return "moo";
  }
}
