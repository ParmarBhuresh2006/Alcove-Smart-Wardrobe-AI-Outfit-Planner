import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { UploadCloud, X, Check, Sparkles, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ai as aiApi, wardrobe as wardrobeApi } from '../lib/api';

// Tag definitions — options shown to the user
const TAG_DEFS = [
  {
    key: 'category',
    label: 'Category',
    options: ['tops', 'bottoms', 'outerwear', 'shoes', 'dresses', 'accessories', 'one-piece'],
    display: { tops: 'Top', bottoms: 'Bottom', outerwear: 'Outerwear', shoes: 'Shoes', dresses: 'Dress', accessories: 'Accessory', 'one-piece': 'One-piece' },
  },
  {
    key: 'primaryColor',
    label: 'Color',
    options: ['black', 'white', 'gray', 'red', 'blue', 'navy', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'beige', 'cream', 'camel', 'ivory', 'maroon', 'teal', 'indigo', 'champagne'],
    display: {},
  },
  {
    key: 'pattern',
    label: 'Pattern',
    options: ['solid', 'striped', 'printed', 'knit', 'checked', 'floral', 'geometric'],
    display: {},
  },
  {
    key: 'season',
    label: 'Season',
    options: ['spring', 'summer', 'autumn', 'winter', 'all-year'],
    display: { 'all-year': 'All-year', spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' },
  },
  {
    key: 'formality',
    label: 'Formality',
    options: ['casual', 'smart-casual', 'formal'],
    display: { casual: 'Casual', 'smart-casual': 'Smart Casual', formal: 'Formal' },
  },
];

function capitalise(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function AddItem() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);   // raw AI response
  const [aiEngineDown, setAiEngineDown] = useState(false);
  const [tags, setTags] = useState(() =>
    TAG_DEFS.map((t) => ({ ...t, value: t.options[0] }))
  );
  const [itemName, setItemName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setError('');
    setAiEngineDown(false);
    setAiResult(null);
    await runAIAnalysis(selectedFile);
  };

  const runAIAnalysis = async (selectedFile) => {
    setAnalyzing(true);
    try {
      const result = await aiApi.analyze(selectedFile);
      setAiResult(result);

      // Populate tags from AI prediction
      if (result.prediction) {
        const p = result.prediction;
        setTags((prev) =>
          prev.map((t) => {
            const pred = p[t.key];
            if (!pred) return t;
            let value = (typeof pred === 'object' ? pred.value : pred);
            if (value) value = String(value).toLowerCase();
            if (value === 'grey') value = 'gray';
            // Only apply if value is in options
            if (value && t.options.includes(value)) {
              return { ...t, value };
            }
            return t;
          })
        );
        // Set name from subType if available
        if (p.subType?.value && p.subType.value !== 'unknown') {
          setItemName(capitalise(p.subType.value));
        } else if (p.category?.value && p.category.value !== 'unknown') {
          setItemName(capitalise(p.category.value));
        }
      }
    } catch (err) {
      if (err.data?.aiEngineDown) {
        setAiEngineDown(true);
      } else {
        setError('AI analysis failed: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!file) return;
    setSaving(true);
    setError('');
    try {
      const tagMap = Object.fromEntries(tags.map((t) => [t.key, t.value]));
      const data = {
        imagePath: aiResult?.imagePath || '',
        name: itemName,
        ...tagMap,
        aiConfidence: aiResult?.prediction?.category?.confidence || 0,
        aiPrediction: aiResult?.prediction || null,
      };

      if (aiResult?.imagePath) {
        // Image already uploaded — use confirm endpoint
        await aiApi.confirm(data);
      } else {
        // Re-upload with manual tags (AI was down)
        const form = new FormData();
        form.append('image', file);
        Object.entries(tagMap).forEach(([k, v]) => form.append(k, v));
        if (itemName) form.append('name', itemName);
        await wardrobeApi.create(form);
      }
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save item: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const confidence = aiResult?.prediction?.category?.confidence;
  const confidencePct = confidence !== undefined ? Math.round(confidence * 100) : null;

  return (
    <Layout showBottomBar={false}>
      <div className="max-w-4xl mx-auto fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-amber-400/90 font-semibold mb-2">
              Wardrobe · New Item
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl">Add to your closet</h1>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full glass flex items-center justify-center hover:bg-white/15 self-end sm:self-auto"
            data-testid="add-item-close"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-2xl bg-red-500/15 border border-red-400/30 text-red-300 text-sm">
            <AlertCircle size={15} strokeWidth={1.5} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {aiEngineDown && (
          <div className="flex items-start gap-2 mb-4 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs">
            <AlertCircle size={15} strokeWidth={1.5} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold mb-1">AI Engine Unavailable</div>
              <div>The AI engine is not running. You can still manually tag and save items. To enable AI analysis, start the AI engine:</div>
              <code className="block mt-1 font-mono bg-black/30 px-2 py-1 rounded">cd ai-engine && python server.py</code>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Upload zone */}
          <GlassCard className="p-4 sm:p-6 lg:col-span-3" data-testid="upload-card">
            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-white/25 rounded-[20px] py-10 sm:py-16 px-4 sm:px-8 flex flex-col items-center justify-center text-center hover:border-amber-400/60 hover:bg-white/[0.03] transition-all"
                data-testid="upload-zone"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-4 sm:mb-5">
                  <UploadCloud size={24} className="text-amber-400" strokeWidth={1.5} />
                </div>
                <div className="font-display text-xl sm:text-2xl mb-2">Drop your item photo here</div>
                <p className="text-white/60 text-xs sm:text-sm max-w-sm mb-6">
                  Snap a photo on a neutral background — our vision AI will auto-tag the category, color, and pattern.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button className="btn-amber flex items-center justify-center gap-2 text-sm" data-testid="upload-choose">
                    <UploadCloud size={14} strokeWidth={2} /> Choose file
                  </button>
                </div>
                <div className="text-[11px] text-white/40 mt-6">JPG · PNG · WEBP · up to 10MB</div>
              </div>
            ) : (
              <div className="relative rounded-[20px] overflow-hidden aspect-[4/3]">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {analyzing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="text-center">
                      <Loader size={28} className="text-amber-400 animate-spin mx-auto mb-2" strokeWidth={1.5} />
                      <div className="text-sm">Analyzing with AI…</div>
                    </div>
                  </div>
                )}

                {!analyzing && confidencePct !== null && !aiEngineDown && (
                  <div className="absolute top-4 left-4 glass rounded-full px-3 py-1.5 flex items-center gap-2">
                    <Sparkles size={12} className="text-amber-400" strokeWidth={1.5} />
                    <span className="text-xs">AI analyzed · {confidencePct}% confidence</span>
                  </div>
                )}

                {!analyzing && aiEngineDown && (
                  <div className="absolute top-4 left-4 glass rounded-full px-3 py-1.5 flex items-center gap-2">
                    <AlertCircle size={12} className="text-amber-400" strokeWidth={1.5} />
                    <span className="text-xs">AI unavailable · manual mode</span>
                  </div>
                )}

                <button
                  onClick={() => { setFile(null); setPreviewUrl(null); setAiResult(null); setAiEngineDown(false); }}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>

                {aiResult?.needsReview && (
                  <div className="absolute bottom-4 left-4 right-4 glass rounded-xl px-3 py-2 flex items-start gap-2">
                    <AlertCircle size={13} className="text-amber-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-xs text-white/80">Low confidence — please review the tags below</span>
                  </div>
                )}
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files[0] && handleFileChange(e.target.files[0])}
            />

            {/* Item name field */}
            {file && (
              <div className="mt-4">
                <label className="text-[10px] uppercase tracking-wider text-white/50">Item name (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Blue Denim Jacket"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="glass-input w-full mt-2 px-4 py-3 rounded-2xl text-sm"
                />
              </div>
            )}
          </GlassCard>

          {/* AI tags panel */}
          <GlassCard className="p-4 sm:p-6 lg:col-span-2 flex flex-col" data-testid="tags-card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                <Sparkles size={14} className="text-amber-400" strokeWidth={1.5} />
              </div>
              <div>
                <div className="font-display text-lg">
                  {analyzing ? 'Analyzing…' : aiEngineDown ? 'Manual tags' : 'AI-detected tags'}
                </div>
                <div className="text-[11px] text-white/50">
                  {aiEngineDown ? 'Set tags manually' : 'Editable · confirm to save'}
                </div>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {tags.map((t) => (
                <div key={t.key} data-testid={`tag-group-${t.key}`}>
                  <div className="text-[10px] uppercase tracking-wider text-white/50 mb-2">
                    {t.label}
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {t.options.map((opt) => {
                      const active = t.value === opt;
                      const displayLabel = t.display?.[opt] || capitalise(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() =>
                            setTags((prev) =>
                              prev.map((p) => (p.key === t.key ? { ...p, value: opt } : p))
                            )
                          }
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                            active
                              ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.4)]'
                              : 'bg-white/5 border-white/15 text-white/75 hover:bg-white/10'
                          }`}
                        >
                          {displayLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button className="btn-ghost flex-1 text-sm" onClick={() => navigate('/dashboard')}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!file || analyzing || saving}
                className="btn-amber flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                data-testid="save-item"
              >
                {saving ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <>
                    <Check size={14} strokeWidth={2} /> Save to wardrobe
                  </>
                )}
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </Layout>
  );
}
