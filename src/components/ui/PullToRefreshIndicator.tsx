'use client';

import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  pullProgress: number;
  shouldRefresh: boolean;
}

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  pullProgress,
  shouldRefresh,
}: PullToRefreshIndicatorProps) {
  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-all duration-200"
      style={{
        height: isRefreshing ? 60 : pullDistance,
        opacity: Math.min(pullProgress, 1),
      }}
    >
      <div
        className={`p-2 rounded-full bg-orange-100 ${isRefreshing ? 'animate-spin' : ''}`}
        style={{
          transform: `rotate(${pullProgress * 360}deg) scale(${0.5 + pullProgress * 0.5})`,
          transition: isRefreshing ? 'none' : 'transform 0.1s',
        }}
      >
        <RefreshCw
          size={24}
          className={shouldRefresh || isRefreshing ? 'text-orange-600' : 'text-orange-400'}
        />
      </div>
    </div>
  );
}
