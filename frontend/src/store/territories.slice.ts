import { HEX_SIZE, Hex } from "@models/hex";
import { buildSpaceFlatHexes } from "@models/hex.utils";
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";

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
  },
  extraReducers: (builder) => {
    builder.addCase(loadHexes.fulfilled, (state, action) => {
      state.starts = action.payload.starts;
      state.nbrRows = action.payload.nbrRows;
      state.nbrCols = action.payload.nbrCols;
      hexesAdapter.setAll(state, action.payload.hexes);
    });
  },
});

export const { setHexesData } = hexesSlice.actions;
export default hexesSlice.reducer;
