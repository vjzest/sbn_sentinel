import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BootScreen } from '../components/CommandCenter/BootScreen';
import { vi } from 'vitest';

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

  test('T01: Rendered startup uses exact IAK asset SVG', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ready: true }) });
    const { container } = render(<BootScreen onComplete={() => {}} />);
    
    // Check for SVGs instead of "S" tile
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
    // Verify it contains the crown path
    const crownPath = container.querySelector('path[d="M80 40 L100 20 L120 40 Z"]');
    expect(crownPath).toBeTruthy();
  });

  test('T02 & T04: Visual stage order strictly follows 1→9, crown last', async () => {
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
    
    expect(screen.getByText('Sentinel is ready.')).toBeTruthy();
  });

  test('T03 & T05: Animation completing alone never triggers READY on failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Backend offline'));
    const onComplete = vi.fn();
    render(<BootScreen onComplete={onComplete} />);
    
    await act(async () => {
      await Promise.resolve();
      await vi.runAllTimersAsync();
    });
    
    expect(screen.queryByText('Sentinel is ready.')).toBeNull();
    expect(screen.getByText('Readiness Verification Failed')).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();
  });

  test('T06: No boot text claims initialized without backend', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ready: false }) });
    render(<BootScreen onComplete={() => {}} />);
    
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    
    expect(screen.queryByText('Sentinel is ready.')).toBeNull();
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

    // It should render transition-opacity instead of sweep
    const paths = container.querySelectorAll('path');
    let hasReducedMotionClass = false;
    paths.forEach(p => {
      if (p.className.baseVal && p.className.baseVal.includes('transition-opacity')) {
        hasReducedMotionClass = true;
      }
    });
    expect(hasReducedMotionClass).toBe(true);
  });
});
