import { Territory } from "@models/territory";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

// API

// Adapter
const territoriesAdapter = createEntityAdapter<Territory>({
  sortComparer: (a: Territory, b: Territory) => a.id.localeCompare(b.id),
});

// Selector
export const {
  selectAll: selectAllTerritories,
  selectById: selectTerritoryById,
} = territoriesAdapter.getSelectors((state: any) => state.territories);

export const territoriesSlice = createSlice({
  name: "hexes",
  initialState: territoriesAdapter.getInitialState(),
  reducers: {
    updateTerritories: (
      state,
      {
        payload,
      }: {
        payload: Territory[];
      }
    ) => {
      territoriesAdapter.setAll(state, payload);
    },
  },
  extraReducers: (builder) => {},
});

export const { updateTerritories } = territoriesSlice.actions;
export default territoriesSlice.reducer;
