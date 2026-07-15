import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SignalEvent {
  id: string;
  source: string;
  type: string;
  message: string;
  timestamp: string;
  metadata?: any;
  ai_insight?: string;
  recommended_action?: string;
  priority?: string;
}

interface SignalState {
  events: SignalEvent[];
  isConnected: boolean;
  stats: {
    activeSignals: number;
    patientFlow: number;
    criticalEvents: number;
    actionsTaken: number;
  };
}

const initialState: SignalState = {
  events: [],
  isConnected: false,
  stats: {
    activeSignals: 0,
    patientFlow: 0,
    criticalEvents: 0,
    actionsTaken: 0,
  }
};

const signalSlice = createSlice({
  name: 'signals',
  initialState,
  reducers: {
    addSignal(state, action: PayloadAction<SignalEvent>) {
      const signal = action.payload;
      state.events.unshift(signal);
      if (state.events.length > 50) {
        state.events.pop(); // Keep only last 50
      }
      
      // Update stats based on incoming signal
      state.stats.activeSignals += 1;
      
      if (signal.type === 'EHR' || signal.type === 'Patient') {
        state.stats.patientFlow += 1;
      }
      
      if (signal.ai_insight && signal.ai_insight.toLowerCase().includes('loss')) {
        state.stats.criticalEvents += 1;
      }
    },
    setConnectionStatus(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
    },
    incrementActionsTaken(state) {
      state.stats.actionsTaken += 1;
    },
    removeSignal(state, action: PayloadAction<string>) {
      state.events = state.events.filter(e => e.id !== action.payload);
    }
  }
});

export const { addSignal, setConnectionStatus, incrementActionsTaken, removeSignal } = signalSlice.actions;
export default signalSlice.reducer;
