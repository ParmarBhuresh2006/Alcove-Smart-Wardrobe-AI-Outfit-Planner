import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { Plus, Search, Filter, Sun, Cloud, MoreHorizontal, TrendingUp, Sparkles, Check, RotateCcw, Edit3, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { wardrobe as wardrobeApi } from '../lib/api';
import { resolveImageUrl, handleImageError } from '../lib/imageUrl';

const TABS = ['Overview', 'Gap Analysis', 'Wear History'];

const CATEGORY_KEYS = ['tops', 'bottoms', 'outerwear', 'shoes', 'dresses', 'accessories'];
const CATEGORY_LABELS = {
  tops: 'Tops', bottoms: 'Bottoms', outerwear: 'Outerwear',
  shoes: 'Shoes', dresses: 'Dresses', accessories: 'Accessories',
};

export default function Dashboard() {
  const [tab, setTab] = useState('Overview');
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [wardrobeData, analysisData] = await Promise.all([
          wardrobeApi.list(),
          wardrobeApi.getAnalysis(),
        ]);
        setItems(wardrobeData.items || []);
        setAnalysis(analysisData);
      } catch (err) {
        console.error('Failed to load wardrobe:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Toggle Worn / Remove from Worn
  const handleToggleWorn = async (e, item) => {
    e.stopPropagation();
    setActiveMenuId(null);
    const isCurrentlyWorn = (item.wornCount || 0) > 0 || !!item.lastWorn;

    let newWornCount;
    let newLastWorn;

    if (isCurrentlyWorn) {
      newWornCount = Math.max(0, (item.wornCount || 1) - 1);
      newLastWorn = newWornCount === 0 ? null : item.lastWorn;
    } else {
      newWornCount = (item.wornCount || 0) + 1;
      newLastWorn = new Date().toISOString();
    }

    // Optimistic state update
    setItems((prev) =>
      prev.map((i) =>
        (i._id === item._id || i.id === item.id)
          ? {
              ...i,
              wornCount: newWornCount,
              lastWorn: newLastWorn,
              lastWornText: newWornCount === 0 ? 'Never' : 'today',
            }
          : i
      )
    );

    try {
      await wardrobeApi.update(item._id || item.id, {
        wornCount: newWornCount,
        lastWorn: newLastWorn,
      });
    } catch (err) {
      console.error('Failed to update worn status:', err);
    }
  };

  // Delete Item
  const handleDeleteItem = async (e, itemId) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setItems((prev) => prev.filter((i) => (i._id || i.id) !== itemId));
    try {
      await wardrobeApi.delete(itemId);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  // Filter items
  const filtered = items.filter((item) => {
    const matchCategory = filter === 'all' || item.category === filter;
    const matchSearch = !searchQuery ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.primaryColor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subType?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const totalItems = items.length;
  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Featured item (most worn available item)
  const featured = [...items].filter(i => i.status === 'available').sort((a, b) => (b.wornCount || 0) - (a.wornCount || 0))[0];

  return (
    <Layout>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6 md:mb-8 fade-up">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-amber-400/90 font-semibold mb-2">
            {greeting}, {firstName}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[0.95] tracking-tight">
            Your wardrobe,<br />
            <span className="text-white/50">at a glance.</span>
          </h1>
        </div>
        <button
          onClick={() => navigate('/add-item')}
          className="btn-amber flex items-center gap-2 text-sm sm:text-base"
          data-testid="add-item-btn"
        >
          <Plus size={16} strokeWidth={2} /> Add item
        </button>
      </div>

      {/* Hero glass panel */}
      <GlassCard className="p-5 sm:p-8 mb-8 md:mb-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 fade-up" data-testid="hero-panel">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap gap-2 mb-6" data-testid="hero-tabs">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider transition ${
                  tab === t
                    ? 'bg-white text-black font-semibold'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                }`}
                data-testid={`hero-tab-${t}`}
              >
                {t}
              </button>
            ))}
          </div>

          {featured ? (
            <>
              <div className="text-[11px] uppercase tracking-[0.15em] text-white/50 mb-2">
                Most worn this month
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl mb-4 leading-tight">
                {featured.name || 'Your favourite piece'} is leading your rotation
              </h2>
              <p className="text-white/70 leading-relaxed max-w-lg mb-6 text-xs sm:text-sm">
                You've worn it {featured.wornCount || 0} times. It's a wardrobe staple — pair it with complementary items
                for new combinations.
              </p>
            </>
          ) : (
            <>
              <div className="text-[11px] uppercase tracking-[0.15em] text-white/50 mb-2">
                Welcome to your wardrobe
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl mb-4 leading-tight">
                Start building your closet
              </h2>
              <p className="text-white/70 leading-relaxed max-w-lg mb-6 text-xs sm:text-sm">
                Upload clothing photos and let the AI analyze and tag them automatically. Then get outfit recommendations.
              </p>
            </>
          )}

          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 max-w-md">
            {[
              { label: 'Items', value: loading ? '…' : String(totalItems), icon: Sparkles },
              { label: 'Categories', value: loading ? '…' : String(analysis ? Object.values(analysis.categories || {}).filter(c => c.count > 0).length : 0), icon: TrendingUp },
              { label: 'Available', value: loading ? '…' : String(items.filter(i => i.status === 'available').length), icon: Sun },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-2.5 sm:p-3">
                <s.icon size={14} className="text-amber-400 mb-1.5 sm:mb-2" strokeWidth={1.5} />
                <div className="font-display text-xl sm:text-2xl">{s.value}</div>
                <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/50 mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 relative rounded-[20px] overflow-hidden min-h-[260px] sm:min-h-[320px]">
          <img
            src={resolveImageUrl(featured?.imageUrl)}
            alt={featured?.name || 'Featured Item'}
            onError={handleImageError}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-amber-300/90">
                {featured ? `Item · ${CATEGORY_LABELS[featured.category] || featured.category}` : 'Wardrobe'}
              </div>
              <div className="font-display text-lg sm:text-xl mt-1">
                {featured?.name || 'Add your first item'}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 fade-up" data-testid="filter-bar">
        <div className="glass rounded-full flex items-center gap-2 px-4 py-2 flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="text-white/60 shrink-0" strokeWidth={1.5} />
          <input
            placeholder="Filter your items…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-sm placeholder:text-white/40 min-w-0"
          />
        </div>
        <div className="glass rounded-full flex gap-1 p-1 overflow-x-auto max-w-full">
          {['all', ...CATEGORY_KEYS].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${
                filter === c ? 'bg-amber-500 text-black' : 'text-white/70 hover:text-white'
              }`}
              data-testid={`filter-${c}`}
            >
              {c === 'all' ? 'All' : CATEGORY_LABELS[c] || c}
            </button>
          ))}
        </div>
      </div>

      {/* Wardrobe grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {[1,2,3,4].map(i => (
            <div key={i} className="glass rounded-[24px] overflow-hidden animate-pulse">
              <div className="aspect-square bg-white/10" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-white/10 rounded w-1/2" />
                <div className="h-4 bg-white/10 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/50">
          <Sparkles size={32} strokeWidth={1} className="mx-auto mb-4 text-amber-400/40" />
          <p className="text-lg font-display">
            {items.length === 0 ? 'Your wardrobe is empty' : 'No items match this filter'}
          </p>
          <p className="text-sm mt-2">
            {items.length === 0 ? 'Click "Add item" to upload your first clothing photo.' : 'Try a different category or clear your search.'}
          </p>
          {items.length === 0 && (
            <button onClick={() => navigate('/add-item')} className="btn-amber mt-6 flex items-center gap-2 mx-auto">
              <Plus size={16} strokeWidth={2} /> Add first item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 stagger" data-testid="wardrobe-grid">
          {filtered.map((item) => {
            const itemId = item._id || item.id;
            const isWorn = (item.wornCount || 0) > 0 || !!item.lastWorn;

            return (
              <GlassCard key={itemId} hover className="overflow-hidden group cursor-pointer relative" data-testid={`item-${itemId}`}>
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={resolveImageUrl(item.imageUrl)}
                    alt={item.name}
                    onError={handleImageError}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ${
                        item.status === 'laundry'
                          ? 'bg-amber-500/90 text-black'
                          : 'bg-white/20 backdrop-blur-md text-white border border-white/30'
                      }`}
                    >
                      {item.status === 'laundry' ? 'In laundry' : 'Available'}
                    </span>
                  </div>

                  {/* 3-dots button and popup dropdown */}
                  <div className="absolute top-3 right-3 z-30">
                    <button
                      className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === itemId ? null : itemId);
                      }}
                      data-testid={`menu-btn-${itemId}`}
                    >
                      <MoreHorizontal size={14} strokeWidth={1.5} />
                    </button>

                    {activeMenuId === itemId && (
                      <div
                        className="absolute top-10 right-0 w-44 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 p-1.5 text-xs text-white fade-up"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => handleToggleWorn(e, item)}
                          className="w-full px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-amber-500/20 hover:text-amber-300 transition text-left font-medium"
                          data-testid="toggle-worn-btn"
                        >
                          {isWorn ? (
                            <>
                              <RotateCcw size={13} className="text-amber-400 shrink-0" />
                              <span>Remove from worn</span>
                            </>
                          ) : (
                            <>
                              <Check size={13} className="text-amber-400 shrink-0" />
                              <span>Mark as worn</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            navigate(`/add-item?edit=${itemId}`);
                          }}
                          className="w-full px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition text-left"
                        >
                          <Edit3 size={13} className="text-white/70 shrink-0" />
                          <span>Edit item</span>
                        </button>

                        <button
                          onClick={(e) => handleDeleteItem(e, itemId)}
                          className="w-full px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-red-500/20 hover:text-red-300 transition text-left text-red-400"
                        >
                          <Trash2 size={13} className="shrink-0" />
                          <span>Delete item</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-[10px] uppercase tracking-widest text-white/50 mb-1">
                    {CATEGORY_LABELS[item.category] || item.category}
                  </div>
                  <div className="font-display text-base">{item.name || item.subType || item.category}</div>
                  <div className="flex items-center justify-between mt-3 text-[11px] text-white/60">
                    <span>Worn {item.wornCount || 0}×</span>
                    <span>{item.lastWornText || (item.lastWorn ? new Date(item.lastWorn).toLocaleDateString() : 'Never')}</span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
