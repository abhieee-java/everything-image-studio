import React from 'react';
import { X, History, Trash2, ArrowUpRight, ShieldCheck, Download } from 'lucide-react';
import { saveAs } from 'file-saver';
import type { HistoryItem } from '../types';
import { formatBytes } from '../utils/imageUtils';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
  onDeleteItem,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md h-full bg-[#0E1524] border-l border-white/10 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 id="history-title" className="text-base font-bold text-white">Recent Local Edits</h3>
              <p className="text-xs text-slate-400">Stored safely on your device only</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close history drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <History className="w-10 h-10 mb-2 opacity-30 text-teal-400" />
              <p className="text-sm font-semibold text-slate-300">No recent edits yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                When you process an image, your cutout will appear here for instant retrieval.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="group p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-500/30 transition-all flex items-center space-x-3"
              >
                {/* Thumbnail */}
                <div
                  className="w-14 h-14 rounded-xl overflow-hidden bg-transparency-grid border border-white/10 flex-shrink-0 cursor-pointer"
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Details */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                >
                  <p className="text-xs font-semibold text-white truncate group-hover:text-teal-300 transition-colors">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {item.width} × {item.height} • {formatBytes(item.size)}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => saveAs(item.processedBlob, `purecut-${item.name}`)}
                    className="p-1.5 text-slate-400 hover:text-teal-300 rounded-lg hover:bg-white/5 transition-colors"
                    title="Quick Download"
                    aria-label="Download image"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectItem(item);
                      onClose();
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                    title="Load into Editor"
                    aria-label="Load into editor"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                    title="Delete item"
                    aria-label="Delete history item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-[#0B101C]">
          <div className="flex items-center space-x-2 text-[11px] text-emerald-400">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>100% Private: Stored in browser IndexedDB only.</span>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="w-full py-2 px-3 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History ({items.length})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
