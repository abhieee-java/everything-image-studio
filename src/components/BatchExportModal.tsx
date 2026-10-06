import React from 'react';
import { X, Layers, Download, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import confetti from 'canvas-confetti';
import type { BatchProgress, ProcessedResult } from '../types';
import { formatBytes } from '../utils/imageUtils';

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: BatchProgress;
  batchResults: ProcessedResult[];
  zipBlob: Blob | null;
  onStartBatch: () => void;
  toolName: string;
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  isOpen,
  onClose,
  progress,
  batchResults,
  zipBlob,
  onStartBatch,
  toolName,
}) => {
  if (!isOpen) return null;

  const isDone = !progress.isProcessing && batchResults.length > 0 && zipBlob !== null;
  const totalOriginalSize = batchResults.reduce((acc, r) => acc + r.size, 0);

  const handleDownloadZip = () => {
    if (!zipBlob) return;
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }
    saveAs(zipBlob, `everything-studio-export-${Date.now()}.zip`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0E1524] border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Batch Export</h3>
              <p className="text-xs text-slate-400">Apply {toolName} to all uploaded images</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={progress.isProcessing}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress or Ready Status */}
        <div className="space-y-4">
          {progress.isProcessing ? (
            <div className="space-y-3 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-teal-300 flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                  <span>Processing Images...</span>
                </span>
                <span className="font-mono text-slate-300">
                  {progress.current} / {progress.total}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300"
                  style={{
                    width: `${Math.round((progress.current / Math.max(1, progress.total)) * 100)}%`,
                  }}
                />
              </div>

              <p className="text-[11px] text-slate-400 font-mono truncate">
                Current: {progress.currentFilename || 'Preparing batch...'}
              </p>
            </div>
          ) : isDone ? (
            <div className="space-y-4 p-5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Batch Processing Complete!</h4>
                <p className="text-xs text-teal-200 mt-1">
                  Successfully processed {batchResults.length} files ({formatBytes(totalOriginalSize)} total).
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-teal-400 mx-auto" />
              <h4 className="text-sm font-semibold text-white">Ready to Process {progress.total} Images</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                All images will be processed locally in parallel and bundled into a single `.zip` file for instant download.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={progress.isProcessing}
            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs transition-all border border-white/10"
          >
            Cancel
          </button>

          {isDone ? (
            <button
              type="button"
              onClick={handleDownloadZip}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-black font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/25 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP ({formatBytes(zipBlob?.size || 0)})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartBatch}
              disabled={progress.isProcessing}
              className="flex-1 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/25 transition-all disabled:opacity-50"
            >
              <Layers className="w-4 h-4" />
              <span>{progress.isProcessing ? 'Processing...' : `Start Batch (${progress.total})`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
