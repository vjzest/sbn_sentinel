import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignalsDetailView } from '../components/CommandCenter/SignalsDetailView';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as fetchModule from '../utils/fetchWithAuth';
import { RecommendationReview } from '../components/GovernedUI/RecommendationReview';

// Mock redux slice to provide test state
const mockStore = configureStore({
  reducer: {
    signals: (state = { events: [{ id: 'test-sig-1', type: 'EHR', message: 'Test message', timestamp: new Date().toISOString() }] }, action) => state,
  }
});

describe('T14: D5 Execution Boundary Validation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render any D6 Operational Execution buttons or outcome panels', () => {
    vi.spyOn(fetchModule, 'fetchWithAuth').mockImplementation(async () => {
      return {
        ok: true,
        json: async () => []
      } as unknown as Response;
    });

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

  it('proves D5 decision submission calls /decisions only and never /actions', async () => {
    // Intercept fetch requests
    const fetchSpy = vi.spyOn(fetchModule, 'fetchWithAuth').mockImplementation(async (url, init) => {
      // Mock the GET request to populate the form
      if (!init || init.method === 'GET' || !init.method) {
        return {
          ok: true,
          json: async () => ({
            technical_state: 'ready',
            authority: {
              state: 'AUTHORIZED',
              allowed_decisions: ['APPROVED', 'REJECTED'],
              reason_required_for: []
            },
            recommendation: {
              recommendation_id: 'rec-123',
              content: 'Do something',
              priority: 'HIGH',
              status: 'ACTIVE'
            },
            current_decision: null
          })
        } as unknown as Response;
      }

      // Mock the POST request
      if (init && init.method === 'POST') {
        return {
          ok: true,
          json: async () => ({ status: 'SUCCESS' })
        } as unknown as Response;
      }

      return { ok: true, json: async () => ({}) } as unknown as Response;
    });

    render(<RecommendationReview signalId="test-sig-1" />);

    // Wait for data to load and APPROVED option to appear
    const approveOption = await screen.findByText('APPROVED');
    expect(approveOption).toBeDefined();

    // Click Approved radio option
    fireEvent.click(approveOption);

    // Submit decision
    const submitBtn = await screen.findByRole('button', { name: /RECORD DECISION/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const calls = fetchSpy.mock.calls;
      const postCalls = calls.filter(c => c[1]?.method === 'POST');

      expect(postCalls.length).toBeGreaterThan(0);
      // Ensure all POST calls go to /decisions and NOT /actions
      postCalls.forEach(call => {
        const url = call[0] as string;
        expect(url).toContain('/api/v1/decisions');
        expect(url).not.toContain('/actions');
      });
    });

    fetchSpy.mockRestore();
  });
});
