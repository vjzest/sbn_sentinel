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
  context_confidence?: string;
  context_reason?: string;
  revenue_risk_category?: string;
  estimated_financial_exposure?: string;
  revenue_confidence?: string;
  operational_dependency?: string;
  ai_insight?: string;
  status?: 'active' | 'acknowledged';
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

const defaultInitialSignals: SignalEvent[] = [
  {
    id: "sig_101",
    source: "PASME Engine",
    type: "Patient No-Show Risk",
    message: "High Risk No-Show Detected (89% Probability) for Vijay Maurya",
    timestamp: new Date().toISOString(),
    risk_level: "High",
    problem: "Patient has 3 consecutive past missed appointments during rainy weather.",
    reason: "Historical appointment patterns indicate scheduling vulnerability.",
    business_impact: "$240 lost revenue slot & physician idle time.",
    recommended_action: "Dispatch automated SMS confirmation & offer virtual telehealth slot.",
    expected_outcome: "Recover 90% slot utilization.",
    primary_context: "PASME Model Prediction",
    revenue_risk_category: "No-Show Idle Time Loss",
    estimated_financial_exposure: "$240.00",
    status: "active"
  },
  {
    id: "sig_102",
    source: "Revenue Intelligence Engine",
    type: "CPT Undercoding Detected",
    message: "Potential $540 Undercoding Recovery Opportunity on Encounter enc_102",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    risk_level: "Critical",
    problem: "SOAP note documents complex multi-system evaluation but coded as 99213.",
    reason: "Medical NLP detected 45-minute consultation & complex medical decision making.",
    business_impact: "Losing $540 reimbursement per claim.",
    recommended_action: "Coding review required — encounter may require verification against documented coding criteria.",
    expected_outcome: "Immediate $540 revenue recovery.",
    primary_context: "AI Medical Coding NLP",
    revenue_risk_category: "Claim Undercoding",
    estimated_financial_exposure: "$540.00",
    status: "active"
  },
  {
    id: "sig_103",
    source: "EHR Connector Engine",
    type: "Insurance Pre-Auth Alert",
    message: "Pre-Authorization Required for Lumbago MRI Scan - Amitabh Bacchan",
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    risk_level: "Moderate",
    problem: "BlueCross policy requires prior approval before Lumbar MRI scan.",
    reason: "Rule SES-006 matched prior auth policy restriction.",
    business_impact: "Claim denial risk if MRI performed without approval.",
    recommended_action: "Submit electronic prior-authorization form via clearinghouse connector.",
    expected_outcome: "Pre-auth approval granted within 2 hours.",
    primary_context: "Payer Verification",
    revenue_risk_category: "Prior Authorization Denial",
    estimated_financial_exposure: "$1,200.00",
    status: "active"
  }
];

const initialState: SignalState = {
  events: defaultInitialSignals,
  isConnected: false,
  stats: {
    activeSignals: 12,
    patientFlow: 14,
    criticalEvents: 3,
    actionsTaken: 8,
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
        // Merge fetched signals, preferring them over default
        const fetchedIds = new Set(action.payload.map(s => s.id));
        const keptDefaults = state.events.filter(e => !fetchedIds.has(e.id) && e.id.startsWith("sig_"));
        
        state.events = [...action.payload, ...keptDefaults];
        
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
