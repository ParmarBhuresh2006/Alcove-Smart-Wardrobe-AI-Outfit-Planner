import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { ChevronLeft, ChevronRight, X, Heart, Calendar as CalendarIcon, Sparkles, Loader } from 'lucide-react';
import { calendar as calendarApi } from '../lib/api';
import { resolveImageUrl, handleImageError } from '../lib/imageUrl';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-12
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Grid calculation for Monday-start week
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayObj = new Date(year, month - 1, 1);
  const rawFirstDay = firstDayObj.getDay(); // 0 = Sun, 1 = Mon ...
  const offset = (rawFirstDay + 6) % 7;

  useEffect(() => {
    async function loadCalendar() {
      setLoading(true);
      setSelected(null);
      try {
        const data = await calendarApi.get(year, month);
        setEntries(data.entries || {});
      } catch (err) {
        console.error('Failed to load calendar data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCalendar();
  }, [year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const selectedEntry = selected ? entries[selected] : null;

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6 md:mb-8 fade-up">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-amber-400/90 font-semibold mb-2 flex items-center gap-1.5">
            <CalendarIcon size={14} className="text-amber-400" /> Wear History
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[0.95]">
            {monthName} {year}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full glass hover:bg-white/15 flex items-center justify-center transition"
            data-testid="cal-prev"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={handleToday}
            className="btn-ghost !py-2 text-xs sm:text-sm font-medium"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full glass hover:bg-white/15 flex items-center justify-center transition"
            data-testid="cal-next"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GlassCard
          className={`p-3 sm:p-6 ${selectedEntry ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-500`}
          data-testid="calendar-card"
        >
          <div className="grid grid-cols-7 gap-1 sm:gap-3 mb-2 sm:mb-3">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/40 text-center py-1 sm:py-2"
              >
                {d}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="py-24 text-center">
              <Loader size={28} className="text-amber-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-white/50">Fetching wear history from database…</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1 sm:gap-3">
              {Array.from({ length: offset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const entry = entries[day];
                const isSel = selected === day;
                const mainImage = entry?.image || entry?.items?.[0]?.imageUrl;

                return (
                  <button
                    key={day}
                    onClick={() => entry && setSelected(day)}
                    className={`relative aspect-square rounded-xl sm:rounded-2xl border transition-all duration-300 overflow-hidden group ${
                      entry
                        ? 'border-amber-400/40 hover:border-amber-400 hover:-translate-y-0.5 shadow-lg cursor-pointer'
                        : 'border-white/8 opacity-60 cursor-default'
                    } ${isSel ? 'ring-2 ring-amber-400 border-amber-400' : ''}`}
                    data-testid={`day-${day}`}
                  >
                    {entry ? (
                      <>
                        <img
                          src={resolveImageUrl(mainImage)}
                          alt={entry.name || 'Worn Item'}
                          onError={handleImageError}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute top-1 left-1.5 sm:top-1.5 sm:left-2 text-[10px] sm:text-xs font-semibold text-white">
                          {day}
                        </div>
                        <div className="absolute bottom-1 left-1 right-1 sm:bottom-1.5 sm:left-2 sm:right-2 text-[8px] sm:text-[10px] text-amber-300 truncate font-medium hidden xs:block">
                          {entry.category || entry.occasion || 'Worn'}
                        </div>
                      </>
                    ) : (
                      <div className="absolute top-1 left-1.5 sm:top-1.5 sm:left-2 text-[10px] sm:text-xs text-white/40">
                        {day}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-4 mt-6 text-xs text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]" /> Logged in database
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white/20" /> No wear logged
            </div>
          </div>
        </GlassCard>

        {selectedEntry && (
          <GlassCard className="p-4 sm:p-6 lg:col-span-4 fade-up" data-testid="day-detail">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-amber-400/90 font-semibold">
                  {monthName} {selected}, {year}
                </div>
                <div className="font-display text-2xl sm:text-3xl">Worn Outfit</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Display main item image */}
            <div className="rounded-[20px] overflow-hidden aspect-square mb-4 relative">
              <img
                src={resolveImageUrl(selectedEntry.image || selectedEntry.items?.[0]?.imageUrl)}
                alt={selectedEntry.name}
                onError={handleImageError}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-amber-300 font-semibold">
                    {selectedEntry.category || 'Clothing Item'}
                  </div>
                  <div className="font-display text-lg sm:text-xl">
                    {selectedEntry.name || 'Worn Item'}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full glass flex items-center justify-center">
                  <Sparkles size={14} className="text-amber-400" />
                </div>
              </div>
            </div>

            {/* Worn Items List if multiple */}
            {selectedEntry.items && selectedEntry.items.length > 1 && (
              <div className="mb-4">
                <div className="text-[10px] uppercase tracking-widest text-white/50 mb-2">
                  Items in this outfit ({selectedEntry.items.length})
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {selectedEntry.items.map((it, idx) => (
                    <div key={it._id || idx} className="rounded-xl overflow-hidden glass aspect-square relative group">
                      <img
                        src={resolveImageUrl(it.imageUrl)}
                        alt={it.name}
                        onError={handleImageError}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-[9px] truncate text-center">
                        {it.name || it.category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="text-[10px] uppercase tracking-widest text-white/50">Occasion</div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-medium">
                  {selectedEntry.occasion || 'Casual'}
                </span>
              </div>

              {selectedEntry.notes && (
                <>
                  <div className="text-[10px] uppercase tracking-widest text-white/50 pt-2">Notes</div>
                  <p className="text-sm text-white/75 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                    {selectedEntry.notes}
                  </p>
                </>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </Layout>
  );
}
