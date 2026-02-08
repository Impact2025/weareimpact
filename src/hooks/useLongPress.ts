'use client';

import { useRef, useCallback, TouchEvent, MouseEvent } from 'react';
import { haptic } from './useHaptic';

interface LongPressOptions {
  onLongPress: () => void;
  onPress?: () => void;
  delay?: number;
  disableHaptic?: boolean;
}

export function useLongPress({
  onLongPress,
  onPress,
  delay = 500,
  disableHaptic = false,
}: LongPressOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const start = useCallback((x: number, y: number) => {
    isLongPressRef.current = false;
    startPosRef.current = { x, y };

    timeoutRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (!disableHaptic) {
        haptic('heavy');
      }
      onLongPress();
    }, delay);
  }, [onLongPress, delay, disableHaptic]);

  const cancel = useCallback((shouldTriggerPress: boolean = false) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (shouldTriggerPress && !isLongPressRef.current && onPress) {
      onPress();
    }
  }, [onPress]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    start(touch.clientX, touch.clientY);
  }, [start]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const moveThreshold = 10;
    const dx = Math.abs(touch.clientX - startPosRef.current.x);
    const dy = Math.abs(touch.clientY - startPosRef.current.y);

    if (dx > moveThreshold || dy > moveThreshold) {
      cancel(false);
    }
  }, [cancel]);

  const handleTouchEnd = useCallback(() => {
    cancel(true);
  }, [cancel]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    start(e.clientX, e.clientY);
  }, [start]);

  const handleMouseUp = useCallback(() => {
    cancel(true);
  }, [cancel]);

  const handleMouseLeave = useCallback(() => {
    cancel(false);
  }, [cancel]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
  };
}
