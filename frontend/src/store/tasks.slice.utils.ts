import { BackupStep, Change } from "@models/backup";
import { inflateMoon } from "@models/task/moon";
import { inflatePlanet } from "@models/task/planet";
import { SectorDataExport, inflateSector } from "@models/task/sector";
import { inflateSystem } from "@models/task/system";
import { Task } from "@models/task/task";
import { TaskColor, TaskType } from "@models/task/task.enums";
import { _addToChangeStack } from "./backup.slice.utils";

export function getDirectChildren(
  tasks: Task[],
  taskId: string
): { children: Task[]; rest: Task[] } {
  const children: Task[] = [];
  const rest: Task[] = [];
  for (const task of tasks) {
    if (task.parent == taskId) {
      children.push(task);
    } else {
      rest.push(task);
    }
  }
  return { children, rest };
}

export function getAllChildren(
  tasks: Task[],
  taskId: string
): { children: Task[]; rest: Task[] } {
  const { children: directChildren, rest } = getDirectChildren(tasks, taskId);
  let allChildren = [...directChildren];
  let remaining = rest;
  for (const child of directChildren) {
    const { children, rest } = getAllChildren(remaining, child.id);
    allChildren = allChildren.concat(children);
    remaining = rest;
  }
  return { children: allChildren, rest: remaining };
}

export const inflateSectorsAndChildren = (
  galaxyId: string,
  data: SectorDataExport[]
): Task[] => {
  const tasks: Task[] = [];
  for (const d of data) {
    const sector = inflateSector(d, galaxyId, tasks.length);
    tasks.push(sector);
    const color = sector.color;
    for (const s of d.children) {
      const system = inflateSystem(s, galaxyId, tasks.length, sector.id, color);
      if (sector.closed) system.displayed = false;
      tasks.push(system);
      for (const p of s.children) {
        const planet = inflatePlanet(
          p,
          galaxyId,
          tasks.length,
          system.id,
          color
        );
        planet.color = color;
        if (system.closed || !system.displayed) planet.displayed = false;
        tasks.push(planet);
        for (const m of p.children) {
          const moon = inflateMoon(m, galaxyId, tasks.length, planet.id, color);
          moon.color = color;
          if (planet.closed || !planet.displayed) moon.displayed = false;
          tasks.push(moon);
        }
      }
    }
  }
  return tasks;
};

export const propagateChecked = (
  entities: Record<string, Task>,
  taskId: string,
  toggle?: boolean
): { rollback: Change[]; rollforward: Change[] } | undefined => {
  const rollback: Change[] = [];
  const rollforward: Change[] = [];
  const task = entities[taskId]!;
  const previousValue = task.checked;
  const newValue = toggle === undefined ? !task.checked : toggle;
  // if (previousValue == newValue) return; // nothing changed

  if (previousValue != newValue) {
    rollback.push({ id: task.id, changes: { checked: previousValue } });
    rollforward.push({ id: task.id, changes: { checked: newValue } });
  }

  const tasks = Object.values(entities);
  const affected: Task[] = [];
  if (newValue) {
    const toCheck: Task[] = tasks.filter((t) => t.parent == task.id);
    // need to check all children
    while (toCheck.length > 0) {
      const child = toCheck.pop()!;
      if (!child.checked) {
        rollback.push({
          id: child.id,
          changes: { checked: false },
        });
        rollforward.push({
          id: child.id,
          changes: { checked: true },
        });
        affected.push(child);
        tasks
          .filter((t) => t.parent == child.id)
          .map((t) => {
            toCheck.push(t);
          });
      }
    }
  } else {
    // need to uncheck all parents
    let toCheck: Task | undefined = task.parent
      ? entities[task.parent]
      : undefined;
    // need to check all children
    while (toCheck != undefined) {
      const parent: Task = toCheck;
      if (parent.checked) {
        affected.push(parent);
        rollback.push({
          id: parent.id,
          changes: { checked: true },
        });
        rollforward.push({
          id: parent.id,
          changes: { checked: false },
        });
        toCheck = parent.parent ? entities[parent.parent] : undefined;
      } else {
        break;
      }
    }
  }
  return {
    rollback,
    rollforward,
  };
};

