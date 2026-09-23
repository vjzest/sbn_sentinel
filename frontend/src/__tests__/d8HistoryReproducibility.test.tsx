import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HistoricalTraceSection } from '../components/History/HistoricalTraceSection';
import { AuditTimeline } from '../components/History/AuditTimeline';
import { MissingDependencyNotice } from '../components/History/MissingDependencyNotice';
import * as historyApi from '../utils/history';
import { HistoricalBindings, HistoricalContextResponse } from '../types/history';

describe('D8 History & Reproducibility Tests', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('valid history -> technical_state = valid -> reproduction UI path is enabled', async () => {
        const mockContext: HistoricalContextResponse = {
            anchor: {
                object_type: 'journey',
                object_id: 'JNY-TEST',
                journey_id: 'JNY-TEST',
                mode: 'historical'
            },
            technical_state: 'valid',
            bindings: {
                evidence_refs: [],
                decision_context_id: 'CTX-1',
                policy: null,
                rule_evaluations: [],
                recommendations: [{
                    recommendation_id: 'REC-001',
                    mapping_id: 'MAP-001',
                    mapping_version: 'V1',
                    status: 'active',
                    generated_at: '2026-09-23T12:00:00Z'
                }],
                decisions: [],
                actions: []
            }
        };

        const getHistorySpy = vi.spyOn(historyApi, 'getHistoricalJourney').mockResolvedValue(mockContext);
        const reproduceSpy = vi.spyOn(historyApi, 'reproduceDecision').mockResolvedValue({
            status: 'MATCH',
            recommendation_id: 'REC-001',
            original: { action: 'Test Action' },
            reproduced: { action: 'Test Action' },
            differences: [],
            diagnostic: null
        });

        render(<HistoricalTraceSection journeyId="JNY-TEST" />);

        // Expand the accordion section
        const toggleBtn = screen.getByRole('button', { name: /D8 Historical Trace/i });
        fireEvent.click(toggleBtn);

        await waitFor(() => {
            expect(getHistorySpy).toHaveBeenCalledWith('JNY-TEST');
            expect(reproduceSpy).toHaveBeenCalledWith('REC-001');
        });

        // Reproduction UI path is enabled and displays result
        const matchBadge = await screen.findByText('Exact Match');
        expect(matchBadge).toBeTruthy();
    });

    it('ambiguous history -> technical_state = ambiguous -> reproduction UI path is disabled', async () => {
        const mockContext: HistoricalContextResponse = {
            anchor: {
                object_type: 'journey',
                object_id: 'JNY-TEST',
                journey_id: 'JNY-TEST',
                mode: 'historical'
            },
            technical_state: 'ambiguous',
            bindings: {
                evidence_refs: [],
                decision_context_id: null,
                policy: null,
                rule_evaluations: [],
                recommendations: [],
                decisions: [],
                actions: []
            }
        };

        vi.spyOn(historyApi, 'getHistoricalJourney').mockResolvedValue(mockContext);
        const reproduceSpy = vi.spyOn(historyApi, 'reproduceDecision');

        render(<HistoricalTraceSection journeyId="JNY-TEST" />);

        // Expand accordion
        const toggleBtn = screen.getByRole('button', { name: /D8 Historical Trace/i });
        fireEvent.click(toggleBtn);

        await waitFor(() => {
            expect(screen.getByText('Ambiguous Chain')).toBeTruthy();
        });

        expect(reproduceSpy).not.toHaveBeenCalled();
    });

    it('renders full Human Decision history fields without undefined actor or Unknown Date', () => {
        const bindings: HistoricalBindings = {
            evidence_refs: [],
            decision_context_id: 'CTX-1',
            policy: null,
            rule_evaluations: [],
            recommendations: [],
            decisions: [{
                decision_id: 'DEC-001',
                actor_id: 'Dr. Jane Doe',
                decision_type: 'APPROVED',
                status: 'RECORDED',
                timestamp: '2026-09-23T12:00:00Z'
            }],
            actions: []
        };

        render(<AuditTimeline bindings={bindings} />);

        expect(screen.getByText(/by Dr\. Jane Doe/i)).toBeTruthy();
        expect(screen.queryByText(/undefined/i)).toBeNull();
        expect(screen.queryByText(/Unknown Date/i)).toBeNull();
    });

    it('exposes full chain Action -> Execution Attempt(s) -> Outcome in AuditTimeline', () => {
        const bindings: HistoricalBindings = {
            evidence_refs: [],
            decision_context_id: 'CTX-1',
            policy: null,
            rule_evaluations: [],
            recommendations: [],
            decisions: [],
            actions: [{
                action_id: 'ACT-001',
                action_type: 'DISPATCH_MEDICATION',
                status: 'COMPLETED',
                current_result: 'SUCCESS',
                attempts: [{
                    attempt_id: 'ATT-001',
                    attempt_number: 1,
                    result: 'SUCCESS'
                }],
                outcome: {
                    outcome_id: 'OUT-001',
                    confirmation_state: 'CONFIRMED',
                    resolution_state: 'RESOLVED'
                }
            }]
        };

        render(<AuditTimeline bindings={bindings} />);

        expect(screen.getByText('Operational Action')).toBeTruthy();
        expect(screen.getByText(/DISPATCH_MEDICATION/i)).toBeTruthy();
        expect(screen.getByText('Execution Attempt(s)')).toBeTruthy();
        expect(screen.getByText(/Attempt 1:/i)).toBeTruthy();
        expect(screen.getByText('Outcome')).toBeTruthy();
        expect(screen.getByText(/CONFIRMED \/ RESOLVED/i)).toBeTruthy();
    });

    it('preserves and displays exact Evidence version as EVID-004 / REV-3', () => {
        const bindings: HistoricalBindings = {
            evidence_refs: [
                { evidence_id: 'EVID-004', version: '3' },
                { evidence_id: 'EVID-005', version: null }
            ],
            decision_context_id: 'CTX-1',
            policy: null,
            rule_evaluations: [],
            recommendations: [],
            decisions: [],
            actions: []
        };

        render(<AuditTimeline bindings={bindings} />);

        expect(screen.getByText('EVID-004 / REV-3')).toBeTruthy();
        expect(screen.getByText('EVID-005')).toBeTruthy();
    });

    it('handles MISSING_MAPPING in MissingDependencyNotice', () => {
        render(
            <MissingDependencyNotice
                diagnostic={{
                    stage: 'historical_logic',
                    code: 'MISSING_MAPPING',
                    missing_dependency: {
                        type: 'RecommendationMapping',
                        id: 'MAP-001',
                        version: 'V1'
                    }
                }}
            />
        );

        expect(screen.getByText('Missing Dependency: Recommendation Mapping')).toBeTruthy();
        expect(screen.getByText(/MAP-001/i)).toBeTruthy();
        expect(screen.getByText(/V1/i)).toBeTruthy();
    });
});
