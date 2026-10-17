import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { Sparkles, TrendingDown, TrendingUp, ShoppingBag, Loader } from 'lucide-react';
import { wardrobe as wardrobeApi } from '../lib/api';

export default function GapAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wardrobeApi.getAnalysis()
      .then(setAnalysis)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <Loader size={28} className="text-amber-400 animate-spin" strokeWidth={1.5} />
        </div>
      </Layout>
    );
  }

  const categories = analysis?.categories ? Object.entries(analysis.categories) : [];
  const recommendations = analysis?.recommendations || [];
  const gapSummary = analysis?.gapSummary || 'Loading wardrobe analysis…';

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6 md:mb-8 fade-up">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-amber-400/90 font-semibold mb-2">
            Wardrobe Insights
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[0.95]">
            Where are<br />
            <span className="text-white/50">the gaps?</span>
          </h1>
        </div>
        <button className="btn-ghost flex items-center gap-2 text-xs sm:text-sm">
          <ShoppingBag size={14} strokeWidth={1.5} /> Shopping list
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GlassCard className="p-4 sm:p-6 lg:col-span-7" data-testid="gap-list">
          <div className="text-[11px] uppercase tracking-widest text-white/50 mb-5">
            Category coverage
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <p>No wardrobe data yet. Add items to see your gap analysis.</p>
            </div>
          ) : (
            <div className="space-y-3 stagger">
              {categories.map(([key, c]) => {
                const pct = c.coverage || Math.min(100, Math.round((c.count / c.target) * 100));
                const isGap = pct < 60;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition"
                    data-testid={`category-row-${key}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-display text-base sm:text-lg truncate">{c.label || key}</span>
                          {isGap ? (
                            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-400 font-semibold shrink-0">
                              <TrendingDown size={11} strokeWidth={2} /> gap
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-400/90 font-semibold shrink-0">
                              <TrendingUp size={11} strokeWidth={2} /> healthy
                            </span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-white/70 shrink-0">
                          <span className="text-white font-medium">{c.count}</span>
                          <span className="text-white/40"> / {c.target}</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isGap
                              ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                              : 'bg-white/50'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="p-4 sm:p-6" data-testid="ai-summary">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                <Sparkles size={16} className="text-amber-400" strokeWidth={1.5} />
              </div>
              <div>
                <div className="font-display text-lg">Stylist summary</div>
                <div className="text-[11px] text-white/50">
                  {analysis ? `${analysis.totalItems} items analyzed` : 'Loading…'}
                </div>
              </div>
            </div>
            <p className="text-white/80 leading-relaxed text-xs sm:text-sm">{gapSummary}</p>
          </GlassCard>

          <GlassCard className="p-4 sm:p-6" data-testid="recommendations">
            <div className="text-[11px] uppercase tracking-widest text-white/50 mb-4">
              Top recommendations
            </div>
            {recommendations.length === 0 ? (
              <p className="text-white/40 text-sm">No recommendations yet. Add more items.</p>
            ) : (
              <div className="space-y-3">
                {recommendations.slice(0, 5).map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10 gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{r.name}</div>
                      <div className="text-xs text-white/60 mt-0.5 truncate">{r.reason}</div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold shrink-0 ${
                        r.priority === 'High'
                          ? 'bg-amber-500 text-black'
                          : 'bg-white/10 border border-white/20 text-white/70'
                      }`}
                    >
                      {r.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </Layout>
  );
}
