'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Volume2, VolumeX, Play, Pause, ChevronRight, Calendar, FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Iris video moment types
export type IrisMoment = 'welcome' | 'ai-expert' | 'lego-play' | 'booking';

interface IrisAction {
  label: string;
  icon?: React.ReactNode;
  action: string; // 'close' | 'navigate:path' | 'callback:name'
  primary?: boolean;
}

interface IrisMomentConfig {
  videoUrl: string;
  posterUrl?: string;
  title: string;
  subtitle: string;
  actions: IrisAction[];
  autoPlay?: boolean;
}

// Configuration for each Iris moment
// Video URLs will be replaced with actual HeyGen video URLs
const IRIS_MOMENTS: Record<IrisMoment, IrisMomentConfig> = {
  welcome: {
    videoUrl: '/videos/iris/welcome.mp4',
    posterUrl: '/videos/iris/welcome-poster.jpg',
    title: 'Welkom bij WeAreImpact',
    subtitle: 'Iris, digitale assistent van Vincent',
    autoPlay: true,
    actions: [
      { label: 'AI voor mijn sector', icon: <ChevronRight size={16} />, action: 'callback:ai-sector', primary: true },
      { label: 'Gesprek plannen', icon: <Calendar size={16} />, action: 'callback:booking' },
      { label: 'Zelf rondkijken', icon: <X size={16} />, action: 'close' },
    ],
  },
  'ai-expert': {
    videoUrl: '/videos/iris/ai-expert.mp4',
    posterUrl: '/videos/iris/ai-expert-poster.jpg',
    title: 'AI & Innovatie',
    subtitle: 'Technologie met de menselijke maat',
    autoPlay: true,
    actions: [
      { label: 'Download one-pager', icon: <FileText size={16} />, action: 'navigate:/downloads/ai-onepager.pdf', primary: true },
      { label: 'Plan een demo', icon: <Calendar size={16} />, action: 'callback:booking' },
      { label: 'Terug naar chat', icon: <X size={16} />, action: 'close' },
    ],
  },
  'lego-play': {
    videoUrl: '/videos/iris/lego-play.mp4',
    posterUrl: '/videos/iris/lego-poster.jpg',
    title: 'LEGO Serious Play',
    subtitle: 'Bouwen aan oplossingen',
    autoPlay: true,
    actions: [
      { label: 'Bekijk voorbeeldsessie', icon: <ExternalLink size={16} />, action: 'navigate:/lego-serious-play', primary: true },
      { label: 'Plan een workshop', icon: <Calendar size={16} />, action: 'callback:booking' },
      { label: 'Terug naar chat', icon: <X size={16} />, action: 'close' },
    ],
  },
  booking: {
    videoUrl: '/videos/iris/booking.mp4',
    posterUrl: '/videos/iris/booking-poster.jpg',
    title: 'Gesprek Plannen',
    subtitle: 'Vincent kijkt ernaar uit',
    autoPlay: true,
    actions: [
      { label: 'Kies een tijdstip', icon: <Calendar size={16} />, action: 'callback:show-calendar', primary: true },
    ],
  },
};

interface IrisAvatarProps {
  moment: IrisMoment;
  isVisible: boolean;
  onClose: () => void;
  onAction?: (action: string) => void;
  className?: string;
}

