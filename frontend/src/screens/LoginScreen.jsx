import React, { useState } from 'react';
import { Disc3, Loader2, AlertCircle, X, Headphones, ListMusic, Sparkles } from 'lucide-react';

export default function LoginScreen({
  onGoogleLogin,
  isVerifyingSession = false,
  error = null,
  onDismissError
}) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleLoginClick = () => {
    setIsRedirecting(true);
    onGoogleLogin();
  };

  const isBusy = isVerifyingSession || isRedirecting;

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-[#07080a] text-white font-sans antialiased flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      {/* Subtle ambient background glow matching Music Stream palette */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative w-full max-w-md bg-[#121318]/95 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-7 sm:p-9 shadow-2xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-xl shadow-rose-950/40 mb-4">
            <Disc3 size={28} className="text-white animate-spin-slow" />
          </div>

          <p className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
            MUSIC STREAM
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1.5">
            Your rhythm, your vibe
          </h1>
          <p className="text-sm text-neutral-400 mt-2 max-w-xs">
            Sign in with Google to access your personal playlists, saved tracks, and continuous playback.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 flex items-start space-x-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
            <AlertCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
            {onDismissError && (
              <button
                type="button"
                onClick={onDismissError}
                className="text-rose-400 hover:text-rose-200 transition-colors flex-shrink-0"
                aria-label="Dismiss error"
              >
                <X size={15} />
              </button>
            )}
          </div>
        )}

        {/* Action / Loading State */}
        <div className="mt-7">
          {isVerifyingSession ? (
            <div className="w-full flex items-center justify-center space-x-3 py-3.5 px-5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm font-semibold">
              <Loader2 size={18} className="animate-spin text-white" />
              <span>Verifying your session...</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLoginClick}
              disabled={isBusy}
              className="w-full flex items-center justify-center space-x-3 py-3.5 px-6 rounded-full bg-white hover:bg-neutral-200 active:scale-[0.99] text-black font-bold text-sm tracking-tight shadow-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isRedirecting ? (
                <>
                  <Loader2 size={18} className="animate-spin text-black" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  {/* Official Google G Mark */}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Feature highlights */}
        <div className="mt-7 pt-6 border-t border-neutral-800/70 grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center space-y-1.5 px-1">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300">
              <Headphones size={15} />
            </div>
            <span className="text-[11px] font-medium text-neutral-400">Instant Stream</span>
          </div>
          <div className="flex flex-col items-center space-y-1.5 px-1">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300">
              <ListMusic size={15} />
            </div>
            <span className="text-[11px] font-medium text-neutral-400">Your Playlists</span>
          </div>
          <div className="flex flex-col items-center space-y-1.5 px-1">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300">
              <Sparkles size={15} />
            </div>
            <span className="text-[11px] font-medium text-neutral-400">Private Library</span>
          </div>
        </div>
      </div>
    </div>
  );
}
