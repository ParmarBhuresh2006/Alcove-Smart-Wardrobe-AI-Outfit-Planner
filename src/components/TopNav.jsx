import React from 'react';
import { Search, Bell, Sparkles, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopNav() {
  const navigate = useNavigate();
  return (
    <nav
      className="glass fixed top-3 md:top-6 left-1/2 -translate-x-1/2 inset-x-0 mx-auto w-[calc(100%-2rem)] md:w-[calc(100%-160px)] max-w-5xl h-14 md:h-16 rounded-full flex items-center justify-between px-3 md:px-5 z-50 fade-up-center"
      data-testid="top-nav"
    >
      <div className="flex items-center gap-2.5 sm:gap-3 pl-1 sm:pl-2 shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
          <Sparkles size={16} className="text-black" strokeWidth={2} />
        </div>
        <span className="font-display font-semibold text-base sm:text-lg tracking-tight hidden sm:block">
          Alcove
        </span>
      </div>

      <div className="flex items-center flex-1 min-w-0 max-w-md mx-2 sm:mx-4">
        <div className="w-full flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10">
          <Search size={15} className="text-white/60 shrink-0" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search wardrobe…"
            className="bg-transparent outline-none w-full min-w-0 text-xs sm:text-sm placeholder:text-white/40 text-white"
            data-testid="top-nav-search"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 pr-1 shrink-0">
        <button
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition"
          data-testid="top-nav-notifications"
          aria-label="Notifications"
        >
          <Bell size={17} className="text-white/80" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition"
          data-testid="top-nav-profile"
          aria-label="Profile"
        >
          <User size={17} className="text-white/90" strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  );
}
