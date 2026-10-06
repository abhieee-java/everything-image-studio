import React from 'react';
import {
  Shield,
  Sparkles,
  Layers,
  Trash2,
  History,
  Keyboard,
  Moon,
  Sun,
  Scissors,
  CheckCircle2,
} from 'lucide-react';
import type { ThemeMode } from '../utils/theme';

interface NavbarProps {
  imageCount: number;
  onClearAll: () => void;
  onLoadSamples: () => void;
  onOpenBatch: () => void;
  historyCount?: number;
  onOpenHistory?: () => void;
  onOpenShortcuts?: () => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  isOfflineReady?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  imageCount,
  onClearAll,
  onLoadSamples,
  onOpenBatch,
  historyCount = 0,
  onOpenHistory,
  onOpenShortcuts,
  theme = 'dark',
  onToggleTheme,
  isOfflineReady = true,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#080C14]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 p-[1.5px] shadow-lg shadow-teal-500/20">
            <div className="w-full h-full bg-[#080C14] rounded-[10px] flex items-center justify-center">
              <Scissors className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white m-0 leading-none">
                PureCut <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                100% Client-Side
              </span>
            </div>
            {/* Kept for branding and backward test compatibility */}
            <p className="text-xs text-slate-400 hidden sm:block">
              Everything Image Studio • Private background remover
            </p>
          </div>
        </div>

        {/* Right Section: Privacy badge, History, Shortcuts, Theme, Batch, GitHub */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Privacy indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>100% Private • Zero Cloud Uploads</span>
          </div>

          {/* Offline ready badge */}
          {isOfflineReady && (
            <div
              className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300"
              title="Application shell and models cached in browser"
            >
              <CheckCircle2 className="w-3 h-3 text-teal-400" />
              <span>Ready offline</span>
            </div>
          )}

          {/* History Drawer Trigger */}
          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              title="Recent Local Edits (IndexedDB)"
              className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Open history drawer"
            >
              <History className="w-4 h-4" />
              {historyCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-teal-500 text-black font-bold text-[9px] flex items-center justify-center">
                  {historyCount}
                </span>
              )}
            </button>
          )}

          {/* Keyboard Shortcuts Trigger */}
          {onOpenShortcuts && (
            <button
              type="button"
              onClick={onOpenShortcuts}
              title="Keyboard Shortcuts (?)"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors hidden sm:block"
              aria-label="Open keyboard shortcuts"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          )}

          {/* Theme Toggle */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
          )}

          {imageCount > 0 ? (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onOpenBatch}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-500 hover:bg-teal-400 text-black transition-all shadow-md shadow-teal-500/20 active:scale-95"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Batch Process ({imageCount})</span>
              </button>

              <button
                type="button"
                onClick={onClearAll}
                title="Clear all images"
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Clear all images"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onLoadSamples}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Sample Photos</span>
            </button>
          )}

          <a
            href="https://github.com/abhieee-java/everything-image-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="GitHub Repository"
            aria-label="GitHub Repository"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
};
