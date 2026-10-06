import React, { useEffect } from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'U', desc: 'Trigger image upload dialog' },
    { key: 'E', desc: 'Activate Erase brush' },
    { key: 'R', desc: 'Activate Restore brush' },
    { key: 'B', desc: 'Toggle Before/After comparison' },
    { key: 'Z', desc: 'Toggle Zoom (Fit / 100%)' },
    { key: 'Ctrl + Z', desc: 'Undo last edge brush edit' },
    { key: 'Ctrl + Shift + Z', desc: 'Redo edge brush edit' },
    { key: 'Esc', desc: 'Close dialogs and side drawers' },
    { key: '← / →', desc: 'Move comparison slider divider' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#0E1524] dark:bg-[#0E1524] border border-white/10 shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 id="shortcuts-title" className="text-base font-bold text-white">Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-400">Streamline your workflow with hotkeys</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close shortcuts modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
            >
              <span className="text-slate-300 font-medium">{sc.desc}</span>
              <kbd className="px-2 py-1 rounded-md bg-white/10 border border-white/15 text-teal-300 font-mono text-[11px] font-semibold">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1">
          <Command className="w-3.5 h-3.5" />
          <span>Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Esc</kbd> anytime to dismiss</span>
        </div>
      </div>
    </div>
  );
};
