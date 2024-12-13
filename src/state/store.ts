import { configureStore } from "@reduxjs/toolkit";
import counterSlice from "./counter/counterSlice";
import userSlice from "./user/userSlice";

export const store = configureStore({
  reducer: {
    counterSlice,
    userSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
