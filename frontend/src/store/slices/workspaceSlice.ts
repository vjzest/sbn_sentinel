import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type WorkspaceType = 
  | 'dashboard' 
  | 'operations' 
  | 'revenue' 
  | 'reports' 
  | 'admin' 
  | 'settings';

export interface WorkspaceContextState {
  activeWorkspace: WorkspaceType;
  activeClinicId: string;
  activeClinicName: string;
  activeOrganizationId: string;
  activeOrganizationName: string;
  dateRange: {
    startDate: string;
    endDate: string;
    label: string;
  };
  searchQuery: string;
  activeFilters: Record<string, any>;
}

const initialState: WorkspaceContextState = {
  activeWorkspace: 'dashboard',
  activeClinicId: 'clinic_001',
  activeClinicName: 'City Heart Cardiology',
  activeOrganizationId: 'org_001',
  activeOrganizationName: 'Health First Enterprise',
  dateRange: {
    startDate: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    label: 'Last 7 Days'
  },
  searchQuery: '',
  activeFilters: {}
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setActiveWorkspace(state, action: PayloadAction<WorkspaceType>) {
      state.activeWorkspace = action.payload;
    },
    setActiveClinic(state, action: PayloadAction<{ id: string; name: string }>) {
      state.activeClinicId = action.payload.id;
      state.activeClinicName = action.payload.name;
    },
    setActiveOrganization(state, action: PayloadAction<{ id: string; name: string }>) {
      state.activeOrganizationId = action.payload.id;
      state.activeOrganizationName = action.payload.name;
    },
    setDateRange(state, action: PayloadAction<{ startDate: string; endDate: string; label: string }>) {
      state.dateRange = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setFilter(state, action: PayloadAction<{ key: string; value: any }>) {
      state.activeFilters[action.payload.key] = action.payload.value;
    },
    clearFilters(state) {
      state.activeFilters = {};
      state.searchQuery = '';
    }
  }
});

export const { 
  setActiveWorkspace, 
  setActiveClinic, 
  setActiveOrganization, 
  setDateRange, 
  setSearchQuery, 
  setFilter, 
  clearFilters 
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
