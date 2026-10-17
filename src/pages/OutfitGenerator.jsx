import React, { useState } from 'react';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { RefreshCw, Cloud, Thermometer, Wind, Share2, Sparkles, Check, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { outfits as outfitsApi } from '../lib/api';
import { resolveImageUrl, handleImageError } from '../lib/imageUrl';

const OCCASIONS = ['Casual', 'Formal', 'Gym', 'Party', 'Work', 'Date', 'College', 'Travel', 'Beach', 'Dinner'];

export default function OutfitGenerator() {
  const [occasion, setOccasion] = useState('Casual');
  const [weather, setWeather] = useState({ temperature: 22, condition: 'sunny', humidity: 60, rain: false });
  const [showWeatherInput, setShowWeatherInput] = useState(false);
  const [outfitResults, setOutfitResults] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [wearingLoading, setWearingLoading] = useState(false);
  const [wornOutfits, setWornOutfits] = useState({});
  const [error, setError] = useState('');
  const [emptyWardrobe, setEmptyWardrobe] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const navigate = useNavigate();

  const generateOutfit = async () => {
    setLoading(true);
    setError('');
    setEmptyWardrobe(false);
    setSavedMsg('');
    try {
      const result = await outfitsApi.recommend(
        occasion.toLowerCase(),
        weather,
        '',
        3
      );
      if (result.outfits && result.outfits.length > 0) {
        setOutfitResults(result.outfits);
        setCurrentIdx(0);
      } else {
        setOutfitResults([]);
        setEmptyWardrobe(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate outfit recommendation.');
    } finally {
      setLoading(false);
    }
  };

  const current = outfitResults[currentIdx] || null;

  const handleNext = () => {
    setError('');
    setSavedMsg('');
    if (currentIdx < outfitResults.length - 1) setCurrentIdx(currentIdx + 1);
    else generateOutfit(); // re-generate when out of suggestions
  };

  const getItemIds = (items) => {
    if (!Array.isArray(items)) return [];
    return items
      .map(i => {
        if (!i) return null;
        if (typeof i === 'string') return i;
        if (typeof i === 'object') {
          const val = i._id || i.id;
          if (val) return typeof val === 'object' ? (val._id || val.id || String(val)) : String(val);
        }
        return String(i);
      })
      .filter(id => id && id !== '[object Object]' && id.length >= 12);
  };

  const handleSave = async () => {
    if (!current) return;
    setError('');
    try {
      const clothingItemIds = getItemIds(current.items);
      if (clothingItemIds.length === 0) {
        throw new Error('No valid clothing items found in this outfit.');
      }
      await outfitsApi.save({
        clothingItemIds,
        occasion: occasion.toLowerCase(),
        weather,
        score: current.score,
        scoreBreakdown: current.scoreBreakdown,
        reasons: current.reasons,
        name: current.name,
      });
      setSavedMsg('Outfit saved to lookbook!');
      setTimeout(() => setSavedMsg(''), 4000);
    } catch (err) {
      setError('Failed to save: ' + (err.data?.error || err.message));
    }
  };

  const handleShare = async () => {
    if (!current) return;
    setError('');
    try {
      const clothingItemIds = getItemIds(current.items);
      const saved = await outfitsApi.save({
        clothingItemIds,
        occasion: occasion.toLowerCase(),
        weather,
        score: current.score,
        reasons: current.reasons,
        name: current.name,
      });
      const outfitId = saved._id || saved.id;
      const shareResult = await outfitsApi.share(outfitId);
      navigate(`/share/${shareResult.shareId}`);
    } catch (err) {
      navigate('/share');
    }
  };

  const handleWearToday = async () => {
    if (!current) return;
    setWearingLoading(true);
    setError('');
    setSavedMsg('');
    try {
      const clothingItemIds = getItemIds(current.items);
      if (clothingItemIds.length === 0) {
        throw new Error('No valid clothing items found in this outfit.');
      }

      const saved = await outfitsApi.save({
        clothingItemIds,
        occasion: occasion.toLowerCase(),
        weather,
        score: current.score,
        scoreBreakdown: current.scoreBreakdown,
        reasons: current.reasons,
        name: current.name,
      });

      const outfitId = saved._id || saved.id;
      if (!outfitId) {
        throw new Error('Could not retrieve outfit ID after saving.');
      }

      await outfitsApi.wear(outfitId);
      setWornOutfits(prev => ({ ...prev, [currentIdx]: true }));
      setSavedMsg('Marked as worn today! Added to calendar.');
      setTimeout(() => setSavedMsg(''), 4000);
    } catch (err) {
      setError('Failed to mark as worn: ' + (err.data?.error || err.message));
    } finally {
      setWearingLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 md:mb-8 fade-up">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-amber-400/90 font-semibold mb-2">
            Outfit Studio
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[0.95]">
            What are you<br />
            <span className="text-white/50">wearing today?</span>
          </h1>
        </div>

        {/* Weather card — clickable to edit */}
        <GlassCard
          className="p-3.5 sm:p-4 flex items-center justify-between sm:justify-start gap-3 sm:gap-4 w-full lg:w-auto cursor-pointer hover:bg-white/[0.12] transition"
          onClick={() => setShowWeatherInput(!showWeatherInput)}
          data-testid="weather-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-500/15 flex items-center justify-center border border-amber-400/30 shrink-0">
              <Cloud size={20} className="text-amber-400" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/50">Weather · Tap to edit</div>
              <div className="font-display text-xl sm:text-2xl leading-none mt-0.5 sm:mt-1">{weather.temperature}°C</div>
              <div className="text-xs text-white/60 mt-0.5 sm:mt-1">{weather.condition} · {weather.rain ? 'Rain' : 'No rain'}</div>
            </div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-white/10 mx-1" />
          <div className="text-xs space-y-1 hidden sm:block">
            <div className="flex items-center gap-1.5 text-white/70"><Thermometer size={12} strokeWidth={1.5} /> Humidity {weather.humidity}%</div>
          </div>
        </GlassCard>
      </div>

      {/* Weather editor */}
      {showWeatherInput && (
        <GlassCard className="p-4 sm:p-6 mb-6 fade-up" data-testid="weather-editor">
          <div className="text-[11px] uppercase tracking-widest text-white/50 mb-4">Edit weather conditions</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/50">Temperature (°C)</label>
              <input
                type="number"
                value={weather.temperature}
                onChange={(e) => setWeather(w => ({ ...w, temperature: parseInt(e.target.value) || 0 }))}
                className="glass-input w-full mt-2 px-4 py-3 rounded-2xl text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/50">Condition</label>
              <select
                value={weather.condition}
                onChange={(e) => setWeather(w => ({ ...w, condition: e.target.value }))}
                className="glass-input w-full mt-2 px-4 py-3 rounded-2xl text-sm bg-transparent"
              >
                {['sunny', 'cloudy', 'overcast', 'rainy', 'snowy', 'windy'].map(c => (
                  <option key={c} value={c} className="bg-gray-900">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/50">Humidity (%)</label>
              <input
                type="number"
                value={weather.humidity}
                onChange={(e) => setWeather(w => ({ ...w, humidity: parseInt(e.target.value) || 0 }))}
                className="glass-input w-full mt-2 px-4 py-3 rounded-2xl text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] uppercase tracking-wider text-white/50">Rain</label>
              <button
                onClick={() => setWeather(w => ({ ...w, rain: !w.rain }))}
                className={`mt-2 px-4 py-3 rounded-2xl text-sm border transition ${weather.rain ? 'bg-blue-500/20 border-blue-400/40 text-blue-300' : 'glass-input'}`}
              >
                {weather.rain ? '🌧 Raining' : '☀️ No rain'}
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Occasion tabs */}
      <div className="flex flex-wrap gap-2 mb-6 md:mb-8 fade-up" data-testid="occasion-tabs">
        {OCCASIONS.map((o) => (
          <button
            key={o}
            onClick={() => setOccasion(o)}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition ${
              occasion === o
                ? 'bg-white text-black shadow-[0_6px_20px_rgba(255,255,255,0.15)]'
                : 'glass hover:bg-white/15 text-white/85'
            }`}
            data-testid={`occasion-${o}`}
          >
            {o}
          </button>
        ))}
      </div>

      {/* Generate button — shown when no results yet */}
      {outfitResults.length === 0 && !loading && (
        <div className="text-center mb-8 fade-up">
          {emptyWardrobe ? (
            <div className="glass rounded-[24px] p-8">
              <AlertCircle size={32} strokeWidth={1} className="mx-auto mb-4 text-amber-400/60" />
              <p className="font-display text-xl mb-2">Not enough items in your wardrobe</p>
              <p className="text-white/60 text-sm mb-6">Add more clothing items to unlock outfit recommendations.</p>
              <button onClick={() => navigate('/add-item')} className="btn-amber">Add clothing</button>
            </div>
          ) : error ? (
            <div className="glass rounded-[24px] p-6">
              <p className="text-red-300 text-sm mb-4">{error}</p>
              <button onClick={generateOutfit} className="btn-ghost text-sm">Try again</button>
            </div>
          ) : (
            <button onClick={generateOutfit} className="btn-amber text-base px-8 py-4 flex items-center gap-3 mx-auto">
              <Sparkles size={18} strokeWidth={1.5} />
              Generate outfit for {occasion}
            </button>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <GlassCard className="p-12 text-center fade-up">
          <Loader size={32} className="text-amber-400 animate-spin mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-white/70">Finding the best outfits from your wardrobe…</p>
        </GlassCard>
      )}

      {/* Outfit display */}
      {!loading && current && (
        <GlassCard className="p-4 sm:p-8 fade-up" data-testid="outfit-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-amber-400/90 font-semibold">
                Suggestion · {occasion} · {outfitResults.length > 1 ? `${currentIdx + 1}/${outfitResults.length}` : ''}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl mt-1">{current.name}</h2>
              <div className="text-xs text-white/50 mt-1">Score: {current.score}/100</div>
            </div>
            <div className="flex gap-2 self-end sm:self-auto">
              <button
                onClick={handleShare}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full glass hover:bg-white/15 flex items-center justify-center"
                data-testid="share-outfit"
              >
                <Share2 size={16} strokeWidth={1.5} />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full glass hover:bg-white/15 flex items-center justify-center transition"
                data-testid="regenerate-btn"
              >
                <RefreshCw size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Flat-lay grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
            {current.items.map((it, i) => (
              <div
                key={it._id || it.id || i}
                className="glass rounded-[20px] overflow-hidden group hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${i * 60}ms` }}
                data-testid={`outfit-item-${it._id || it.id}`}
              >
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={resolveImageUrl(it.imageUrl)}
                    alt={it.name}
                    onError={handleImageError}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-3">
                  <div className="text-[10px] uppercase tracking-widest text-white/50">{it.category}</div>
                  <div className="text-xs sm:text-sm font-medium truncate">{it.name || it.subType || it.category}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Reasons */}
          {current.reasons && current.reasons.length > 0 && (
            <div className="glass rounded-[20px] p-4 sm:p-6 mb-6" data-testid="rationale-card">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-amber-400" strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-widest text-amber-400/90 font-semibold">
                  Stylist Notes
                </span>
              </div>
              <ul className="space-y-1">
                {current.reasons.map((r, i) => (
                  <li key={i} className="text-white/80 text-xs sm:text-sm leading-relaxed flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="text-center text-sm text-red-300 mb-4 p-3 rounded-xl bg-red-500/15 border border-red-400/30 flex items-center justify-center gap-2">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {savedMsg && (
            <div className="text-center text-sm text-emerald-300 mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center gap-2">
              <Check size={16} className="text-emerald-400 shrink-0" />
              <span>{savedMsg}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button className="btn-ghost flex items-center justify-center gap-2 text-sm" onClick={handleSave} data-testid="save-look-btn">
              Save to lookbook
            </button>
            <button
              className={`btn-amber flex items-center justify-center gap-2 text-sm transition-all ${
                wornOutfits[currentIdx] ? '!bg-emerald-500 !text-white border-emerald-400' : ''
              }`}
              onClick={handleWearToday}
              disabled={wearingLoading || !!wornOutfits[currentIdx]}
              data-testid="wear-today-btn"
            >
              {wearingLoading ? (
                <>
                  <Loader size={16} className="animate-spin" /> Marking as worn…
                </>
              ) : wornOutfits[currentIdx] ? (
                <>
                  <Check size={16} strokeWidth={2} /> Marked Worn Today
                </>
              ) : (
                <>
                  <Check size={16} strokeWidth={2} /> Wear today
                </>
              )}
            </button>
          </div>
        </GlassCard>
      )}
    </Layout>
  );
}
