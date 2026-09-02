import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

export interface SignalEvent {
  id: string;
  source: string;
  type: string;
  message: string;
  timestamp: string;
  metadata?: any;
  risk_level?: string;
  problem?: string;
  reason?: string;
  business_impact?: string;
  recommended_action?: string;
  expected_outcome?: string;
  explainability_log?: string;
  priority_score?: number;
  primary_context?: string;
  secondary_context?: string;
  context_reason?: string;
  revenue_risk_category?: string;
  estimated_financial_exposure?: string;
  operational_dependency?: string;
  ai_insight?: string;
  status?: 'active' | 'acknowledged' | 'expired' | 'superseded';
  correlation_id?: string;
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

const defaultInitialSignals: SignalEvent[] = [];

const initialState: SignalState = {
  events: defaultInitialSignals,
  isConnected: false,
  stats: {
    activeSignals: 0,
    patientFlow: 0,
    criticalEvents: 0,
    actionsTaken: 0,
  }
};

import { fetchWithAuth } from '@/utils/fetchWithAuth';

export const fetchHistoricalSignals = createAsyncThunk(
  'signals/fetchHistoricalSignals',
  async () => {
    try {
      const response = await fetchWithAuth('http://localhost:8000/api/v1/signals');
      if (!response.ok) {
        throw new Error('Failed to fetch signals');
      }
      const data = await response.json();
      return data as SignalEvent[];
    } catch (error) {
      console.error("Error fetching signals:", error);
      throw error;
    }
  }
);

const signalSlice = createSlice({
  name: 'signals',
  initialState,
  reducers: {
    addSignal(state, action: PayloadAction<SignalEvent>) {
      const signal = action.payload;
      // Prevent duplicates
      if (!state.events.find(e => e.id === signal.id)) {
        state.events.unshift(signal);
        if (state.events.length > 50) {
          state.events.pop(); // Keep only last 50
        }
        
        // Update stats based on incoming signal
        state.stats.activeSignals += 1;
        
        if (signal.type === 'EHR' || signal.type === 'Patient') {
          state.stats.patientFlow += 1;
        }
        
        if (signal.risk_level === 'Critical' || signal.risk_level === 'High') {
          state.stats.criticalEvents += 1;
        }
      }
    },
    setConnectionStatus(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
    },
    acknowledgeSignal: (state, action: PayloadAction<string>) => {
      const signal = state.events.find(s => s.id === action.payload);
      if (signal) {
        signal.status = 'acknowledged';
      }
    },
    incrementActionsTaken(state) {
      state.stats.actionsTaken += 1;
    },
    removeSignal(state, action: PayloadAction<string>) {
      state.events = state.events.filter(e => e.id !== action.payload);
      state.stats.activeSignals = Math.max(0, state.stats.activeSignals - 1);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchHistoricalSignals.fulfilled, (state, action) => {
      if (action.payload && action.payload.length > 0) {
        state.events = [...action.payload];
        
        // Recalculate stats
        state.stats.activeSignals = state.events.length;
        state.stats.patientFlow = state.events.filter(e => e.type === 'EHR' || e.type === 'Patient').length;
        state.stats.criticalEvents = state.events.filter(e => e.risk_level === 'Critical' || e.risk_level === 'High').length;
      }
    });
  }
});

export const { addSignal, setConnectionStatus, acknowledgeSignal, incrementActionsTaken, removeSignal } = signalSlice.actions;
export default signalSlice.reducer;
