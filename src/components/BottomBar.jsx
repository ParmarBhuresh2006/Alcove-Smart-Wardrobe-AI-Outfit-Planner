import React from 'react';
import { Play, Shuffle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BottomBar() {
  const navigate = useNavigate();
  return (
    <div
      className="glass-strong fixed bottom-[72px] md:bottom-6 left-1/2 -translate-x-1/2 mx-auto w-max max-w-[calc(100%-1.5rem)] flex items-center justify-between sm:justify-start gap-2 sm:gap-4 px-3 sm:pl-3 sm:pr-5 py-2.5 sm:py-3 rounded-full z-40 fade-up-center"
      style={{ animationDelay: '0.4s' }}
      data-testid="bottom-bar"
    >
      <div className="hidden sm:block">
        <div className="text-[11px] uppercase tracking-[0.15em] text-amber-400/90 font-semibold">
          Today
        </div>
        <div className="text-sm text-white/90 font-medium">What are you wearing?</div>
      </div>
      <div className="hidden sm:block w-px h-8 bg-white/15 mx-1" />
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition"
          data-testid="bottom-bar-like"
          aria-label="Like outfit"
        >
          <Heart size={15} className="text-white/80" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => navigate('/generator')}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition"
          data-testid="bottom-bar-shuffle"
          aria-label="Shuffle outfit"
        >
          <Shuffle size={15} className="text-white/80" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => navigate('/generator')}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center transition shadow-[0_0_20px_rgba(245,158,11,0.5)]"
          data-testid="bottom-bar-play"
          aria-label="Get outfit"
        >
          <Play size={15} className="text-black ml-0.5" fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
