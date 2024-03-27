import { BackupStep } from "@models/backup";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { updateTasks } from "./tasks.slice";
import { addToChangeStack } from "./backup.slice.utils";
import { setCurrentGalaxySaveStatus } from "./galaxies.slice";
import { SaveStatus } from "@models/galaxy";

const MAX_BKP_LENGTH = 9;

// API
export const rollback = createAsyncThunk(
  "backup/rollback",
  async (
    _,
    thunkAPI
  ): Promise<{ bkps: BackupStep[]; bkpsForward: BackupStep[] } | undefined> => {
    const backup = (thunkAPI.getState() as RootState).backup;
    const bkps = [...backup.bkps];
    const bkpsForward = [...backup.bkpsForward];

    if (bkps.length == 0) return;

    const step = bkps.pop()!;
    bkpsForward.push(step);

    thunkAPI.dispatch(updateTasks(step.rollback));
    thunkAPI.dispatch(setCurrentGalaxySaveStatus(SaveStatus.NEED_TO_SAVE));

    return { bkps, bkpsForward };
  }
);

export const rollforward = createAsyncThunk(
  "backup/rollforward",
  async (
    _,
    thunkAPI
  ): Promise<{ bkps: BackupStep[]; bkpsForward: BackupStep[] } | undefined> => {
    const backup = (thunkAPI.getState() as RootState).backup;
    const bkps = [...backup.bkps];
    const bkpsForward = [...backup.bkpsForward];

    if (bkpsForward.length == 0) return;

    const step = bkpsForward.pop()!;
    bkps.push(step);

    thunkAPI.dispatch(updateTasks(step.rollforward));
    thunkAPI.dispatch(setCurrentGalaxySaveStatus(SaveStatus.NEED_TO_SAVE));

    return { bkps, bkpsForward };
  }
);

export const backup = createAsyncThunk(
  "backup/backup",
  async (bkp: BackupStep, thunkAPI): Promise<BackupStep> => {
    thunkAPI.dispatch(setCurrentGalaxySaveStatus(SaveStatus.NEED_TO_SAVE));
    return bkp;
  }
);

// Slice
type ExtraState = {
  bkps: BackupStep[];
  bkpsForward: BackupStep[];
};
export const backupSlice = createSlice({
  name: "backup",
  initialState: {
    bkps: [],
    bkpsForward: [],
  } as ExtraState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(rollback.fulfilled, (state, action) => {
      if (action.payload) {
        state.bkps = action.payload.bkps;
        state.bkpsForward = action.payload.bkpsForward;
      }
    });
    builder.addCase(rollforward.fulfilled, (state, action) => {
      if (action.payload) {
        state.bkps = action.payload.bkps;
        state.bkpsForward = action.payload.bkpsForward;
      }
    });
    builder.addCase(
      backup.fulfilled,
      (state, { payload }: { payload: BackupStep }) => {
        const bkps = [...state.bkps];
        if (state.bkps.length >= MAX_BKP_LENGTH) {
          bkps.shift();
        }
        bkps.push(payload);
        state.bkps = bkps;
        state.bkpsForward = [];
      }
    );
  },
});

export const {} = backupSlice.actions;
export default backupSlice.reducer;
