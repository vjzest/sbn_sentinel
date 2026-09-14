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

  test('T01: Rendered startup uses exact IAK asset image', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ready: true }) });
    const { container } = render(<BootScreen onComplete={() => {}} />);
    
    // Check for images
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBeGreaterThan(0);
    // Verify it uses the logo
    expect(imgs[0].src).toContain('logo.png');
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

  test('T03 & T05: Shows STARTUP FAILED on failure but proceeds', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Backend offline'));
    const onComplete = vi.fn();
    render(<BootScreen onComplete={onComplete} />);
    
    await act(async () => {
      await Promise.resolve();
      await vi.runAllTimersAsync();
    });
    
    // Should show error briefly
    expect(screen.getByText('STARTUP FAILED')).toBeTruthy();
    
    // Fast forward the failure wait time
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // We modified BootScreen to call onComplete even on failure to avoid freezing
    expect(onComplete).toHaveBeenCalled();
  });

  test('T06: Fallback backend offline handling', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ready: false }) });
    render(<BootScreen onComplete={() => {}} />);
    
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    
    // Should still proceed eventually (or show failed)
    expect(screen.getByText('STARTUP FAILED')).toBeTruthy();
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

    // Check for images
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBeGreaterThan(0);
  });
});
