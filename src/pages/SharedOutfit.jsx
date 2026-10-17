import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Sparkles, Send, Share2, Loader, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { outfits as outfitsApi, wardrobe as wardrobeApi } from '../lib/api';
import { resolveImageUrl, handleImageError } from '../lib/imageUrl';

export default function SharedOutfit() {
  const { id, shareId } = useParams();
  const targetShareId = id || shareId;
  const navigate = useNavigate();

  const [outfitData, setOutfitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vote, setVote] = useState(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadOutfit() {
      setLoading(true);
      try {
        if (targetShareId) {
          // Load public shared outfit from database
          const data = await outfitsApi.getShared(targetShareId);
          setOutfitData(data);
        } else {
          // Load latest generated outfit from user's database
          const savedRes = await outfitsApi.list().catch(() => ({ outfits: [] }));
          if (savedRes.outfits && savedRes.outfits.length > 0) {
            setOutfitData(savedRes.outfits[0]);
          } else {
            // Load user wardrobe items from database to display user outfit
            const wardrobeRes = await wardrobeApi.list().catch(() => ({ items: [] }));
            const items = wardrobeRes.items || [];
            if (items.length > 0) {
              setOutfitData({
                name: 'Generated Wardrobe Outfit',
                occasion: 'Casual',
                clothingItems: items.slice(0, 4),
                reasons: ['Curated from your database wardrobe items'],
              });
            } else {
              setOutfitData(null);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load shared outfit:', err);
        setOutfitData(null);
      } finally {
        setLoading(false);
      }
    }
    loadOutfit();
  }, [targetShareId]);

  const handleSubmitFeedback = async () => {
    if (!vote) return;
    try {
      if (targetShareId) {
        await outfitsApi.sharedFeedback(targetShareId, vote, note);
      }
    } catch (err) {
      console.error('Feedback submit error:', err);
    } finally {
      setSubmitted(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const itemsToDisplay = outfitData?.clothingItems || [];
  const title = outfitData?.name || 'Shared Outfit';
  const occasion = outfitData?.occasion || 'Casual';

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center px-6 py-16 text-white" data-testid="shared-page">
      <div className="app-bg" />
      <div className="app-grain" />

      <div className="w-full max-w-2xl fade-up">
        {/* Brand chip */}
        <div className="flex items-center justify-between mb-6">
          <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
              <Sparkles size={11} className="text-black" strokeWidth={2} />
            </div>
            <span className="font-display font-semibold text-sm">Alcove Smart Wardrobe</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="glass rounded-full px-3 py-2 flex items-center gap-2 text-xs hover:bg-white/15 transition"
          >
            <Share2 size={12} strokeWidth={1.5} /> {copied ? 'Link copied!' : 'Copy link'}
          </button>
        </div>

        {loading ? (
          <div className="glass rounded-[28px] p-12 text-center">
            <Loader size={28} className="text-amber-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-white/60">Fetching outfit from database…</p>
          </div>
        ) : !outfitData || itemsToDisplay.length === 0 ? (
          <div className="glass rounded-[28px] p-10 text-center">
            <AlertCircle size={32} className="text-amber-400 mx-auto mb-3" strokeWidth={1.5} />
            <h2 className="font-display text-2xl mb-2">No outfit found</h2>
            <p className="text-white/60 text-sm mb-6">
              Generate and share an outfit from your wardrobe studio.
            </p>
            <button onClick={() => navigate('/generator')} className="btn-amber">
              Go to Outfit Studio
            </button>
          </div>
        ) : (
          <div className="glass rounded-[28px] p-5 sm:p-8" data-testid="shared-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-[10px] uppercase tracking-widest font-bold">
                {occasion}
              </span>
              <span className="text-[11px] text-white/50">Shared Outfit</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl mb-6">{title}</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {itemsToDisplay.map((it, idx) => (
                <div key={it._id || it.id || idx} className="rounded-[18px] overflow-hidden border border-white/15 aspect-square relative group">
                  <img
                    src={resolveImageUrl(it.imageUrl)}
                    alt={it.name || it.category}
                    onError={handleImageError}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/70 p-1.5 text-[10px] truncate text-center font-medium">
                    {it.name || it.subType || it.category}
                  </div>
                </div>
              ))}
            </div>

            {outfitData?.reasons && outfitData.reasons.length > 0 && (
              <div className="glass rounded-[20px] p-4 mb-6 text-xs text-white/80 space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold mb-2 flex items-center gap-1.5">
                  <Sparkles size={12} /> Stylist Notes
                </div>
                {outfitData.reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">✓</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="glass rounded-[20px] p-5" data-testid="feedback-panel">
              <div className="text-[11px] uppercase tracking-widest text-white/50 mb-3">
                What do you think of this outfit?
              </div>
              {!submitted ? (
                <>
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => setVote('up')}
                      className={`flex-1 py-3 rounded-full flex items-center justify-center gap-2 transition ${
                        vote === 'up'
                          ? 'bg-amber-500 text-black font-semibold shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                          : 'bg-white/8 border border-white/15 hover:bg-white/12'
                      }`}
                      data-testid="vote-up"
                    >
                      <ThumbsUp size={16} strokeWidth={1.5} /> Love it
                    </button>
                    <button
                      onClick={() => setVote('down')}
                      className={`flex-1 py-3 rounded-full flex items-center justify-center gap-2 transition ${
                        vote === 'down'
                          ? 'bg-white text-black font-semibold'
                          : 'bg-white/8 border border-white/15 hover:bg-white/12'
                      }`}
                      data-testid="vote-down"
                    >
                      <ThumbsDown size={16} strokeWidth={1.5} /> Not for me
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      placeholder="Add a quick note (optional)…"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="glass-input flex-1 px-4 py-3 rounded-full text-sm"
                      data-testid="feedback-input"
                    />
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={!vote}
                      className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center transition shadow-[0_0_20px_rgba(245,158,11,0.4)] shrink-0"
                      data-testid="submit-feedback"
                    >
                      <Send size={15} className="text-black" strokeWidth={2} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-3">
                    <Sparkles size={18} className="text-amber-400" strokeWidth={1.5} />
                  </div>
                  <div className="font-display text-lg">Thanks for your feedback!</div>
                  <div className="text-sm text-white/60 mt-1">Your feedback has been saved.</div>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-[11px] text-white/40 mt-6">
          Powered by Alcove Smart Wardrobe
        </p>
      </div>
    </div>
  );
}
