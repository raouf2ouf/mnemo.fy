"use client";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import tasksSlice from "./tasks.slice";
import galaxiesSlice from "./galaxies.slice";
import backupSlice from "./backup.slice";
import hexesSlice from "./hexes.slice";
import territoriesSlice from "./territories.slice";

const rootReducer = combineReducers({
  galaxies: galaxiesSlice,
  tasks: tasksSlice,
  backup: backupSlice,
  hexes: hexesSlice,
  territories: territoriesSlice,
});

export const setupStore = (preloadedState?: any) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    devTools: process.env.NODE_ENV !== "production",
  });
};
export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
