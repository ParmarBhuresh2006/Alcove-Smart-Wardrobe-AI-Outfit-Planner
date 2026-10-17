import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Shirt, Wand2, Calendar, PieChart, Luggage, Settings } from 'lucide-react';

const items = [
  { key: 'home', to: '/dashboard', icon: Home, label: 'Home' },
  { key: 'wardrobe', to: '/dashboard#wardrobe', icon: Shirt, label: 'Wardrobe' },
  { key: 'outfit', to: '/generator', icon: Wand2, label: 'Generator' },
  { key: 'calendar', to: '/calendar', icon: Calendar, label: 'Calendar' },
  { key: 'gap', to: '/gap-analysis', icon: PieChart, label: 'Gap Analysis' },
  { key: 'trip', to: '/trip', icon: Luggage, label: 'Trip Packing' },
  { key: 'settings', to: '/profile', icon: Settings, label: 'Settings' },
];

export default function LeftRail() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <aside
      className="glass-strong fixed bottom-3 inset-x-0 mx-auto w-[calc(100%-1.5rem)] max-w-md flex flex-row items-center justify-around py-2 px-2 rounded-full z-50 md:top-1/4 md:-translate-y-1/3 md:bottom-auto md:left-6 md:right-auto md:w-auto md:max-w-none md:flex-col md:gap-2 md:py-5 md:px-2 md:rounded-[28px] md:glass fade-up"
      data-testid="left-rail"
    >
      {items.map(({ key, to, icon: Icon, label }) => {
        const active = location.pathname === to.split('#')[0];
        return (
          <button
            key={key}
            onClick={() => navigate(to.split('#')[0])}
            className={`group relative w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 ${active
              ? 'bg-amber-500/90 shadow-[0_0_24px_rgba(245,158,11,0.4)]'
              : 'hover:bg-white/12'
              }`}
            data-testid={`rail-${key}`}
            aria-label={label}
          >
            <Icon
              size={18}
              strokeWidth={1.5}
              className={`md:w-[20px] md:h-[20px] ${active ? 'text-black' : 'text-white/80'}`}
            />
            <span className="pointer-events-none absolute bottom-full mb-2 md:bottom-auto md:left-full md:ml-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-xs text-white opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-white/10">
              {label}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
