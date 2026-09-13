import React from 'react';
import { expect, test, describe } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapGovernedState } from '../utils/governedPresentation';
import { GovernedStatus } from '../components/GovernedUI/GovernedStatus';
import { DataState } from '../components/GovernedUI/DataState';
import { HistoricalStateMarker } from '../components/GovernedUI/HistoricalStateMarker';
import { CriticalStateBanner } from '../components/GovernedUI/CriticalStateBanner';

describe('SDS-D1: Governed UI Foundation & State Contract', () => {

  // T01 — UNKNOWN preservation
  test('T01: UNKNOWN preservation - backend UNKNOWN renders unknown/unavailable', () => {
    const res1 = mapGovernedState('UNKNOWN');
    expect(res1.semantic).toBe('unknown');
    expect(res1.label).toBe('UNKNOWN');
    
    const res2 = mapGovernedState(null);
    expect(res2.semantic).toBe('unknown');
    expect(res2.label).toBe('Unknown');
  });

  // T02 — Loading preservation
  test('T02: Loading preservation - pending request shows loading only', () => {
    const html = renderToStaticMarkup(<DataState state="loading" message="Loading data..." />);
    expect(html).toContain('Loading data...');
    expect(html).not.toContain('SUCCESS');
  });

  // T03 — Missing vs negative
  test('T03: Missing vs negative - missing/unavailable info stays missing/unavailable', () => {
    const emptyHtml = renderToStaticMarkup(<DataState state="empty" message="No data found." />);
    expect(emptyHtml).toContain('No data found.');
    
    const unavHtml = renderToStaticMarkup(<DataState state="unavailable" message="Unavailable." />);
    expect(unavHtml).toContain('Unavailable.');
    
    expect(unavHtml).not.toContain('FAILED');
    expect(emptyHtml).not.toContain('FAILED');
  });

  // T04 — Recommendation vs approval
  test('T04: Recommendation vs approval - recommendation without backend approval stays RECOMMENDED', () => {
    const res = mapGovernedState('RECOMMENDED');
    expect(res.semantic).toBe('attention'); 
    expect(res.label).toBe('RECOMMENDED');
  });

  // T05 — Approval vs execution
  test('T05: Approval vs execution - approved-but-unexecuted stays APPROVED, never shown as EXECUTED', () => {
    const res = mapGovernedState('APPROVED');
    expect(res.semantic).toBe('attention');
    expect(res.label).toBe('APPROVED');
    expect(res.label).not.toBe('EXECUTED');
  });

  // T06 — Blocked action
  test('T06: Blocked action - backend denial stays BLOCKED; UI does not advance to dispatched/executed', () => {
    const res = mapGovernedState('BLOCKED');
    expect(res.semantic).toBe('critical');
    expect(res.critical).toBe(true);
    
    const html = renderToStaticMarkup(<CriticalStateBanner state="BLOCKED" reason="Denied by policy" />);
    expect(html).toContain('BLOCKED');
    expect(html).toContain('Denied by policy');
  });

  // T07 — Same state, same meaning
  test('T07: Same state, same meaning - the same governed state is treated consistently', () => {
    const res1 = mapGovernedState('approved');
    const res2 = mapGovernedState('APPROVED ');
    expect(res1).toEqual(res2);
  });

  // T08 — Historical state
  test('T08: Historical state - historical object is visibly historical and cannot appear current', () => {
    const html = renderToStaticMarkup(
      <HistoricalStateMarker 
        isHistorical={true} 
        stateAtTime="APPROVED" 
        currentState="EXECUTED" 
        timestamp="2026-09-01T00:00:00Z" 
      />
    );
    expect(html).toContain('Historical Snapshot');
    expect(html).toContain('State at');
    expect(html).toContain('Current State');
  });

  // T09 — Unavailable detail
  test('T09: Unavailable detail - failure to load deeper detail does not rewrite the parent governed state', () => {
    const html = renderToStaticMarkup(
      <div>
        <GovernedStatus state="APPROVED" />
        <DataState state="unavailable" />
      </div>
    );
    expect(html).toContain('APPROVED');
    expect(html).toContain('Data unavailable.');
  });

  // T10 — Frontend cannot grant authority
  test('T10: Frontend cannot grant authority - visible action + backend denial stays denied', () => {
    const res = mapGovernedState('DENIED');
    expect(res.semantic).toBe('critical');
    
    const html = renderToStaticMarkup(<GovernedStatus state="DENIED" />);
    expect(html).toContain('DENIED');
    expect(html).not.toContain('SUCCESS');
  });

});
