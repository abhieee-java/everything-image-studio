import React, { useState } from 'react';
import {
  X,
  Play,
  Layers,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ImageDataItem } from '../types';
import type {
  OcrBatchItem,
  OcrMode,
  OcrPreprocessingSettings,
  OcrResultData,
} from '../types/ocr';
import { preprocessCanvasForOcr } from '../utils/ocrPreprocessing';
import { recognizeImage } from '../utils/ocrEngine';
import {
  copyTextToClipboard,
  exportAsTxt,
  exportAsDocx,
  exportAsPdf,
} from '../utils/ocrExport';

interface OcrBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageDataItem[];
  selectedLanguage: string;
  selectedMode: OcrMode;
  preprocessing: OcrPreprocessingSettings;
}

export const OcrBatchModal: React.FC<OcrBatchModalProps> = ({
  isOpen,
  onClose,
  images,
  selectedLanguage,
  selectedMode,
  preprocessing,
}) => {
  const [batchItems, setBatchItems] = useState<OcrBatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [_currentIdx, setCurrentIdx] = useState<number>(0);
  const [combinedText, setCombinedText] = useState<string>('');
  const [copiedCombined, setCopiedCombined] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'combined'>('queue');
  const isCancelledRef = React.useRef(false);

  // Initialize batch items on open
  React.useEffect(() => {
    if (isOpen) {
      isCancelledRef.current = false;
      setBatchItems(
        images.map((img) => ({
          id: img.id,
          file: img.file,
          name: img.name,
          previewUrl: img.previewUrl,
          size: img.originalSize,
          width: img.originalWidth,
          height: img.originalHeight,
          status: 'pending',
          progress: 0,
          progressMessage: 'Queued',
        }))
      );
      setIsProcessing(false);
      setCurrentIdx(0);
      setCombinedText('');
      setActiveTab('queue');
    }
  }, [isOpen, images]);

  // Handle Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isProcessing) {
          isCancelledRef.current = true;
          setIsProcessing(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  const handleClose = () => {
    isCancelledRef.current = true;
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleStartBatch = async () => {
    if (batchItems.length === 0 || isProcessing) return;

    isCancelledRef.current = false;
    setIsProcessing(true);
    let allExtracted = '';

    for (let i = 0; i < batchItems.length; i++) {
      if (isCancelledRef.current) break;
      setCurrentIdx(i);
      const item = batchItems[i];

      setBatchItems((prev) =>
        prev.map((it, idx) =>
          idx === i
            ? { ...it, status: 'processing', progress: 10, progressMessage: 'Preprocessing image...' }
            : it
        )
      );

      try {
        // Load image onto canvas
        const imgEl = new Image();
        imgEl.src = item.previewUrl;
        await new Promise((resolve, reject) => {
          imgEl.onload = resolve;
          imgEl.onerror = reject;
        });

        if (isCancelledRef.current) break;

        // Preprocess image
        const processedCanvas = preprocessCanvasForOcr(imgEl, preprocessing);

        if (isCancelledRef.current) break;

        // Run OCR
        const result: OcrResultData = await recognizeImage(processedCanvas, {
          language: selectedLanguage,
          mode: selectedMode,
          onProgress: (p) => {
            if (isCancelledRef.current) return;
            setBatchItems((prev) =>
              prev.map((it, idx) =>
                idx === i
                  ? { ...it, progress: p.progress, progressMessage: p.message }
                  : it
              )
            );
          },
        });

        if (isCancelledRef.current) break;

        const sectionHeader = `\n\n--- [Document ${i + 1}: ${item.name}] ---\n\n`;
        allExtracted += (allExtracted ? sectionHeader : '') + result.text;

        setBatchItems((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? {
                  ...it,
                  status: 'completed',
                  progress: 100,
                  progressMessage: `Extracted ${result.wordsCount} words`,
                  result,
                }
              : it
          )
        );
      } catch (err: unknown) {
        if (isCancelledRef.current) break;
        const errorMsg = err instanceof Error ? err.message : 'Recognition failed';
        setBatchItems((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? { ...it, status: 'failed', progress: 0, progressMessage: errorMsg, error: errorMsg }
              : it
          )
        );
      }
    }

    if (!isCancelledRef.current) {
      setCombinedText(allExtracted);
      setIsProcessing(false);
      setActiveTab('combined');

      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.7 },
          colors: ['#2dd4bf', '#38bdf8', '#818cf8', '#34d399'],
        });
      } catch {
        // Confetti fallback
      }
    } else {
      setIsProcessing(false);
    }
  };

  const completedCount = batchItems.filter((i) => i.status === 'completed').length;
  const failedCount = batchItems.filter((i) => i.status === 'failed').length;

  const handleCopyCombined = async () => {
    if (!combinedText) return;
    const ok = await copyTextToClipboard(combinedText);
    if (ok) {
      setCopiedCombined(true);
      setTimeout(() => setCopiedCombined(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="batch-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="relative w-full max-w-3xl bg-[#0E1524] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-teal-400" />
            <div>
              <h2 id="batch-modal-title" className="text-base font-bold text-white">
                Batch OCR Processing ({batchItems.length} Images)
              </h2>
              <p className="text-xs text-slate-400">
                Process multiple images locally and merge results into one document
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Close batch processor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex items-center space-x-2 px-5 py-2.5 bg-[#080C14] border-b border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'queue'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Batch Queue ({completedCount}/{batchItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('combined')}
            disabled={!combinedText}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-30 ${
              activeTab === 'combined'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Combined Document
          </button>
        </div>

        {/* Tab 1: Queue List */}
        {activeTab === 'queue' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin">
            {batchItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg border border-white/10 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {item.width}×{item.height} • {item.progressMessage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {item.status === 'processing' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-teal-400 font-mono font-bold">
                        {item.progress}%
                      </span>
                      <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {item.status === 'completed' && (
                    <div className="flex items-center space-x-1 text-emerald-400 text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{item.result?.wordsCount} words</span>
                    </div>
                  )}

                  {item.status === 'failed' && (
                    <div className="flex items-center space-x-1 text-rose-400 text-xs font-medium">
                      <AlertCircle className="w-4 h-4" />
                      <span>Failed</span>
                    </div>
                  )}

                  {item.status === 'pending' && (
                    <span className="text-[11px] text-slate-500 font-mono">Queued</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Combined Document View */}
        {activeTab === 'combined' && (
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            <div className="flex items-center justify-between pb-2 text-xs text-slate-400">
              <span>Combined text from {completedCount} documents</span>
              <button
                type="button"
                onClick={handleCopyCombined}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30"
              >
                {copiedCombined ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCombined ? 'Copied!' : 'Copy Combined'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={combinedText}
              className="w-full flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-slate-200 resize-none focus:outline-none"
            />
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-[#080C14] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs">
            {completedCount > 0 && (
              <span className="text-emerald-400 font-medium">✓ {completedCount} completed</span>
            )}
            {failedCount > 0 && (
              <span className="text-rose-400 font-medium">✗ {failedCount} failed</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {combinedText && (
              <>
                <button
                  type="button"
                  onClick={() => exportAsTxt(combinedText, 'batch-ocr-combined')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10"
                >
                  TXT
                </button>
                <button
                  type="button"
                  onClick={() => exportAsDocx(combinedText, 'batch-ocr-combined')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10"
                >
                  Word
                </button>
                <button
                  type="button"
                  onClick={() => exportAsPdf(combinedText, 'batch-ocr-combined')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10"
                >
                  PDF
                </button>
              </>
            )}

            {isProcessing ? (
              <button
                type="button"
                onClick={() => {
                  isCancelledRef.current = true;
                  setIsProcessing(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs border border-rose-500/30 transition-colors cursor-pointer"
                aria-label="Stop batch processing"
              >
                Stop Batch Processing
              </button>
            ) : !combinedText ? (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleStartBatch}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs shadow-lg shadow-teal-500/25 disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Start Batch OCR</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
