import React, { useState } from 'react';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { User, Mail, Bell, Moon, LogOut, Plus, Trash2, Check, Loader, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [darkMode, setDarkMode] = useState(user?.preferences?.darkMode ?? true);
  const [notif, setNotif] = useState(user?.preferences?.notifications ?? true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');
  const [wardrobes, setWardrobes] = useState(user?.wardrobeSpaces || [{ id: 'home', name: 'Home', isPrimary: true }]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    setSaveError('');
    try {
      await updateUser({
        name,
        preferences: { darkMode, notifications: notif },
        wardrobeSpaces: wardrobes,
      });
      setSaveMsg('Changes saved!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = name ? name.charAt(0).toUpperCase() : 'A';

  return (
    <Layout>
      <div className="mb-6 md:mb-8 fade-up">
        <div className="text-[11px] uppercase tracking-[0.2em] text-amber-400/90 font-semibold mb-2">
          Profile & Settings
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[0.95]">
          Curate <span className="text-white/50">your space.</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile card */}
        <GlassCard className="p-4 sm:p-8 lg:col-span-5" data-testid="profile-card">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_8px_30px_rgba(245,158,11,0.4)] shrink-0">
              <span className="font-display text-2xl sm:text-3xl text-black font-bold">{initials}</span>
            </div>
            <div>
              <div className="font-display text-xl sm:text-2xl">{user?.name || 'Your Name'}</div>
              <div className="text-xs sm:text-sm text-white/60">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
              </div>
              <div className="mt-2 inline-block px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-[10px] uppercase tracking-wider text-amber-300 font-semibold">
                {user?.plan === 'curator' ? 'Curator plan' : 'Free plan'}
              </div>
            </div>
          </div>

          {saveError && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-red-500/15 border border-red-400/30 text-red-300 text-xs">
              <AlertCircle size={13} strokeWidth={1.5} className="shrink-0" />
              {saveError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/50">Name</label>
              <div className="relative mt-2">
                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" strokeWidth={1.5} />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-3 rounded-2xl text-sm"
                  data-testid="input-profile-name"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/50">Email</label>
              <div className="relative mt-2">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" strokeWidth={1.5} />
                <input
                  value={email}
                  readOnly
                  className="glass-input w-full pl-10 pr-4 py-3 rounded-2xl text-sm opacity-70 cursor-not-allowed"
                  data-testid="input-profile-email"
                />
              </div>
            </div>
            {saveMsg && <p className="text-xs text-emerald-400">{saveMsg}</p>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-amber w-full flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-60"
              data-testid="save-profile"
            >
              {saving ? <Loader size={14} className="animate-spin" /> : <><Check size={14} strokeWidth={2} /> Save changes</>}
            </button>
          </div>
        </GlassCard>

        {/* Right column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Wardrobes */}
          <GlassCard className="p-4 sm:p-6" data-testid="wardrobes-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="font-display text-lg sm:text-xl">My wardrobes</div>
                <div className="text-xs text-white/50">Split items across spaces</div>
              </div>
              <button
                onClick={() => {
                  const newName = prompt('New wardrobe name:');
                  if (newName) {
                    setWardrobes(prev => [...prev, { id: `space-${Date.now()}`, name: newName, isPrimary: false }]);
                  }
                }}
                className="btn-ghost !py-2 flex items-center gap-2 text-xs" data-testid="add-wardrobe"
              >
                <Plus size={12} strokeWidth={2} /> New wardrobe
              </button>
            </div>
            <div className="space-y-2">
              {wardrobes.map((w) => (
                <div
                  key={w.id}
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition ${
                    w.isPrimary
                      ? 'bg-amber-500/10 border-amber-400/30'
                      : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
                  }`}
                  data-testid={`wardrobe-${w.id}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm sm:text-base">{w.name}</span>
                      {w.isPrimary && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] uppercase tracking-wider font-bold">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => !w.isPrimary && setWardrobes((prev) => prev.filter((x) => x.id !== w.id))}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-white/10 flex items-center justify-center opacity-60 hover:opacity-100 transition"
                    disabled={w.isPrimary}
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Preferences */}
          <GlassCard className="p-4 sm:p-6" data-testid="preferences-card">
            <div className="font-display text-lg sm:text-xl mb-5">Preferences</div>

            <div className="space-y-3">
              <ToggleRow
                icon={<Bell size={14} strokeWidth={1.5} />}
                title="Daily outfit notification"
                sub="Get a morning nudge with today's suggestion"
                enabled={notif}
                onToggle={() => setNotif(!notif)}
                testId="toggle-notif"
              />
              <ToggleRow
                icon={<Moon size={14} strokeWidth={1.5} />}
                title="Dark theme"
                sub="Warm-toned glass palette"
                enabled={darkMode}
                onToggle={() => setDarkMode(!darkMode)}
                testId="toggle-theme"
              />
            </div>

            <button
              onClick={handleLogout}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-full border border-white/15 text-sm text-white/80 hover:bg-white/8 transition"
              data-testid="logout-btn"
            >
              <LogOut size={14} strokeWidth={1.5} /> Sign out
            </button>
          </GlassCard>
        </div>
      </div>
    </Layout>
  );
}

function ToggleRow({ icon, title, sub, enabled, onToggle, testId }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/8 border border-white/15 flex items-center justify-center text-white/80">
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-white/55">{sub}</div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition ${enabled ? 'bg-amber-500' : 'bg-white/15'}`}
        data-testid={testId}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
}
