import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center px-6" data-testid="login-page">
      <div className="app-bg" />
      <div className="app-grain" />

      <div className="glass rounded-[28px] w-full max-w-md p-6 sm:p-10 fade-up relative" data-testid="login-card">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.45)]">
            <Sparkles size={20} className="text-black" strokeWidth={2} />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-amber-400/90 font-semibold">Alcove</div>
            <div className="font-display text-xl">Your Crystal Wardrobe</div>
          </div>
        </div>

        <div className="flex glass-input rounded-full p-1 mb-8" data-testid="mode-toggle">
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 text-sm rounded-full font-medium transition ${
                mode === m ? 'bg-white text-black' : 'text-white/70 hover:text-white'
              }`}
              data-testid={`toggle-${m}`}
            >
              {m === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-2xl bg-red-500/15 border border-red-400/30 text-red-300 text-sm" data-testid="auth-error">
            <AlertCircle size={15} strokeWidth={1.5} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={submit}>
          {mode === 'signup' && (
            <div>
              <label className="text-xs uppercase tracking-wider text-white/60">Name</label>
              <div className="relative mt-2">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Aria Blake"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm"
                  data-testid="input-name"
                />
              </div>
            </div>
          )}
          <div>
            <label className="text-xs uppercase tracking-wider text-white/60">Email</label>
            <div className="relative mt-2">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" strokeWidth={1.5} />
              <input
                type="email"
                placeholder="you@alcove.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm"
                data-testid="input-email"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-white/60">Password</label>
            <div className="relative mt-2">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" strokeWidth={1.5} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm"
                data-testid="input-password"
              />
            </div>
          </div>

          {mode === 'login' && (
            <div className="flex justify-end">
              <button type="button" className="text-xs text-white/60 hover:text-amber-400 transition" data-testid="forgot-password">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-amber w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            data-testid="submit-btn"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-black/40 border-t-transparent animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Enter your wardrobe' : 'Create account'}
                <ArrowRight size={16} strokeWidth={2} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-white/50 mt-8">
          By continuing you agree to Alcove's <span className="underline decoration-white/30">Terms</span> and{' '}
          <span className="underline decoration-white/30">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
