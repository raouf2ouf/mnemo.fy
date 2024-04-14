import { HEX_SIZE, Hex } from "@models/hex";
import { buildSpaceFlatHexes } from "@models/hex.utils";
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { RootState } from "./store";
import { TaskType } from "@models/task/task.enums";
import { proposeSystemPosition } from "./hexes.slice.utils";
import { BackupStep, HexChange } from "@models/backup";
import { System } from "@models/task/system";
import { _addToChangeStack } from "./backup.slice.utils";
import { updateTasks } from "./tasks.slice";
import { backup } from "./backup.slice";

// API
export const loadHexes = createAsyncThunk(
  "hexes/loadHexes",
  async (): Promise<{
    hexes: Hex[];
    starts: number[];
    nbrRows: number;
    nbrCols: number;
  }> => {
    const nbrRows = 10;
    const nbrCols = 13;
    const { hexes, starts } = buildSpaceFlatHexes(HEX_SIZE, nbrRows, nbrCols);
    return { hexes, starts, nbrRows, nbrCols };
  }
);

export const refreshPositions = createAsyncThunk(
  "hexes/refreshPositions",
  async (_, thunkAPI): Promise<HexChange[]> => {
    console.log("refreshing positions");
    const state = thunkAPI.getState() as RootState;
    const { nbrRows, nbrCols, starts } = state.hexes;
    const hexes = Object.values(state.hexes.entities).map((hex) => {
      return { ...hex };
    });
    const systems = Object.values(state.tasks.entities)
      .filter((t) => t.type == TaskType.SYSTEM)
      .map((t) => {
        return { ...t };
      }) as System[];

    const bkp: BackupStep = {
      rollback: { tasksChange: [], hexesChange: [] },
      rollforward: { tasksChange: [], hexesChange: [] },
    };

    for (const system of systems) {
      // backup system data
      _addToChangeStack(bkp.rollback.tasksChange!, [
        { id: system.id, changes: { hex: system.hex } },
      ]);
      if (system.hex !== undefined) {
        if (!system.pinned) {
          const hex = hexes[system.hex];
          // clear hex
          _addToChangeStack(bkp.rollback.hexesChange!, [
            { id: hex.id, changes: { sectorId: hex.sectorId } },
          ]);
          hex.sectorId = undefined;
          _addToChangeStack(bkp.rollforward.hexesChange!, [
            { id: hex.id, changes: { sectorId: hex.sectorId } },
          ]);
          system.hex = undefined;
        }
      }
    }

    for (const system of systems) {
      if (!system.pinned) {
        const hexId = proposeSystemPosition(
          systems,
          system,
          hexes,
          starts,
          nbrRows,
          nbrCols
        );
        console.log("first system proposed", hexId);
        const hex = hexes[hexId];
        hex.sectorId = system.parent;
        _addToChangeStack(bkp.rollforward.tasksChange!, [
          { id: system.id, changes: { hex: hexId } },
        ]);
        _addToChangeStack(bkp.rollforward.hexesChange!, [
          { id: hex.id, changes: { sectorId: hex.sectorId } },
        ]);
        system.hex = hexId;
      }
    }

    console.log(bkp);

    thunkAPI.dispatch(backup(bkp));
    thunkAPI.dispatch(updateTasks(bkp.rollforward));
    return bkp.rollforward.hexesChange!;
  }
);
// Adapter
const hexesAdapter = createEntityAdapter<Hex>({
  sortComparer: (a: Hex, b: Hex) => a.id - b.id,
});

// Selector
export const { selectAll: selectAllHexes, selectById: selectHexById } =
  hexesAdapter.getSelectors((state: any) => state.hexes);

type ExtraState = {
  starts: number[];
  nbrRows: number;
  nbrCols: number;
};

export const hexesSlice = createSlice({
  name: "hexes",
  initialState: hexesAdapter.getInitialState<ExtraState>({
    starts: [],
    nbrRows: 0,
    nbrCols: 0,
  }),
  reducers: {
    setHexesData: (
      state,
      {
        payload,
      }: {
        payload: {
          hexes: Hex[];
          starts: number[];
          nbrRows: number;
          nbrCols: number;
        };
      }
    ) => {
      state.starts = payload.starts;
      state.nbrRows = payload.nbrRows;
      state.nbrCols = payload.nbrCols;
      hexesAdapter.setAll(state, payload.hexes);
    },
    updateHexes: (state, { payload }: { payload: HexChange[] | undefined }) => {
      if (payload) {
        hexesAdapter.updateMany(state, payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadHexes.fulfilled, (state, action) => {
      state.starts = action.payload.starts;
      state.nbrRows = action.payload.nbrRows;
      state.nbrCols = action.payload.nbrCols;
      hexesAdapter.setAll(state, action.payload.hexes);
    });
    builder.addCase(refreshPositions.fulfilled, (state, action) => {
      hexesAdapter.updateMany(state, action.payload);
    });
  },
});

export const { setHexesData, updateHexes } = hexesSlice.actions;
export default hexesSlice.reducer;