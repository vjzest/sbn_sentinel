import React from 'react';
import { render, screen } from '@testing-library/react';
import { SignalsDetailView } from '../components/CommandCenter/SignalsDetailView';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock redux slice to provide test state
const mockStore = configureStore({
  reducer: {
    signals: (state = { events: [{ id: 'test-sig-1', type: 'EHR', message: 'Test message', timestamp: new Date().toISOString() }] }, action) => state,
  }
});

describe('T14: D5 Execution Boundary Validation', () => {
  it('does not render any D6 Operational Execution buttons or outcome panels', () => {
    // Render the SignalsDetailView
    render(
      <Provider store={mockStore}>
        <SignalsDetailView initialSignalId="test-sig-1" />
      </Provider>
    );

    // 1. Verify "Execute Governed Action" button is gone
    const executeButton = screen.queryByText(/Execute Governed Action/i);
    expect(executeButton).toBeNull();
    
    // 2. Verify "Operational Outcome" panel is gone
    const outcomePanel = screen.queryByText(/Operational Outcome/i);
    expect(outcomePanel).toBeNull();
  });
});
