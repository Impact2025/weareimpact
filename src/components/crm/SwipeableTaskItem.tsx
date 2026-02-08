'use client';

import { useState, useRef, TouchEvent, useCallback } from 'react';
import { Check, Trash2, Undo2 } from 'lucide-react';
import { haptic } from '@/hooks/useHaptic';
import { CrmTask } from '@/lib/crm/types';
import { TaskItem } from './TaskItem';

interface SwipeableTaskItemProps {
  task: CrmTask;
  onComplete?: (taskId: string) => Promise<void>;
  onUncomplete?: (taskId: string) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
  onClick?: () => void;
  showEntity?: boolean;
}

const SWIPE_THRESHOLD = 80;
const ACTION_THRESHOLD = 120;

export function SwipeableTaskItem({
  task,
  onComplete,
  onUncomplete,
  onDelete,
  onClick,
  showEntity = true,
}: SwipeableTaskItemProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const isCompleted = task.status === 'completed';

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isAnimating) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
  }, [isAnimating]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isAnimating) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX.current;
    const diffY = currentY - startY.current;

    // Determine swipe direction on first significant move
    if (isHorizontalSwipe.current === null && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
    }

    // Only handle horizontal swipes
    if (!isHorizontalSwipe.current) return;

    // Prevent scroll
    e.preventDefault();

    // Apply resistance at edges
    let newTranslate = diffX;
    if (Math.abs(diffX) > ACTION_THRESHOLD) {
      const excess = Math.abs(diffX) - ACTION_THRESHOLD;
      newTranslate = (diffX > 0 ? 1 : -1) * (ACTION_THRESHOLD + excess * 0.3);
    }

    // Limit swipe range
    newTranslate = Math.max(-180, Math.min(180, newTranslate));
    setTranslateX(newTranslate);

    // Haptic feedback at thresholds
    if (Math.abs(newTranslate) >= SWIPE_THRESHOLD && Math.abs(translateX) < SWIPE_THRESHOLD) {
      haptic('light');
    }
    if (Math.abs(newTranslate) >= ACTION_THRESHOLD && Math.abs(translateX) < ACTION_THRESHOLD) {
      haptic('medium');
    }
  }, [isAnimating, translateX]);

  const handleTouchEnd = useCallback(async () => {
    if (isAnimating) return;
    isHorizontalSwipe.current = null;

    const absTranslate = Math.abs(translateX);

    if (absTranslate >= ACTION_THRESHOLD) {
      setIsAnimating(true);

      // Swipe right = complete/uncomplete
      if (translateX > 0) {
        haptic('success');
        // Animate out
        setTranslateX(400);

        setTimeout(async () => {
          if (isCompleted && onUncomplete) {
            await onUncomplete(task.id);
          } else if (!isCompleted && onComplete) {
            await onComplete(task.id);
          }
          setTranslateX(0);
          setIsAnimating(false);
        }, 200);
      }
      // Swipe left = delete (if available)
      else if (translateX < 0 && onDelete) {
        haptic('warning');
        setTranslateX(-400);

        setTimeout(async () => {
          await onDelete(task.id);
          setTranslateX(0);
          setIsAnimating(false);
        }, 200);
      } else {
        // No delete handler, spring back
        setTranslateX(0);
        setIsAnimating(false);
      }
    } else {
      // Spring back
      setTranslateX(0);
    }
  }, [translateX, isAnimating, isCompleted, onComplete, onUncomplete, onDelete, task.id]);

  const rightActionOpacity = Math.min(Math.max(translateX / SWIPE_THRESHOLD, 0), 1);
  const leftActionOpacity = Math.min(Math.max(-translateX / SWIPE_THRESHOLD, 0), 1);
  const rightActionScale = translateX >= ACTION_THRESHOLD ? 1.2 : 1;
  const leftActionScale = -translateX >= ACTION_THRESHOLD ? 1.2 : 1;

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        {/* Right swipe action (complete) */}
        <div
          className={`flex items-center justify-start pl-4 flex-1 ${
            isCompleted ? 'bg-orange-500' : 'bg-green-500'
          }`}
          style={{ opacity: rightActionOpacity }}
        >
          <div
            className="text-white transition-transform duration-100"
            style={{ transform: `scale(${rightActionScale})` }}
          >
            {isCompleted ? <Undo2 size={24} /> : <Check size={24} />}
          </div>
        </div>

        {/* Left swipe action (delete) */}
        {onDelete && (
          <div
            className="flex items-center justify-end pr-4 flex-1 bg-red-500"
            style={{ opacity: leftActionOpacity }}
          >
            <div
              className="text-white transition-transform duration-100"
              style={{ transform: `scale(${leftActionScale})` }}
            >
              <Trash2 size={24} />
            </div>
          </div>
        )}
      </div>

      {/* Swipeable content */}
      <div
        className={`relative bg-white ${isAnimating ? 'transition-transform duration-200' : ''}`}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <TaskItem
          task={task}
          onComplete={onComplete}
          onUncomplete={onUncomplete}
          onClick={onClick}
          showEntity={showEntity}
        />
      </div>
    </div>
  );
}
