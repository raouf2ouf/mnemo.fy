import { Task } from "./task/task";

export interface Change {
  id: string;
  changes: Partial<Task>;
}

export interface BackupAction {
  toChange: Change[];
  toDelete: string[];
  toAdd: Task[];
}

export interface BackupStep {
  rollback: BackupAction;
  rollforward: BackupAction;
}
