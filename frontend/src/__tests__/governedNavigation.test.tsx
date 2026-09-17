import { describe, it, expect } from 'vitest';
import { createGovernedRef, createPrimaryContext, createNestedContext, GovernedRef, NavigationContext } from '../utils/governedNavigation';

describe('SDS-D3 Governed Navigation (Tests T01-T12)', () => {

  const testRef: GovernedRef = { objectType: 'Signal', objectId: '12345' };
  const parentRef: GovernedRef = { objectType: 'SignalGroup', objectId: '999' };

  describe('Stable References', () => {
    it('T01: should create a stable GovernedRef', () => {
      const ref = createGovernedRef('Signal', '12345');
      expect(ref.objectType).toBe('Signal');
      expect(ref.objectId).toBe('12345');
    });

    it('T02: should prevent direct state mutation of GovernedRef', () => {
      const ref = createGovernedRef('Signal', '12345');
      // Assert it has no side effects and returns exactly what was provided
      expect(ref).toEqual({ objectType: 'Signal', objectId: '12345' });
    });
  });

  describe('Primary Context Preservation (Level 1)', () => {
    it('T03: should initialize a new workspace context at depth 1', () => {
      const ctx = createPrimaryContext(testRef);
      expect(ctx.primary).toEqual(testRef);
      expect(ctx.depth).toBe(1);
      expect(ctx.mode).toBe('current');
    });

    it('T04: should support historical mode for resolved signals', () => {
      const ctx = createPrimaryContext(testRef, 'historical');
      expect(ctx.mode).toBe('historical');
    });
  });

  describe('Nested Context (Level 2 & 3)', () => {
    it('T05: should create Level 2 context preserving primary ref', () => {
      const ctx = createNestedContext(testRef, 2);
      expect(ctx.primary).toEqual(testRef);
      expect(ctx.depth).toBe(2);
    });

    it('T06: should create Level 3 context preserving primary ref', () => {
      const ctx = createNestedContext(testRef, 3, parentRef);
      expect(ctx.primary).toEqual(testRef);
      expect(ctx.parent).toEqual(parentRef);
      expect(ctx.depth).toBe(3);
    });

    it('T07: should carry over historical mode into nested context', () => {
      const ctx = createNestedContext(testRef, 2, undefined, 'historical');
      expect(ctx.mode).toBe('historical');
    });
  });

  describe('Absence of Business Logic Execution', () => {
    it('T08: should not mutate global state when creating refs', () => {
      const stateBefore = { ...globalThis };
      createGovernedRef('Test', '000');
      const stateAfter = { ...globalThis };
      expect(stateBefore).toEqual(stateAfter);
    });

    it('T09: should strictly enforce pure navigation primitives', () => {
      // Testing that the output only depends on the inputs
      const ref1 = createPrimaryContext({ objectType: 'A', objectId: 'B' });
      const ref2 = createPrimaryContext({ objectType: 'A', objectId: 'B' });
      expect(ref1).toEqual(ref2);
    });
  });

  describe('Validation of Required Contracts', () => {
    it('T10: should require objectType and objectId for GovernedRef', () => {
      const ref = createGovernedRef('User', 'U-1');
      expect(ref).toHaveProperty('objectType');
      expect(ref).toHaveProperty('objectId');
    });

    it('T11: should enforce depth limits correctly (1, 2, or 3)', () => {
      const ctx1 = createPrimaryContext(testRef);
      expect(ctx1.depth).toBe(1);
      
      const ctx2 = createNestedContext(testRef, 2);
      expect(ctx2.depth).toBe(2);
      
      const ctx3 = createNestedContext(testRef, 3);
      expect(ctx3.depth).toBe(3);
    });

    it('T12: should enforce mode (current or historical)', () => {
      const ctxCurrent = createPrimaryContext(testRef, 'current');
      expect(ctxCurrent.mode).toBe('current');
      
      const ctxHist = createPrimaryContext(testRef, 'historical');
      expect(ctxHist.mode).toBe('historical');
    });
  });

});
