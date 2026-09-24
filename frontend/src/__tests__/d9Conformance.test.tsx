import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GovernedStatus } from '../components/GovernedUI/GovernedStatus';

describe('D9 Conformance Tests', () => {
    it('T01: Critical governed status remains visible (Status not color-only)', () => {
        render(<GovernedStatus state="FAILED" />);
        // Text must be readable, not just a red icon
        expect(screen.getByText(/FAILED/i)).toBeTruthy();
    });

    it('T11: Status not color-only - Positive state', () => {
        render(<GovernedStatus state="COMPLETED" />);
        expect(screen.getByText(/COMPLETED/i)).toBeTruthy();
    });

    it('T25: Unknown state safety', () => {
        render(<GovernedStatus state="UNKNOWN_RANDOM_STATE" />);
        expect(screen.getByText(/UNKNOWN/i)).toBeTruthy();
    });
});
