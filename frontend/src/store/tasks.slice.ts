import { v4 as uuid } from "uuid";
import { Sector, SectorDataExport } from "@models/task/sector";
import { Task } from "@models/task/task";
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import {
  getAllChildren,
  getFocusIdDown,
  getFocusIdUp,
  inflateSectorsAndChildren,
  morphTask,
  moveTaskDownHelper,
  moveTaskLeftHelper,
  moveTaskRightHelper,
  moveTaskUpHelper,
  propagateChecked,
} from "./tasks.slice.utils";
import { RootState } from "./store";
import { backup } from "./backup.slice";
import { BackupAction, BackupStep, TaskChange } from "@models/backup";
import { TaskColor, TaskType } from "@models/task/task.enums";
import { toast } from "react-toastify";
import { _addToChangeStack, applyTaskChanges } from "./backup.slice.utils";
import { setHexesData, updateHexes } from "./hexes.slice";
import {
  computeHexesControl,
  proposeSystemPosition,
} from "./hexes.slice.utils";
import { buildSpaceFlatHexes } from "@models/hex.utils";
import { HEX_SIZE, NBR_COLS, NBR_ROWS } from "@models/hex";
import { buildTerritories } from "./territories.slice.utils";
import { updateTerritories } from "./territories.slice";

// API
export const addTask = createAsyncThunk(
  "tasks/addTask",
  async (
    {
      index,
      type,
      parentId,
    }: { index?: number; type: TaskType; parentId: string },
    thunkAPI
  ): Promise<Task> => {
    type = type > TaskType.MOON ? TaskType.MOON : type;
    const state = thunkAPI.getState() as RootState;
    const parent = state.tasks.entities[parentId];
    const currentGalaxyId = state.galaxies.currentGalaxyId!;
    const nbrTasks = Object.values(state.tasks.entities).filter(
      (t) => t.galaxyId == currentGalaxyId
    ).length;
    const task: Task = {
      galaxyId: currentGalaxyId,
      id: uuid(),
      name: "",
      description: "",
      index: index === undefined ? nbrTasks - 0.5 : index,
      type,
      parent: parentId,
      color: parent?.color || TaskColor.VIOLET,
      checked: false,
      closed: false,
      priority: 0,
      encrypted: false,
      labels: [],
      comments: [],
      content: "",
      displayed: true,
    };

    if (parent && parent.closed) {
      // open parent if closed
      thunkAPI.dispatch(toggleTask({ taskId: parentId, toggle: false }));
    }

    return task;
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (taskId: string, thunkAPI): Promise<BackupAction> => {
    const bkp: BackupStep = {
      rollback: { tasksChange: [], tasksAdd: [], tasksDelete: [] },
      rollforward: { tasksChange: [], tasksAdd: [], tasksDelete: [] },
    };

    const state = thunkAPI.getState() as RootState;
    const task = state.tasks.entities[taskId]!;
    if (task) {
      bkp.rollback.tasksAdd!.push(JSON.parse(JSON.stringify(task)));
      bkp.rollforward.tasksDelete!.push(task.id);
      const tasks = Object.values(state.tasks.entities);
      const { children } = getAllChildren(tasks, taskId);
      for (const child of children) {
        const childData = JSON.parse(JSON.stringify(child));
        bkp.rollback.tasksAdd!.push(childData);
        bkp.rollforward.tasksDelete!.push(child.id);
      }
      const delta = children.length + 1;
      for (let i = task.index + children.length; i < tasks.length; i++) {
        const t = tasks[i];
        _addToChangeStack(bkp.rollback.tasksChange!, [
          { id: t.id, changes: { index: t.index } },
        ]);
        _addToChangeStack(bkp.rollforward.tasksChange!, [
          { id: t.id, changes: { index: t.index - delta } },
        ]);
      }
      thunkAPI.dispatch(backup(bkp));
    }
    return bkp.rollforward;
  }
);

export const inflateTasks = createAsyncThunk(
  "tasks/inflateTasks",
  async (
    {
      data,
      galaxyId,
    }: {
      data: SectorDataExport[];
      galaxyId: string;
    },
    thunkAPI
  ) => {
    const nbrRows = NBR_ROWS;
    const nbrCols = NBR_COLS;
    const { hexes, starts } = buildSpaceFlatHexes(HEX_SIZE, nbrRows, nbrCols);
    const tasks = inflateSectorsAndChildren(galaxyId, data);
    let idx = 0;
    for (const task of tasks) {
      task.index = idx;
      idx++;
      if (task.type == TaskType.SYSTEM) {
        if (task.hex === undefined) {
          // need hex
          task.hex = proposeSystemPosition(
            tasks,
            task,
            hexes,
            starts,
            nbrRows,
            nbrCols
          );
        }
        const hex = hexes[task.hex];
        hex.sectorId = task.parent;
      }
    }

    computeHexesControl(hexes, tasks);
    const territories = buildTerritories(
      tasks.filter((t) => t.type == TaskType.SECTOR) as Sector[],
      hexes,
      nbrRows,
      nbrCols
    );
    thunkAPI.dispatch(
      setHexesData({ hexes, starts, nbrRows: NBR_ROWS, nbrCols: NBR_COLS })
    );
    thunkAPI.dispatch(updateTerritories(territories));
    return tasks;
  }
);

export const toggleChecked = createAsyncThunk(
  "tasks/toggleChecked",
  async (
    { taskId, toggle }: { taskId: string; toggle?: boolean },
    thunkAPI
  ): Promise<TaskChange[] | undefined> => {
    const state = thunkAPI.getState() as RootState;
    const data = propagateChecked(state.tasks.entities, taskId, toggle);
    if (!data) return;
    const bkp: BackupStep = {
      rollback: { tasksChange: data.rollback },
      rollforward: { tasksChange: data.rollforward },
    };
    const tasks = applyTaskChanges(
      Object.values(state.tasks.entities),
      data.rollforward,
      [],
      []
    );
    const hexes = Object.values(state.hexes.entities).map((hex) => {
      return { ...hex };
    });
    const { nbrRows, nbrCols } = state.hexes;
    const { rollbackHexes, rollforwardHexes } = computeHexesControl(
      hexes,
      tasks
    );
    bkp.rollback.hexesChange = rollbackHexes;
    bkp.rollforward.hexesChange = rollforwardHexes;

    const newTerritories = buildTerritories(
      tasks.filter((t) => t.type == TaskType.SECTOR) as Sector[],
      hexes,
      nbrRows,
      nbrCols
    );
    bkp.rollback.territories = Object.values(state.territories.entities).map(
      (t) => {
        return { ...t };
      }
    );
    bkp.rollforward.territories = newTerritories;

    thunkAPI.dispatch(updateHexes(bkp.rollforward.hexesChange));
    thunkAPI.dispatch(updateTerritories(bkp.rollforward.territories));
    thunkAPI.dispatch(backup(bkp));

    return bkp.rollforward.tasksChange;
  }
);

export const moveTask = createAsyncThunk(
  "tasks/moveTask",
  async (
    {
      taskId,
      newType,
      previousDisplayIdx,
      newDisplayIdx,
    }: {
      taskId: string;
      newType: TaskType;
      previousDisplayIdx: number;
      newDisplayIdx: number;
    },
    thunkAPI
  ): Promise<TaskChange[] | undefined> => {
    const entities = (thunkAPI.getState() as RootState).tasks.entities;
    const task = entities[taskId];
    if (!task) return;
    const tasks = Object.values(entities);
    const bkpStep = morphTask(
      tasks,
      task,
      newType,
      previousDisplayIdx,
      newDisplayIdx
    );

    if (bkpStep) {
      thunkAPI.dispatch(backup(bkpStep));
      toast.success("Task moved successfully!");
    } else {
      toast.error("Not a valid move: No possible parent.");
    }
    return bkpStep?.rollforward.tasksChange;
  }
);

export const moveTaskLeft = createAsyncThunk(
  "tasks/moveTaskLeft",
  async (taskId: string, thunkAPI): Promise<TaskChange[] | undefined> => {
    const state = thunkAPI.getState() as RootState;
    const task = state.tasks.entities[taskId]!;
    const tasks = Object.values(state.tasks.entities).sort(
      (a, b) => a.index - b.index
    );
    const res = moveTaskLeftHelper(task, tasks, state.tasks.newId == task.id);
    if (res) {
      thunkAPI.dispatch(backup(res.bkp));
      const parent = state.tasks.entities[res.newParentId];
      if (parent && parent.closed) {
        thunkAPI.dispatch(toggleTask({ taskId: parent.id, toggle: false }));
      }
      return res.bkp.rollforward.tasksChange;
    } else {
      toast.error("No possible parent when moving this task left");
    }
  }
);

export const moveTaskRight = createAsyncThunk(
  "tasks/moveTaskRight",
  async (taskId: string, thunkAPI): Promise<TaskChange[] | undefined> => {
    const state = thunkAPI.getState() as RootState;
    const task = state.tasks.entities[taskId]!;
    const tasks = Object.values(state.tasks.entities).sort(
      (a, b) => a.index - b.index
    );
    const res = moveTaskRightHelper(task, tasks, state.tasks.newId == task.id);
    if (res) {
      thunkAPI.dispatch(backup(res.bkp));
      const parent = state.tasks.entities[res.newParentId];
      if (parent && parent.closed) {
        thunkAPI.dispatch(toggleTask({ taskId: parent.id, toggle: false }));
      }
      return res.bkp.rollforward.tasksChange;
    } else {
      toast.error("No possible parent when moving this task right");
    }
  }
);

export const moveTaskUp = createAsyncThunk(
  "tasks/moveTaskUp",
  async (taskId: string, thunkAPI): Promise<TaskChange[] | undefined> => {
    const state = thunkAPI.getState() as RootState;
    const task = state.tasks.entities[taskId]!;
    const tasks = Object.values(state.tasks.entities).sort(
      (a, b) => a.index - b.index
    );
    const res = moveTaskUpHelper(task, tasks, state.tasks.newId == task.id);
    if (res) {
      thunkAPI.dispatch(backup(res.bkp));
      const parent = state.tasks.entities[res.newParentId];
      if (parent && parent.closed) {
        thunkAPI.dispatch(toggleTask({ taskId: parent.id, toggle: false }));
      }
      return res.bkp.rollforward.tasksChange;
    } else {
      toast.error("No possible parent when moving this task up");
    }
  }
);

export const moveTaskDown = createAsyncThunk(
  "tasks/moveTaskDown",
  async (taskId: string, thunkAPI): Promise<TaskChange[] | undefined> => {
    const state = thunkAPI.getState() as RootState;
    const task = state.tasks.entities[taskId]!;
    const tasks = Object.values(state.tasks.entities).sort(
      (a, b) => a.index - b.index
    );
    const res = moveTaskDownHelper(task, tasks, state.tasks.newId == task.id);
    if (res) {
      thunkAPI.dispatch(backup(res.bkp));
      const parent = state.tasks.entities[res.newParentId];
      if (parent && parent.closed) {
        thunkAPI.dispatch(toggleTask({ taskId: parent.id, toggle: false }));
      }
      return res.bkp.rollforward.tasksChange;
    } else {
      toast.error("No possible parent when moving this task down");
    }
  }
);

export const updateAndBackupTask = createAsyncThunk(
  "tasks/updateTask",
  async (
    {
      rollforward,
      rollback,
    }: { rollforward: TaskChange; rollback: TaskChange },
    thunkAPI
  ): Promise<BackupAction> => {
    const bkp: BackupStep = {
      rollforward: { tasksChange: [], tasksAdd: [], tasksDelete: [] },
      rollback: { tasksChange: [], tasksAdd: [], tasksDelete: [] },
    };
    const state = thunkAPI.getState() as RootState;
    const task = state.tasks.entities[rollforward.id]!;
    const tasks = Object.values(state.tasks.entities);
    if (state.tasks.newId == task.id) {
      bkp.rollback.tasksDelete!.push(task.id);
      const taskData = JSON.parse(JSON.stringify(task));
      Object.assign(taskData, rollforward.changes);
      const newTaskIndex = task.index < 0 ? 0 : Math.round(task.index);
      taskData.index = newTaskIndex;
      bkp.rollforward.tasksAdd!.push(taskData);
      for (const t of tasks) {
        if (t.index >= newTaskIndex) {
          _addToChangeStack(bkp.rollback.tasksChange!, [
            { id: t.id, changes: { index: t.index } },
          ]);
          _addToChangeStack(bkp.rollforward.tasksChange!, [
            { id: t.id, changes: { index: t.index + 1 } },
          ]);
        }
      }
      if (!task.checked) {
        const changes = propagateChecked(state.tasks.entities, task.id, false);
        if (changes) {
          _addToChangeStack(bkp.rollback.tasksChange!, changes.rollback);
          _addToChangeStack(bkp.rollforward.tasksChange!, changes.rollforward);
        }
      }
      // thunkAPI.dispatch(setNewId(undefined));
      setTimeout(() => {
        thunkAPI.dispatch(
          addTask({
            index: newTaskIndex + 0.5,
            type: taskData.type,
            parentId: taskData.parent!,
          })
        );
      }, 100);
    } else {
      bkp.rollforward.tasksChange!.push(rollforward);
      bkp.rollback.tasksChange!.push(rollback);
    }
    if (task.type == TaskType.SECTOR && rollforward.changes.color) {
      const tasks = Object.values(state.tasks.entities);
      const { children } = getAllChildren(tasks, rollforward.id);
      for (const child of children) {
        _addToChangeStack(bkp.rollback.tasksChange!, [
          { id: child.id, changes: { color: child.color } },
        ]);
        _addToChangeStack(bkp.rollforward.tasksChange!, [
          { id: child.id, changes: { color: rollforward.changes.color } },
        ]);
      }
    }

    thunkAPI.dispatch(backup(bkp));

    return bkp.rollforward;
  }
);

// Adapter
const tasksAdapter = createEntityAdapter<Task>({
  sortComparer: (a: Task, b: Task) => a.index - b.index,
});

// Selectors
export const { selectAll: selectAllTasks, selectById: selectTaskById } =
  tasksAdapter.getSelectors((state: any) => state.tasks);

export const selectAllCurrentGalaxyTasks = createSelector(
  [selectAllTasks, (state) => state.galaxies.currentGalaxyId],
  (tasks: Task[], currentGalaxyId: string): Task[] => {
    return tasks.filter((t) => t.galaxyId == currentGalaxyId);
  }
);
export const selectAllCurrentGalaxyTasksIds = createSelector(
  [selectAllCurrentGalaxyTasks],
  (tasks: Task[]): string[] => {
    return tasks.map((t) => t.id);
  }
);

export const selectAllCurrentGalaxyTasksLength = createSelector(
  [selectAllCurrentGalaxyTasks],
  (tasks: Task[]): number => {
    return tasks.length;
  }
);

export const selectAllCurrentGalaxySystemsIds = createSelector(
  [selectAllCurrentGalaxyTasks],
  (tasks: Task[]) => {
    return tasks.filter((t) => t.type == TaskType.SYSTEM).map((t) => t.id);
  }
);

export const selectStatsOfCurrentGalaxy = createSelector(
  [selectAllCurrentGalaxyTasks],
  (tasks: Task[]): number[] => {
    const stats: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
    for (const task of tasks) {
      stats[task.type * 2] += 1;
      if (task.checked) {
        stats[task.type * 2 + 1] += 1;
      }
    }
    return stats;
  }
);

export const selectDirectChildrenOfTask = createSelector(
  [selectAllTasks, (state, taskId: string) => taskId],
  (tasks: Task[], taskId: string) => {
    return tasks.filter((t) => t.parent == taskId);
  }
);

export const selectStatsOfTask = createSelector(
  [(state, taskId: string) => selectDirectChildrenOfTask(state, taskId)],
  (tasks: Task[]) => {
    const stats: number[] = [0, 0];
    for (const task of tasks) {
      stats[0]++;
      if (task.checked) {
        stats[1]++;
      }
    }
    return stats;
  }
);

// Slice
type ExtraState = {
  edit?: string;
  newId?: string;
  focusId: string;
};
export const tasksSlice = createSlice({
  name: "tasks",
  initialState: tasksAdapter.getInitialState<ExtraState>({
    focusId: "add-task",
  }),
  reducers: {
    setFocusIndexUp: (state) => {
      const tasks = Object.values(state.entities).sort(
        (a, b) => a.index - b.index
      );
      state.focusId = getFocusIdUp(tasks, state.focusId);
    },
    setFocusIndexDown: (state) => {
      const tasks = Object.values(state.entities).sort(
        (a, b) => a.index - b.index
      );
      state.focusId = getFocusIdDown(tasks, state.focusId);
    },
    setFocusIndex: (state, { payload }: { payload: string }) => {
      state.focusId = payload;
    },
    setNewId: (state, { payload }: { payload: string | undefined }) => {
      state.newId = payload;
    },
    toggleTask: (
      state,
      { payload }: { payload: { taskId: string; toggle?: boolean } }
    ) => {
      const task = state.entities[payload.taskId]!;
      if (!task) return;
      task.closed =
        payload.toggle === undefined ? !task.closed : payload.toggle;
      const tasks = Object.values(state.entities);
      const toCheck: Task[] = tasks.filter((t) => t.parent == task.id);
      const children: Task[] = [];
      while (toCheck.length > 0) {
        const child = toCheck.pop()!;
        const parent = state.entities[child.parent!]!;
        child.displayed = !parent.closed && parent.displayed;
        children.push(child);
        tasks
          .filter((t) => t.parent == child.id)
          .map((t) => {
            toCheck.push(t);
          });
      }
      tasksAdapter.upsertMany(state, [task, ...children]);
    },
    updateTasks: (state, { payload }: { payload: BackupAction }) => {
      if (payload.tasksAdd) tasksAdapter.upsertMany(state, payload.tasksAdd);
      if (payload.tasksDelete)
        tasksAdapter.removeMany(state, payload.tasksDelete);
      if (payload.tasksChange)
        tasksAdapter.updateMany(state, payload.tasksChange);
    },
    setEdit: (state, { payload }: { payload: string | undefined }) => {
      state.edit = payload;
      if (state.newId && state.newId !== payload) {
        const newTask = state.entities[state.newId];
        if (newTask && newTask.name.length == 0) {
          tasksAdapter.removeOne(state, newTask.id);
        }
        state.newId = undefined;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(inflateTasks.fulfilled, (state, action) => {
      tasksAdapter.setAll(state, action.payload);
      state.focusId =
        action.payload.length > 0 ? action.payload[0].id : "add-task";
    });
    builder.addCase(toggleChecked.fulfilled, (state, action) => {
      if (action.payload) {
        tasksAdapter.updateMany(state, action.payload);
      }
    });
    builder.addCase(moveTask.fulfilled, (state, action) => {
      if (action.payload) {
        tasksAdapter.updateMany(state, action.payload);
      }
    });
    builder.addCase(moveTaskLeft.fulfilled, (state, action) => {
      if (action.payload) {
        tasksAdapter.updateMany(state, action.payload);
      }
    });
    builder.addCase(moveTaskRight.fulfilled, (state, action) => {
      if (action.payload) {
        tasksAdapter.updateMany(state, action.payload);
      }
    });
    builder.addCase(moveTaskUp.fulfilled, (state, action) => {
      if (action.payload) {
        tasksAdapter.updateMany(state, action.payload);
      }
    });
    builder.addCase(moveTaskDown.fulfilled, (state, action) => {
      if (action.payload) {
        tasksAdapter.updateMany(state, action.payload);
      }
    });

    builder.addCase(
      updateAndBackupTask.fulfilled,
      (state, { payload }: { payload: BackupAction }) => {
        if (payload.tasksAdd) tasksAdapter.upsertMany(state, payload.tasksAdd);
        if (payload.tasksDelete)
          tasksAdapter.removeMany(state, payload.tasksDelete);
        if (payload.tasksChange)
          tasksAdapter.updateMany(state, payload.tasksChange);
      }
    );
    builder.addCase(addTask.fulfilled, (state, action) => {
      const task = action.payload;
      if (state.newId && state.newId !== task.id) {
        const newTask = state.entities[state.newId];
        if (newTask && newTask.name.length == 0) {
          tasksAdapter.removeOne(state, newTask.id);
        }
      }
      tasksAdapter.addOne(state, task);
      state.newId = task.id;
      state.edit = task.id;
      state.focusId = task.id;
    });
    builder.addCase(
      deleteTask.fulfilled,
      (state, { payload }: { payload: BackupAction }) => {
        if (payload.tasksDelete)
          tasksAdapter.removeMany(state, payload.tasksDelete);
        if (payload.tasksChange)
          tasksAdapter.updateMany(state, payload.tasksChange);
      }
    );
  },
});

export const {
  toggleTask,
  updateTasks,
  setEdit,
  setNewId,
  setFocusIndex,
  setFocusIndexDown,
  setFocusIndexUp,
} = tasksSlice.actions;
export default tasksSlice.reducer;
