'use client';

// Haptic feedback hook for mobile devices
export function useHaptic() {
  const vibrate = (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  return {
    // Light tap - for button presses
    light: () => vibrate(10),

    // Medium tap - for selections
    medium: () => vibrate(20),

    // Heavy tap - for important actions
    heavy: () => vibrate(30),

    // Success pattern - for completed actions
    success: () => vibrate([10, 50, 20]),

    // Warning pattern - for destructive actions
    warning: () => vibrate([30, 50, 30]),

    // Error pattern - for failed actions
    error: () => vibrate([50, 100, 50, 100, 50]),

    // Custom pattern
    custom: vibrate,
  };
}

// Standalone function for use outside React
export function haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;

  const patterns: Record<string, number | number[]> = {
    light: 10,
    medium: 20,
    heavy: 30,
    success: [10, 50, 20],
    warning: [30, 50, 30],
    error: [50, 100, 50, 100, 50],
  };

  navigator.vibrate(patterns[type] || 10);
}