export const morphTask = (
  tasks: Task[],
  task: Task,
  newType: TaskType,
  previousDisplayIdx: number,
  newDisplayIdx: number
): BackupStep | undefined => {
  tasks.sort((a, b) => a.index - b.index);
  const rollback: Change[] = [];
  const rollforward: Change[] = [];

  const { children, rest } = getAllChildren(tasks, task.id);

  const { realNewIdx, newParent } = findParent(
    tasks,
    task,
    newType,
    previousDisplayIdx,
    newDisplayIdx
  );

  if (newParent === undefined) return; // Error: no possible parent;

  const oldType = task.type;

  let newTaskIndex = realNewIdx;
  const delta = children.length + 1;
  if (previousDisplayIdx <= newDisplayIdx) {
    // we went down
    for (let i = task.index + delta; i < newTaskIndex; i++) {
      // bring all tasks between previous and new position up
      const t = tasks[i];
      rollback.push({ id: t.id, changes: { index: t.index } });
      rollforward.push({ id: t.id, changes: { index: t.index - delta } });
    }
    newTaskIndex -= delta;
  } else {
    // we went up
    for (let i = newTaskIndex; i < task.index; i++) {
      const t = tasks[i];
      rollback.push({ id: t.id, changes: { index: t.index } });
      rollforward.push({ id: t.id, changes: { index: t.index + delta } });
    }
  }
  rollback.push({ id: task.id, changes: { index: task.index } });
  rollforward.push({ id: task.id, changes: { index: newTaskIndex } });
  // push the children
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    rollback.push({ id: child.id, changes: { index: child.index } });
    rollforward.push({
      id: child.id,
      changes: { index: newTaskIndex + i + 1 },
    });
  }

  if (newType != oldType) {
    // need to morph
    const parent = rest.find((t) => t.id == newParent);
    const parentColor = parent ? parent.color : task.color;
    const { rollback: morphRollback, rollforward: morphRollforward } = morph(
      children,
      task,
      newType,
      newParent,
      parentColor
    );
    _addToChangeStack(rollback, morphRollback);
    _addToChangeStack(rollforward, morphRollforward);
  } else if (newParent && newParent !== task.parent) {
    const parent = rest.find((t) => t.id == newParent);
    const parentColor = parent ? parent.color : task.color;
    _addToChangeStack(rollback, [
      { id: task.id, changes: { color: task.color, parent: task.parent } },
    ]);
    _addToChangeStack(rollforward, [
      { id: task.id, changes: { color: parentColor, parent: newParent } },
    ]);
    for (const child of children) {
      _addToChangeStack(rollback, [
        { id: child.id, changes: { color: child.color } },
      ]);
      _addToChangeStack(rollforward, [
        { id: child.id, changes: { color: parentColor } },
      ]);
    }
  }

  return {
    rollback: { toChange: rollback, toAdd: [], toDelete: [] },
    rollforward: { toChange: rollforward, toAdd: [], toDelete: [] },
  };
};

