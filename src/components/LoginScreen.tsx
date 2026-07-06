import React, { useState } from 'react';
import { Shield, Key, Eye, EyeOff, Loader2 } from 'lucide-react';
import { User, UserRole } from '../types.ts';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

interface LoginScreenProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Connecting to server failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      // Prompt google popup verification
      const credential = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await credential.user.getIdToken();

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Verification on database server failed.');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      console.error('Google Sign In authentication error:', err);
      setError(err.message || 'Google Authentication cancelled or failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-slate-900 to-slate-950 px-4">
      {/* Dynamic background accents */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-650/15 border border-indigo-500/20 text-indigo-400 mb-6 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-white mb-2 leading-none font-sans">
            SALESCORE<span className="text-indigo-400">.</span>
          </h1>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            ENTERPRISE CRM WORKSTATION
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400 animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-sans font-medium text-slate-300 uppercase tracking-widest mb-2">
                Business Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-sans font-medium text-slate-300 uppercase tracking-widest">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  onClick={() => setError('Contact administrators to reset account passwords.')}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center text-sm text-slate-400 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                />
                Remember this workstation
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-850 text-white font-semibold rounded-xl py-3 text-sm cursor-pointer shadow-lg shadow-indigo-600/20 active:translate-y-px transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Authenticate Securely
                </>
              )}
            </button>
          </form>

          {/* Elegant Or Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-800/80"></div>
            </div>
            <div className="relative flex justify-center text-xs text-slate-450 font-bold uppercase tracking-wider">
              <span className="bg-slate-900/10 backdrop-blur-xl px-3">or single sign-on</span>
            </div>
          </div>

          {/* Social login Google Button */}
          <button
            type="button"
            disabled={isLoading || isGoogleLoading}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 active:translate-y-px text-slate-200 hover:text-white font-bold rounded-xl py-3 text-sm cursor-pointer shadow-sm transition-all"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin text-slate-400" />
            ) : (
              <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
            )}
            Sign in with Google Account
          </button>


        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            Authenticated securely using Firebase federated login with real-time Cloud SQL (PostgreSQL) replication.
          </p>
        </div>
      </div>
    </div>
  );
}

