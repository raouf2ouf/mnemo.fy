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

export interface TerritoryChange {
  id: number;
  changes: Partial<Territory>;
}

export interface BackupAction {
  tasksChange?: TaskChange[];
  tasksDelete?: string[];
  tasksAdd?: Task[];
  hexesChange?: HexChange[];
  territoriesChange?: TerritoryChange[];
  territoriesDelete?: string[];
  territoriesAdd?: Territory[];
}

export interface BackupStep {
  rollback: BackupAction;
  rollforward: BackupAction;
}