export function morph(
  allChildren: Task[],
  task: Task,
  newType: TaskType,
  parentId: string,
  parentColor: TaskColor
): { rollback: Change[]; rollforward: Change[] } {
  const rollback: Change[] = [];
  const rollforward: Change[] = [];
  if (newType > TaskType.MOON) {
    newType = TaskType.MOON;
  }
  if (newType == task.type) return { rollback, rollforward };

  switch (newType) {
    case TaskType.SECTOR:
      rollback.push({
        id: task.id,
        changes: { type: task.type, color: task.color, parent: task.parent },
      });
      rollforward.push({
        id: task.id,
        changes: { type: newType, color: parentColor, parent: "" },
      });
      break;
    case TaskType.SYSTEM:
      rollback.push({
        id: task.id,
        changes: { color: task.color, type: task.type, parent: task.parent },
      });
      rollforward.push({
        id: task.id,
        changes: {
          color: parentColor,
          type: newType,
          parent: parentId,
        },
      });
      break;
    case TaskType.PLANET:
      rollback.push({
        id: task.id,
        changes: { color: task.color, type: task.type, parent: task.parent },
      });
      rollforward.push({
        id: task.id,
        changes: {
          color: parentColor,
          type: newType,
          parent: parentId,
        },
      });
      break;
    case TaskType.MOON:
      rollback.push({
        id: task.id,
        changes: { color: task.color, type: task.type, parent: task.parent },
      });
      rollforward.push({
        id: task.id,
        changes: {
          color: parentColor,
          type: newType,
          parent: parentId,
        },
      });
      break;
  }
  const directChildren = allChildren.filter((t) => t.parent == task.id);
  for (const child of directChildren) {
    let childParent = task.id;
    let childNewType = newType + 1;
    if (childNewType > TaskType.MOON) {
      // the direct parent became a moon, so the grandfather is the parent now
      childNewType = TaskType.MOON;
      childParent = parentId;
    }
    const { rollback: childRollback, rollforward: childRollforward } = morph(
      allChildren,
      child,
      childNewType,
      childParent,
      parentColor
    );
    _addToChangeStack(rollback, childRollback);
    _addToChangeStack(rollforward, childRollforward);
  }
  return { rollback, rollforward };
}

function findParent(
  tasks: Task[],
  task: Task,
  newType: TaskType,
  previousDisplayIdx: number,
  newDisplayIdx: number
): {
  realNewIdx: number;
  newParent?: string;
} {
  let direction = 0;
  let realNewIdx = -1;
  let displayIdx = -1;
  // find the real new index
  for (let i = 0; i < tasks.length; i++) {
    realNewIdx++;
    if (tasks[i].displayed) {
      displayIdx++;
    }
    if (displayIdx == newDisplayIdx) break;
  }
  if (newDisplayIdx < previousDisplayIdx) {
    // we went up
    direction = 1; // this will be used to start from the correct idx, if we go up then the realNewIdx will point to the wrong parent/sibling
  } else {
    // we went down
    // realNewIdx += nbrAllchildren;
  }

  let newParent: string | undefined;
  // find parent
  if (realNewIdx == 0 && newType == TaskType.SECTOR) {
    newParent = "";
  } else {
    for (let i = realNewIdx - direction; i >= 0; i--) {
      const potentialRelative = tasks[i];
      if (!potentialRelative.displayed) continue; // not displayed, no need to handle it

      if (potentialRelative.type < newType && potentialRelative !== task) {
        // we found a parent
        if (potentialRelative.type + 2 <= newType) {
          break; // there is no direct parent because the potentialRelative is a grand parent (2 levels or more)
        }
        realNewIdx = potentialRelative.index + 1;
        newParent = potentialRelative.id;
        break;
      } else if (potentialRelative.type == newType) {
        // we found a sibling
        newParent = potentialRelative.parent;
        const { children: siblingChildren } = getAllChildren(
          tasks,
          potentialRelative.id
        );
        realNewIdx = potentialRelative.index + siblingChildren.length + 1;
        break;
      }
    }
  }
  return { realNewIdx, newParent };
}

export function moveTaskLeftHelper(
  task: Task,
  tasks: Task[],
  isNew: boolean
): { bkp: BackupStep; newParentId: string } | undefined {
  const { rollback, rollforward }: BackupStep = {
    rollback: { toChange: [], toAdd: [], toDelete: [] },
    rollforward: { toChange: [], toAdd: [], toDelete: [] },
  };
  let parent: Task | undefined;
  const newType = task.type + 1;
  if (newType > TaskType.MOON) return;

  for (let i = Math.floor(task.index); i >= 0; i--) {
    const potentialParent = tasks[i];
    if (potentialParent === task) continue;
    if (potentialParent.type == newType - 1) {
      parent = potentialParent;
      break;
    }
  }

  if (parent) {
    const morphRes = morph(tasks, task, newType, parent.id, parent.color);
    _addToChangeStack(rollback.toChange, morphRes.rollback);
    _addToChangeStack(rollforward.toChange, morphRes.rollforward);
    return { bkp: { rollback, rollforward }, newParentId: parent.id };
  }
}

