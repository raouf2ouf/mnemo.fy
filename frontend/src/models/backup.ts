import { Hex } from "./hex";
import { Task } from "./task/task";
import { Territory } from "./territory";

export interface TaskChange {
  id: string;
  changes: Partial<Task>;
}

export interface HexChange {
  id: number;
  changes: Partial<Hex>;
}

export interface BackupAction {
  tasksChange?: TaskChange[];
  tasksDelete?: string[];
  tasksAdd?: Task[];
  hexesChange?: HexChange[];
  territories?: Territory[];
}

export interface BackupStep {
  rollback: BackupAction;
  rollforward: BackupAction;
}
