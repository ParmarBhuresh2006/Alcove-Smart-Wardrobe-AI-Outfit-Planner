import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { MapPin, Calendar, Sparkles, Check, Plus, Loader, Trash2, AlertCircle } from 'lucide-react';
import { trips as tripsApi, wardrobe as wardrobeApi } from '../lib/api';
import { resolveImageUrl, handleImageError } from '../lib/imageUrl';

export default function TripPacking() {
  const [destination, setDestination] = useState('Lisbon, Portugal');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [occasions, setOccasions] = useState(['Casual', 'Dinner', 'Beach']);
  const [newOccasion, setNewOccasion] = useState('');
  const [showAddOccasion, setShowAddOccasion] = useState(false);

  const [activeTrip, setActiveTrip] = useState(null);
  const [packingList, setPackingList] = useState([]);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [customItemName, setCustomItemName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Load existing trips & wardrobe items from database on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [tripsRes, wardrobeRes] = await Promise.all([
          tripsApi.list().catch(() => ({ trips: [] })),
          wardrobeApi.list().catch(() => ({ items: [] })),
        ]);

        const items = wardrobeRes.items || [];
        setWardrobeItems(items);

        if (tripsRes.trips && tripsRes.trips.length > 0) {
          const latest = tripsRes.trips[0];
          setActiveTrip(latest);
          setDestination(latest.destination);
          if (latest.occasions) setOccasions(latest.occasions);
          setPackingList(latest.packingList || []);
        } else if (items.length > 0) {
          // Generate default packing list from user wardrobe items
          generateLocalPackingList(items, ['Casual', 'Dinner', 'Beach']);
        }
      } catch (err) {
        console.error('Failed to load trip packing data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Generate fallback packing list from user's database wardrobe
  const generateLocalPackingList = (items, selectedOccasions) => {
    if (!items || items.length === 0) return;
    const list = items.slice(0, 8).map((it, idx) => ({
      clothingItemId: it._id || it.id,
      name: it.name || it.subType || it.category,
      category: it.category || 'Clothing',
      imageUrl: it.imageUrl,
      quantity: 1,
      packed: idx < 2,
    }));
    setPackingList(list);
  };

  const handleGenerateTrip = async () => {
    setGenerating(true);
    setError('');
    try {
      const trip = await tripsApi.create({
        destination,
        startDate,
        endDate,
        occasions,
      });
      setActiveTrip(trip);
      setPackingList(trip.packingList || []);
    } catch (err) {
      setError(err.message || 'Failed to generate packing list.');
      // Fallback to local user wardrobe if API fails
      generateLocalPackingList(wardrobeItems, occasions);
    } finally {
      setGenerating(false);
    }
  };

  const togglePacked = async (idx) => {
    const updated = packingList.map((item, i) =>
      i === idx ? { ...item, packed: !item.packed } : item
    );
    setPackingList(updated);

    if (activeTrip && activeTrip._id) {
      try {
        await tripsApi.update(activeTrip._id, { packingList: updated });
      } catch (err) {
        console.error('Failed to update packed status:', err);
      }
    }
  };

  const handleAddOccasion = () => {
    if (newOccasion.trim() && !occasions.includes(newOccasion.trim())) {
      setOccasions([...occasions, newOccasion.trim()]);
      setNewOccasion('');
      setShowAddOccasion(false);
    }
  };

  const handleAddCustomItem = () => {
    if (!customItemName.trim()) return;
    const newItem = {
      clothingItemId: null,
      name: customItemName.trim(),
      category: 'Accessories',
      imageUrl: null,
      quantity: 1,
      packed: false,
      isCustom: true,
    };
    const updated = [...packingList, newItem];
    setPackingList(updated);
    setCustomItemName('');
    setShowCustomInput(false);

    if (activeTrip && activeTrip._id) {
      tripsApi.update(activeTrip._id, { packingList: updated }).catch(console.error);
    }
  };

  const packedCount = packingList.filter((i) => i.packed || i.checked).length;
  const totalCount = packingList.length;

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6 md:mb-8 fade-up">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-amber-400/90 font-semibold mb-2">
            Trip Planner · Smart Capsule
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[0.95]">
            Pack for<br />
            <span className="text-white/50">the journey.</span>
          </h1>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-[11px] uppercase tracking-widest text-white/50">Packed</div>
          <div className="font-display text-3xl sm:text-4xl">
            {packedCount}<span className="text-white/40">/{totalCount}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-2xl bg-red-500/15 border border-red-400/30 text-red-300 text-sm fade-up">
          <AlertCircle size={16} strokeWidth={1.5} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Trip form */}
      <GlassCard className="p-4 sm:p-6 mb-8 fade-up" data-testid="trip-form">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Destination</label>
            <div className="relative mt-2">
              <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" strokeWidth={1.5} />
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Paris, France"
                className="glass-input w-full pl-10 pr-4 py-3 rounded-2xl text-sm"
                data-testid="input-destination"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/50">Start Date</label>
            <div className="relative mt-2">
              <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" strokeWidth={1.5} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-3 rounded-2xl text-sm"
                data-testid="input-dates"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/50">Occasions</label>
            <div className="flex gap-1.5 mt-2 flex-wrap items-center">
              {occasions.map((o) => (
                <span key={o} className="px-3 py-1.5 rounded-full bg-amber-500 text-black text-xs font-medium">
                  {o}
                </span>
              ))}
              {showAddOccasion ? (
                <div className="flex items-center gap-1">
                  <input
                    value={newOccasion}
                    onChange={(e) => setNewOccasion(e.target.value)}
                    placeholder="New..."
                    className="glass-input px-2 py-1 text-xs rounded-full w-20"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddOccasion()}
                  />
                  <button onClick={handleAddOccasion} className="text-xs text-amber-400 font-bold">+</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddOccasion(true)}
                  className="w-7 h-7 rounded-full bg-white/8 border border-white/15 flex items-center justify-center hover:bg-white/15 transition"
                >
                  <Plus size={12} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70">
            <Sparkles size={14} className="text-amber-400 shrink-0" strokeWidth={1.5} />
            <span>
              {wardrobeItems.length > 0
                ? `Packing smart capsule from your ${wardrobeItems.length} wardrobe items.`
                : 'Add clothing items to your wardrobe for personalized recommendations.'}
            </span>
          </div>
          <div className="flex-1" />
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleGenerateTrip}
              disabled={generating}
              className="btn-amber text-sm flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              {generating ? (
                <Loader size={14} className="animate-spin" />
              ) : (
                <>
                  <Check size={14} strokeWidth={2} /> Save & Generate Capsule
                </>
              )}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Checklist */}
      <GlassCard className="p-4 sm:p-6 fade-up" data-testid="packing-list">
        <div className="flex items-center justify-between mb-5 gap-3">
          <div className="text-[11px] uppercase tracking-widest text-white/50 shrink-0">
            Packing checklist ({totalCount} items from your closet)
          </div>
          <div className="h-1.5 w-28 sm:w-40 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: totalCount > 0 ? `${(packedCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader size={28} className="text-amber-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-white/50">Loading database wardrobe items…</p>
          </div>
        ) : packingList.length === 0 ? (
          <div className="text-center py-12 text-white/50">
            <Sparkles size={28} className="text-amber-400/50 mx-auto mb-3" />
            <p className="font-display text-lg">No clothes packed yet</p>
            <p className="text-xs mt-1">Click "Save & Generate Capsule" to build a packing list from your wardrobe database.</p>
          </div>
        ) : (
          <div className="space-y-2 stagger">
            {packingList.map((item, idx) => {
              const isPacked = item.packed || item.checked;
              return (
                <label
                  key={item.clothingItemId || item._id || idx}
                  onClick={(e) => {
                    e.preventDefault();
                    togglePacked(idx);
                  }}
                  className={`flex items-center gap-3 sm:gap-4 p-3 rounded-2xl border transition cursor-pointer ${
                    isPacked
                      ? 'bg-amber-500/10 border-amber-400/30 opacity-75'
                      : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
                  }`}
                  data-testid={`pack-${item.clothingItemId || idx}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition shrink-0 ${
                      isPacked
                        ? 'bg-amber-500 border-amber-400'
                        : 'bg-white/5 border-white/25 hover:border-white/45'
                    }`}
                  >
                    {isPacked && <Check size={13} className="text-black" strokeWidth={2.5} />}
                  </div>

                  <img
                    src={resolveImageUrl(item.imageUrl)}
                    alt={item.name}
                    onError={handleImageError}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-white/15 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm sm:text-base truncate ${isPacked ? 'line-through text-white/60' : ''}`}>
                      {item.name}
                    </div>
                    <div className="text-xs text-white/50 truncate">
                      {item.category || 'Clothing'} {item.isCustom ? '· Custom' : '· Wardrobe Item'}
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-white/70 shrink-0">×{item.quantity || 1}</div>
                </label>
              );
            })}
          </div>
        )}

        {showCustomInput ? (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="e.g. Passport, Sunglasses, Umbrella..."
              value={customItemName}
              onChange={(e) => setCustomItemName(e.target.value)}
              className="glass-input flex-1 px-4 py-2.5 rounded-2xl text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomItem()}
            />
            <button onClick={handleAddCustomItem} className="btn-amber px-4 text-xs">Add</button>
            <button onClick={() => setShowCustomInput(false)} className="btn-ghost px-3 text-xs">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setShowCustomInput(true)}
            className="mt-5 w-full py-3 rounded-2xl border border-dashed border-white/20 text-sm text-white/60 hover:text-white hover:border-white/40 transition flex items-center justify-center gap-2"
          >
            <Plus size={14} strokeWidth={1.5} /> Add custom item
          </button>
        )}
      </GlassCard>
    </Layout>
  );
}