export function IrisAvatar({ moment, isVisible, onClose, onAction, className }: IrisAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);

  const config = IRIS_MOMENTS[moment];

  // Handle visibility changes
  useEffect(() => {
    if (isVisible && videoRef.current) {
      setHasEnded(false);
      setShowActions(false);
      if (config.autoPlay) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          // Autoplay blocked, show play button
          setIsPlaying(false);
        });
      }
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isVisible, config.autoPlay]);

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleVideoEnded = () => {
    setHasEnded(true);
    setIsPlaying(false);
    setShowActions(true);
  };

  const handleActionClick = (action: string) => {
    if (action === 'close') {
      onClose();
    } else if (action.startsWith('navigate:')) {
      const path = action.replace('navigate:', '');
      window.open(path, '_blank');
    } else if (action.startsWith('callback:')) {
      const callbackName = action.replace('callback:', '');
      onAction?.(callbackName);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm',
        'animate-in fade-in-0 duration-300',
        className
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full max-w-md mx-4 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl',
          'animate-in zoom-in-95 slide-in-from-bottom-4 duration-300'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video container */}
        <div className="relative aspect-[9/16] max-h-[70vh] bg-slate-800">
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Video */}
          <video
            ref={videoRef}
            src={config.videoUrl}
            poster={config.posterUrl}
            className="w-full h-full object-cover"
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={handleVideoEnded}
            onLoadedData={() => setIsLoading(false)}
            onCanPlay={() => setIsLoading(false)}
          />

          {/* Top gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />

          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors"
          >
            <X size={20} className="text-white" />
          </button>

          {/* Iris badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm shadow-lg overflow-hidden relative">
              <Image
                src="/iris-avatar.png"
                alt="Iris"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Iris</div>
              <div className="text-white/70 text-xs">Digitale collega van Vincent</div>
            </div>
          </div>

          {/* Play/Pause overlay (shown when paused or ended) */}
          {(!isPlaying && !hasEnded) && (
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                <Play size={40} className="text-white ml-2" />
              </div>
            </button>
          )}

          {/* Video controls */}
          {isPlaying && (
            <div className="absolute bottom-20 left-4 right-4 flex justify-between items-center">
              <button
                onClick={handlePlay}
                className="p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors"
              >
                <Pause size={18} className="text-white" />
              </button>
              <button
                onClick={toggleMute}
                className="p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors"
              >
                {isMuted ? (
                  <VolumeX size={18} className="text-white" />
                ) : (
                  <Volume2 size={18} className="text-white" />
                )}
              </button>
            </div>
          )}

          {/* Title overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-lg">{config.title}</h3>
            <p className="text-white/70 text-sm">{config.subtitle}</p>
          </div>
        </div>

        {/* Actions panel - slides up when video ends */}
        <div
          className={cn(
            'bg-slate-900 transition-all duration-500 overflow-hidden',
            showActions ? 'max-h-48 p-4' : 'max-h-0 p-0'
          )}
        >
          <div className="space-y-2">
            {config.actions.map((action, idx) => (
              <Button
                key={idx}
                onClick={() => handleActionClick(action.action)}
                variant={action.primary ? 'default' : 'outline'}
                className={cn(
                  'w-full justify-between',
                  action.primary
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                    : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                )}
              >
                <span>{action.label}</span>
                {action.icon}
              </Button>
            ))}
          </div>
        </div>

        {/* Skip to actions button (visible during video) */}
        {isPlaying && !showActions && (
          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.pause();
              }
              setShowActions(true);
              setHasEnded(true);
            }}
            className="absolute bottom-28 right-4 px-3 py-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white text-xs transition-colors"
          >
            Overslaan →
          </button>
        )}
      </div>
    </div>
  );
}

// Hook for triggering Iris moments
export function useIris() {
  const [currentMoment, setCurrentMoment] = useState<IrisMoment | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showIris = (moment: IrisMoment) => {
    setCurrentMoment(moment);
    setIsVisible(true);
  };

  const hideIris = () => {
    setIsVisible(false);
    // Reset moment after animation
    setTimeout(() => setCurrentMoment(null), 300);
  };

  return {
    currentMoment,
    isVisible,
    showIris,
    hideIris,
  };
}

// Compact inline version for chat messages
interface IrisInlineProps {
  moment: IrisMoment;
  onExpand: () => void;
}

export function IrisInline({ moment, onExpand }: IrisInlineProps) {
  const config = IRIS_MOMENTS[moment];

  return (
    <button
      onClick={onExpand}
      className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl border border-slate-600 hover:border-orange-500/50 transition-all group w-full text-left"
    >
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full shadow-lg overflow-hidden relative">
          <Image
            src="/iris-avatar.jpg"
            alt="Iris"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center">
          <Play size={10} className="text-orange-500 ml-0.5" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white group-hover:text-orange-300 transition-colors text-sm">
          Iris heeft een boodschap
        </div>
        <div className="text-slate-400 text-xs truncate">{config.subtitle}</div>
      </div>
      <ChevronRight size={18} className="text-slate-500 group-hover:text-orange-500 transition-colors" />
    </button>
  );
}
