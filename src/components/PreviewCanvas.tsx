import React, { useState } from 'react';
import { Download, ZoomIn, ZoomOut, RotateCcw, Columns, Eye, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveAs } from 'file-saver';
import type { ImageDataItem, ProcessedResult } from '../types';
import { formatBytes, formatPercentageSaved } from '../utils/imageUtils';

interface PreviewCanvasProps {
  originalImage: ImageDataItem | null;
  processedResult: ProcessedResult | null;
  isProcessing: boolean;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  originalImage,
  processedResult,
  isProcessing,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'single' | 'split' | 'side-by-side'>('split');
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0 - 100
  const [showGrid, setShowGrid] = useState<boolean>(true);

  if (!originalImage) {
    return (
      <div className="flex-1 min-h-[450px] flex items-center justify-center bg-[#070A12] border border-white/5 rounded-2xl p-8 text-center text-slate-500">
        <p>No image selected for preview</p>
      </div>
    );
  }

  const handleDownload = () => {
    if (!processedResult) return;

    // Trigger confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#2dd4bf', '#38bdf8', '#818cf8', '#f43f5e'],
      });
    } catch {
      // Confetti error fallback
    }

    saveAs(processedResult.blob, processedResult.filename);
  };

  const savings = processedResult
    ? formatPercentageSaved(originalImage.originalSize, processedResult.size)
    : null;

  const currentPreviewUrl = processedResult ? processedResult.dataUrl : originalImage.previewUrl;

  return (
    <div className="flex-1 flex flex-col bg-[#070B14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Preview Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#0D1322] border-b border-white/10 gap-2">
        {/* Left: View Mode Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'split'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Interactive Split Comparison Slider"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Side by Side Comparison"
          >
            <Columns className="w-3.5 h-3.5 rotate-90" />
            <span>Side by Side</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('single')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'single'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Processed Image Only"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Processed</span>
          </button>
        </div>

        {/* Center: Zoom and Grid toggles */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
              showGrid ? 'bg-white/10 text-teal-300' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Transparent Grid"
          >
            Grid
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(25, z - 25))}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono text-slate-400 w-10 text-center">{zoom}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(300, z + 25))}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(100)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5"
            title="Reset Zoom"
            aria-label="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Quick Download */}
        <div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!processedResult || isProcessing}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-black font-semibold text-xs transition-all shadow-md shadow-teal-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ({processedResult ? formatBytes(processedResult.size) : '...'})</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div
        className={`relative flex-1 min-h-[420px] max-h-[620px] overflow-auto flex items-center justify-center p-4 select-none ${
          showGrid ? 'bg-transparency-grid' : 'bg-[#060911]'
        }`}
      >
        {isProcessing && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-3 border-teal-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium text-teal-300">Processing on device...</p>
          </div>
        )}

        {/* Split Comparison View */}
        {viewMode === 'split' && (
          <div
            className="relative inline-block max-w-full rounded-lg overflow-hidden shadow-2xl border border-white/10"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
          >
            {/* After (Processed) image behind */}
            <img
              src={currentPreviewUrl}
              alt="Processed output"
              className="max-h-[500px] w-auto block pointer-events-none"
            />

            {/* Before (Original) image clipped on left */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${splitPos}%`, borderRight: '2px solid #2dd4bf' }}
            >
              <img
                src={originalImage.previewUrl}
                alt="Original source"
                className="max-h-[500px] w-auto max-w-none block"
              />
            </div>

            {/* Slider Drag Bar */}
            <input
              type="range"
              min="0"
              max="100"
              value={splitPos}
              onChange={(e) => setSplitPos(Number(e.target.value))}
              aria-label="Before/After Split Position"
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />

            {/* Visual handle indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full bg-teal-400 text-black flex items-center justify-center shadow-lg pointer-events-none text-xs font-bold"
              style={{ left: `${splitPos}%` }}
            >
              ↔
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300 pointer-events-none border border-white/10">
              Before ({formatBytes(originalImage.originalSize)})
            </div>
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-teal-950/80 backdrop-blur-md text-[10px] font-mono text-teal-300 pointer-events-none border border-teal-500/30">
              After ({processedResult ? formatBytes(processedResult.size) : '...'})
            </div>
          </div>
        )}

        {/* Side by Side View */}
        {viewMode === 'side-by-side' && (
          <div
            className="flex flex-col sm:flex-row items-center gap-4 max-w-full"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
          >
            {/* Original Card */}
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-xl">
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-slate-300">
                Original • {formatBytes(originalImage.originalSize)}
              </div>
              <img
                src={originalImage.previewUrl}
                alt="Original"
                className="max-h-[380px] w-auto block"
              />
            </div>

            {/* Processed Card */}
            <div className="relative rounded-xl overflow-hidden border border-teal-500/40 bg-black/40 shadow-xl">
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-teal-950/80 text-[10px] font-mono text-teal-300 border border-teal-500/30">
                Processed • {processedResult ? formatBytes(processedResult.size) : '...'}
              </div>
              <img
                src={currentPreviewUrl}
                alt="Processed"
                className="max-h-[380px] w-auto block"
              />
            </div>
          </div>
        )}

        {/* Single Processed View */}
        {viewMode === 'single' && (
          <div
            className="relative inline-block rounded-xl overflow-hidden shadow-2xl border border-white/10"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
          >
            <img
              src={currentPreviewUrl}
              alt="Processed view"
              className="max-h-[500px] w-auto block"
            />
          </div>
        )}
      </div>

      {/* Bottom Info Status Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#0D1322] border-t border-white/10 text-xs">
        <div className="flex items-center space-x-3 text-slate-300">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">Dimensions:</span>
            <span className="font-mono font-medium text-white">
              {processedResult ? `${processedResult.width} × ${processedResult.height}` : `${originalImage.originalWidth} × ${originalImage.originalHeight}`}
            </span>
          </div>

          <span className="text-white/20">•</span>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">Format:</span>
            <span className="font-mono uppercase font-semibold text-teal-400">
              {processedResult ? processedResult.format.replace('image/', '') : originalImage.originalType.replace('image/', '')}
            </span>
          </div>
        </div>

        {/* Reduction badge */}
        {savings && (
          <div className="flex items-center space-x-2">
            {savings.isSaved && (
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{savings.text} Smaller ({formatBytes(originalImage.originalSize - (processedResult?.size || 0))} saved)</span>
              </div>
            )}
            {processedResult && (
              <span className="text-[11px] text-slate-500 font-mono">
                {processedResult.processingTimeMs}ms
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