export function moveTaskRightHelper(
  task: Task,
  tasks: Task[],
  isNew: boolean
): { bkp: BackupStep; newParentId: string } | undefined {
  const { rollback, rollforward }: BackupStep = {
    rollback: { toChange: [], toAdd: [], toDelete: [] },
    rollforward: { toChange: [], toAdd: [], toDelete: [] },
  };
  const newType = task.type - 1;
  if (newType < TaskType.SECTOR) return;

  const sibling = tasks.find((t) => t.id == task.parent!)!; // previous parent will be a sibling

  const { children: currentTaskChildren } = getAllChildren(tasks, task.id);
  const { children: siblingChildren } = getAllChildren(tasks, sibling.id);
  if (!isNew) {
    // push previous siblings
    for (
      let i = Math.floor(task.index);
      i <= sibling.index + siblingChildren.length;
      i++
    ) {
      const t = tasks[i];
      _addToChangeStack(rollback.toChange, [
        {
          id: t.id,
          changes: { index: t.index },
        },
      ]);
      _addToChangeStack(rollforward.toChange, [
        {
          id: t.id,
          changes: { index: t.index - (currentTaskChildren.length + 1) },
        },
      ]);
    }
  }
  // push current task children
  const newTaskIndex =
    sibling.index + siblingChildren.length - currentTaskChildren.length;
  _addToChangeStack(rollback.toChange, [
    { id: task.id, changes: { index: task.index } },
  ]);
  _addToChangeStack(rollforward.toChange, [
    { id: task.id, changes: { index: newTaskIndex } },
  ]);
  for (let i = 0; i < currentTaskChildren.length; i++) {
    const t = currentTaskChildren[i];
    _addToChangeStack(rollback.toChange, [
      { id: t.id, changes: { index: t.index } },
    ]);
    _addToChangeStack(rollforward.toChange, [
      { id: t.id, changes: { index: newTaskIndex + i + 1 } },
    ]);
  }

  const morphRes = morph(tasks, task, newType, sibling.parent!, task.color);
  _addToChangeStack(rollback.toChange, morphRes.rollback);
  _addToChangeStack(rollforward.toChange, morphRes.rollforward);
  return { bkp: { rollback, rollforward }, newParentId: sibling.parent! };
}

export function moveTaskUpHelper(
  task: Task,
  tasks: Task[],
  isNew: boolean
): { bkp: BackupStep; newParentId: string } | undefined {
  const { rollback, rollforward }: BackupStep = {
    rollback: { toChange: [], toAdd: [], toDelete: [] },
    rollforward: { toChange: [], toAdd: [], toDelete: [] },
  };

  let parent: Task | undefined;
  let sibling: Task | undefined;

  for (let i = Math.floor(task.index); i >= 0; i--) {
    const t = tasks[i];
    if (task === t) continue;
    if (t.type == task.type - 1) {
      // parent
      if (task.parent != t.id) {
        // new valid parent
        parent = t;
        break;
      }
    } else if (t.type == task.type) {
      sibling = t;
      break;
    }
  }
  let newIndex: number;
  let parentId: string;
  if (sibling) {
    newIndex = sibling.index;
    parentId = sibling.parent!;
    if (task.parent !== parentId) {
      // we changed parent, we should be below sibling
      const { children } = getAllChildren(tasks, sibling.id);
      newIndex += children.length + 1;
    }
  } else if (parent) {
    newIndex = parent.index + 1;
    parentId = parent.id;
  } else {
    return;
  }
  const { children } = getAllChildren(tasks, task.id);

  _addToChangeStack(rollback.toChange, [
    { id: task.id, changes: { index: task.index, parent: task.parent } },
  ]);
  _addToChangeStack(rollforward.toChange, [
    { id: task.id, changes: { index: newIndex, parent: parentId } },
  ]);
  // push between
  for (let i = task.index - 1; i >= newIndex; i--) {
    const t = tasks[i];
    _addToChangeStack(rollback.toChange, [
      { id: t.id, changes: { index: t.index } },
    ]);
    _addToChangeStack(rollforward.toChange, [
      { id: t.id, changes: { index: t.index + children.length + 1 } },
    ]);
  }
  for (let i = 0; i < children.length; i++) {
    const t = children[i];
    _addToChangeStack(rollback.toChange, [
      { id: t.id, changes: { index: t.index } },
    ]);
    _addToChangeStack(rollforward.toChange, [
      { id: t.id, changes: { index: newIndex + i + 1 } },
    ]);
  }

  return { bkp: { rollback, rollforward }, newParentId: parentId };
}

