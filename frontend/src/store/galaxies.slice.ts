import { GalaxyDataExport, SaveStatus, deflateGalaxy } from "@models/galaxy";
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { inflateTasks } from "./tasks.slice";
import { RootState } from "./store";
import { toast } from "react-toastify";
import { getAllLocalGalaxies, saveGalaxyLocally } from "@api/local";
import { buildMinimapRepresentation } from "./galaxies.slice.utils";

// API
export const saveCurrentGalaxyLocally = createAsyncThunk(
  "galaxies/saveGalaxyLocally",
  async (_, thunkAPI): Promise<GalaxyDataExport | undefined> => {
    const state = thunkAPI.getState() as RootState;
    const currentGalaxyId = state.galaxies.currentGalaxyId;
    if (!currentGalaxyId) return;
    const currentGalaxy = state.galaxies.entities[currentGalaxyId];
    const tasks = Object.values(state.tasks.entities)
      .filter((t) => t.galaxyId == currentGalaxyId && t.name.length > 0)
      .sort((a, b) => a.index - b.index);
    const galaxyData = deflateGalaxy(currentGalaxy, tasks);
    galaxyData.date = Date.now();
    galaxyData.saveStatus = SaveStatus.NO_COPY;
    await saveGalaxyLocally(galaxyData);
    galaxyData.minimap = buildMinimapRepresentation(galaxyData);
    return galaxyData;
  }
);

export const downloadCurrentGalaxy = createAsyncThunk(
  "galaxies/downloadCurrentGalaxy",
  async (_, thunkAPI): Promise<void> => {
    const state = thunkAPI.getState() as RootState;
    const currentGalaxyId = state.galaxies.currentGalaxyId;
    if (!currentGalaxyId) return;
    const currentGalaxy = state.galaxies.entities[currentGalaxyId];
    const tasks = Object.values(state.tasks.entities)
      .filter((t) => t.galaxyId == currentGalaxyId && t.name.length > 0)
      .sort((a, b) => a.index - b.index);
    const galaxyData = deflateGalaxy(currentGalaxy, tasks);
    const jsonStr = JSON.stringify(galaxyData);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentGalaxy.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
);

export const setCurrentGalaxy = createAsyncThunk(
  "galaxies/setCurrentGalaxy",
  async (id: string, thunkAPI): Promise<string | undefined> => {
    const state = thunkAPI.getState() as RootState;
    const galaxyData = state.galaxies.entities[id];
    if (state.galaxies.currentGalaxyId == id) return;
    if (galaxyData) {
      thunkAPI.dispatch(
        inflateTasks({ data: galaxyData.tasks, galaxyId: galaxyData.id })
      );
      return id;
    } else {
      throw Error("Galaxy not found.");
    }
  }
);

export const addGalaxyAndLoadChildren = createAsyncThunk(
  "galaxies/addGalaxyAndLoadChildren",
  async (data: GalaxyDataExport, thunkAPI) => {
    thunkAPI.dispatch(inflateTasks({ data: data.tasks, galaxyId: data.id }));
    return data;
  }
);

export const addLocalGalaxies = createAsyncThunk(
  "galaxies/addLocalGalaxies",
  async (
    galaxyId: string | undefined,
    thunkAPI
  ): Promise<{
    galaxies: GalaxyDataExport[];
    galaxyId: string | undefined;
  }> => {
    const local = await getAllLocalGalaxies();
    for (const g of local) {
      try {
        g.minimap = buildMinimapRepresentation(g);
      } catch (e) {
        console.error(e);
      }
    }
    if (galaxyId) {
      const exists = local.find((g) => g.id == galaxyId);
      if (exists) {
        thunkAPI.dispatch(
          inflateTasks({ data: exists.tasks, galaxyId: exists.id })
        );
      }
      if (!exists) {
        galaxyId = undefined;
      }
    }
    return { galaxies: local, galaxyId };
  }
);

// Adapter
const galaxiesAdapter = createEntityAdapter<GalaxyDataExport>({});

// Selectors
export const { selectAll: selectAllGalaxies, selectById: selectGalaxyById } =
  galaxiesAdapter.getSelectors((state: any) => state.galaxies);

export const selectCurrentGalaxy = createSelector(
  [selectAllGalaxies, (state) => state.galaxies.currentGalaxyId],
  (galaxies: GalaxyDataExport[], currentGalaxyId?: string) => {
    return galaxies.find((g) => g.id == currentGalaxyId);
  }
);

export const selectCurrentGalaxySaveStatus = createSelector(
  [selectAllGalaxies, (state) => state.galaxies.currentGalaxyId],
  (galaxies: GalaxyDataExport[], currentGalaxyId?: string) => {
    return galaxies.find((g) => g.id == currentGalaxyId)?.saveStatus;
  }
);

export const selectAllGalaxiesIds = createSelector(
  [selectAllGalaxies],
  (galaxies: GalaxyDataExport[]) => {
    return galaxies.map((g) => g.id);
  }
);

// Slice
type ExtraState = {
  currentGalaxyId?: string;
};
export const galaxiesSlice = createSlice({
  name: "galaxies",
  initialState: galaxiesAdapter.getInitialState<ExtraState>({}),
  reducers: {
    addGalaxies: (state, { payload }: { payload: GalaxyDataExport[] }) => {
      galaxiesAdapter.upsertMany(state, payload);
    },
    setCurrentGalaxySaveStatus: (
      state,
      { payload }: { payload: SaveStatus }
    ) => {
      const id = state.currentGalaxyId;
      if (id) {
        galaxiesAdapter.updateOne(state, {
          id,
          changes: { saveStatus: payload },
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addLocalGalaxies.fulfilled, (state, action) => {
      galaxiesAdapter.upsertMany(state, action.payload.galaxies);
      if (action.payload.galaxyId) {
        state.currentGalaxyId = action.payload.galaxyId;
      }
    });
    builder.addCase(addGalaxyAndLoadChildren.fulfilled, (state, action) => {
      galaxiesAdapter.upsertOne(state, action.payload);
      state.currentGalaxyId = action.payload.id;
    });
    builder.addCase(setCurrentGalaxy.fulfilled, (state, action) => {
      if (action.payload) {
        state.currentGalaxyId = action.payload;
      }
    });
    builder.addCase(setCurrentGalaxy.rejected, (state, action) => {
      toast.error(`Galaxy not found`);
    });
    builder.addCase(saveCurrentGalaxyLocally.fulfilled, (state, action) => {
      if (action.payload) {
        galaxiesAdapter.upsertOne(state, action.payload);
      }
    });
  },
});

export const { setCurrentGalaxySaveStatus, addGalaxies } =
  galaxiesSlice.actions;
export default galaxiesSlice.reducer;
