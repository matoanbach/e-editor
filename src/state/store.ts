import { configureStore } from "@reduxjs/toolkit";
import counterSlice from "./counter/counterSlice";
import userSlice from "./user/userSlice";
import editorSlice from "./editor/editorSlice";

export const store = configureStore({
  reducer: {
    counterSlice,
    userSlice,
    editorSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
