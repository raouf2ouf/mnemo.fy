import { Change } from "@models/backup";

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
