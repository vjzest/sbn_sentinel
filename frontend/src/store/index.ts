import { configureStore } from '@reduxjs/toolkit';
import signalReducer from './slices/signalSlice';

export const store = configureStore({
  reducer: {
    signals: signalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