export function moveTaskDownHelper(
  task: Task,
  tasks: Task[],
  isNew: boolean
): { bkp: BackupStep; newParentId: string } | undefined {
  const { rollback, rollforward }: BackupStep = {
    rollback: { toChange: [], toAdd: [], toDelete: [] },
    rollforward: { toChange: [], toAdd: [], toDelete: [] },
  };

  let parent: Task | undefined;
  let sibling: Task | undefined;

  for (let i = Math.floor(task.index); i < tasks.length; i++) {
    const t = tasks[i];
    if (task === t) continue;
    if (t.type == task.type - 1) {
      // parent
      parent = t;
      break;
    } else if (t.type == task.type) {
      sibling = t;
      break;
    }
  }
  let newIndex: number;
  let parentId: string;
  if (sibling) {
    const { children } = getAllChildren(tasks, sibling.id);
    newIndex = sibling.index + children.length;
    parentId = sibling.parent!;
  } else if (parent) {
    newIndex = parent.index;
    parentId = parent.id;
  } else {
    return;
  }
  const { children } = getAllChildren(tasks, task.id);

  // bring up between
  for (let i = task.index + children.length + 1; i <= newIndex; i++) {
    const t = tasks[i];
    _addToChangeStack(rollback.toChange, [
      { id: t.id, changes: { index: t.index } },
    ]);
    _addToChangeStack(rollforward.toChange, [
      { id: t.id, changes: { index: t.index - children.length - 1 } },
    ]);
  }

  newIndex = newIndex - children.length;
  _addToChangeStack(rollback.toChange, [
    { id: task.id, changes: { index: task.index, parent: task.parent } },
  ]);
  _addToChangeStack(rollforward.toChange, [
    { id: task.id, changes: { index: newIndex, parent: parentId } },
  ]);
  for (let i = 0; i < children.length; i++) {
    const t = children[i];
    _addToChangeStack(rollback.toChange, [
      { id: t.id, changes: { index: t.index } },
    ]);
    _addToChangeStack(rollforward.toChange, [
      { id: t.id, changes: { index: newIndex + i + 1 } },
    ]);
  }

  return { bkp: { rollback, rollforward }, newParentId: parentId };
}

export function getFocusIdUp(tasks: Task[], currentFocusId: string): string {
  let id: string | undefined;
  if (currentFocusId == "add-task") {
    for (let i = tasks.length - 1; i >= 0; i--) {
      const t = tasks[i];
      if (t.displayed) {
        id = t.id;
        break;
      }
    }
    if (id) {
      return id;
    }
  }
  const idx = tasks.findIndex((t) => t.id == currentFocusId);
  for (let i = idx - 1; i >= 0; i--) {
    const t = tasks[i];
    if (t.displayed) {
      id = t.id;
      break;
    }
  }
  if (!id) {
    id = "add-task";
  }
  return id;
}

export function getFocusIdDown(tasks: Task[], currentFocusId: string): string {
  let id: string | undefined;
  if (currentFocusId == "add-task") {
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      if (t.displayed) {
        id = t.id;
        break;
      }
    }
    if (id) {
      return id;
    }
  }
  const idx = tasks.findIndex((t) => t.id == currentFocusId);
  for (let i = idx + 1; i < tasks.length; i++) {
    const t = tasks[i];
    if (t.displayed) {
      id = t.id;
      break;
    }
  }
  if (!id) {
    id = "add-task";
  }
  return id;
}
