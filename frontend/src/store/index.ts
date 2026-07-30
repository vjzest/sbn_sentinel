import { configureStore } from '@reduxjs/toolkit';
import signalReducer from './slices/signalSlice';
import workspaceReducer from './slices/workspaceSlice';

export const store = configureStore({
  reducer: {
    signals: signalReducer,
    workspace: workspaceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
