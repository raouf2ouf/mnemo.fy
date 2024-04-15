import { HexChange, TaskChange } from "@models/backup";
import { Task } from "@models/task/task";

type Change = HexChange | TaskChange;

export function _addToChangeStack(stack: Change[], changes: Change[]): void {
  for (const change of changes) {
    const task = stack.find((r) => r.id == change.id);
    if (!task) {
      stack.push(change);
    } else {
      Object.assign(task.changes, change.changes);
    }
  }
}
export function addToChangeStack(
  existingStack: Change[],
  changes: Change[]
): Change[] {
  const stack = [...existingStack];
  _addToChangeStack(stack, changes);
  return stack;
}

export function applyTaskChanges(
  unmutableTasks: Task[],
  tasksChanges: TaskChange[],
  tasksAdd: Task[],
  tasksDelete: string[]
): Task[] {
  const tasks: Task[] = [];
  for (const t of unmutableTasks) {
    const task = { ...t };
    for (const change of tasksChanges) {
      if (task.id == change.id) {
        Object.assign(task, change.changes);
        break;
      }
    }
    const toDelete = tasksDelete.find((id) => task.id == id) !== undefined;
    if (!toDelete) {
      tasks.push(task);
    }
  }

  for (const add of tasksAdd) {
    tasks.push(add);
  }
  return tasks;
}
