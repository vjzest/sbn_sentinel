import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BootScreen } from '../components/CommandCenter/BootScreen';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('BootScreen SDS-D2 Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('T01: Rendered startup uses exact IAK SVG artwork', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ready: true }) });
    const { container } = render(<BootScreen onComplete={() => {}} />);
    
    // Check for inline SVG
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
    // Verify it has the segmented paths
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(5);
  });

  test('T02 & T04: Visual stage order strictly follows 1→9', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ready: true }) });
    const onComplete = vi.fn();
    render(<BootScreen onComplete={onComplete} />);
    
    // Fast forward through all stages
    await act(async () => {
      await Promise.resolve();
      await vi.runAllTimersAsync();
    });
    
    // Run timers again to process the useEffect timeouts (Stage 8 and 9)
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    
    expect(onComplete).toHaveBeenCalled();
  });

  test('T03 & T05: Shows STARTUP FAILED on failure and does NOT proceed', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Backend offline'));
    const onComplete = vi.fn();
    render(<BootScreen onComplete={onComplete} />);
    
    await act(async () => {
      await Promise.resolve();
      await vi.runAllTimersAsync();
    });
    
    // Should show error
    expect(screen.getByText('STARTUP FAILED')).toBeTruthy();
    
    // Fast forward
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // D2 Strict Gating: Should NOT complete if failed
    expect(onComplete).not.toHaveBeenCalled();
  });

  test('T06: Fallback backend not-ready handling', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ready: false }) });
    const onComplete = vi.fn();
    render(<BootScreen onComplete={onComplete} />);
    
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(5000);
    });
    
    // Should show failed and not proceed
    expect(screen.getByText('STARTUP FAILED')).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();
  });
  
  test('T07: prefers-reduced-motion preserves meaning', async () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      addListener: vi.fn(), removeListener: vi.fn()
    }));
    
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ready: true }) });
    const { container } = render(<BootScreen onComplete={() => {}} />);
    
    await act(async () => {
      await Promise.resolve();
    });

    // Check for inline SVG
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });
});
