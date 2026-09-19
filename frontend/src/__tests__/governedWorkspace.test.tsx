import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { GovernedWorkspace } from '../components/GovernedUI/GovernedWorkspace';
import { ContextBreadcrumbs } from '../components/GovernedUI/ContextBreadcrumbs';
import { ProgressiveSection } from '../components/GovernedUI/ProgressiveSection';
import { createGovernedRef, createPrimaryContext, createNestedContext } from '../utils/governedNavigation';
describe('GovernedWorkspace & Hand-off Integration', () => {
  it('retains primary object and renders correctly in current mode', () => {
    const ref = createGovernedRef('Signal', 'SIG-001');
    const ctx = createPrimaryContext(ref, 'current');
    render(
      <GovernedWorkspace
        context={ctx}
        primaryContent={<div data-testid="primary-content">Primary View</div>}
        contextPanels={<div data-testid="panels-content">Panels View</div>}
        onClose={() => { }}
      />
    );
    expect(screen.getByTestId('primary-content')).toBeDefined();
    expect(screen.getByText('SIG-001')).toBeDefined();
  });
  it('renders correctly in historical mode explicitly based on metadata', () => {
    const ref = createGovernedRef('Patient', 'PAT-123');
    const isHistorical = true;
    const ctx = createPrimaryContext(ref, isHistorical ? 'historical' : 'current');
    render(
      <ContextBreadcrumbs context={ctx} />
    );
    expect(screen.getByText('Historical')).toBeDefined();
    expect(screen.getByText('PAT-123')).toBeDefined();
  });
  it('activates breadcrumb via keyboard focus and click event', () => {
    const parentRef = createGovernedRef('Patient', 'PAT-123');
    const primaryRef = createGovernedRef('Encounter', 'ENC-456');
    const ctx = createNestedContext(primaryRef, 2, parentRef, 'current');
    const onNavigateUp = vi.fn();
    render(<ContextBreadcrumbs context={ctx} onNavigateUp={onNavigateUp} />);
    const parentButton = screen.getByText('PAT-123');
    expect(parentButton.tagName).toBe('BUTTON');
    expect(parentButton.getAttribute('aria-current')).toBeNull();
    fireEvent.click(parentButton);
    expect(onNavigateUp).toHaveBeenCalledWith(parentRef);
  });
  it('progressive section aria behavior expands and collapses', () => {
    render(
      <ProgressiveSection id="test-sec" title="Test Section" defaultExpanded={false}>
        <div data-testid="section-content">Content</div>
      </ProgressiveSection>
    );
    const header = screen.getByRole('button');
    expect(header.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(header);
    expect(header.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByTestId('section-content')).toBeDefined();
  });
  it('progressive section shows blocked state UI for unauthorized dataState', () => {
    render(
      <ProgressiveSection
        id="blocked-sec"
        title="Restricted Section"
        dataState="unauthorized"
        dataStateMessage="Access Denied"
        defaultExpanded={true}
      >
        <div data-testid="hidden-content">Should not render normally</div>
      </ProgressiveSection>
    );
    expect(screen.getByText('Restricted')).toBeDefined();
    expect(screen.getByText('Access Denied')).toBeDefined();
  });
  it('progressive section shows blocked state UI for unavailable dataState', () => {
    render(
      <ProgressiveSection
        id="unavail-sec"
        title="Unavailable Section"
        dataState="unavailable"
        dataStateMessage="Data missing"
        defaultExpanded={true}
      >
        <div data-testid="hidden-content">Should not render normally</div>
      </ProgressiveSection>
    );
    expect(screen.getByText('Data missing')).toBeDefined();
  });
});
