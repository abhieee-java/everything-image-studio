import React from 'react';
import { Sliders, Zap, ShieldCheck } from 'lucide-react';
import type { CompressionSettings, ImageDataItem, ProcessedResult } from '../types';
import { formatBytes, formatPercentageSaved } from '../utils/imageUtils';

interface CompressorToolProps {
  settings: CompressionSettings;
  onChange: (settings: CompressionSettings) => void;
  originalImage: ImageDataItem | null;
  processedResult: ProcessedResult | null;
}

export const CompressorTool: React.FC<CompressorToolProps> = ({
  settings,
  onChange,
  originalImage,
  processedResult,
}) => {
  const presets = [
    { label: 'Max Savings', quality: 0.4, desc: 'Smallest file (~70% reduction)' },
    { label: 'Balanced', quality: 0.75, desc: 'Recommended balance' },
    { label: 'High Quality', quality: 0.9, desc: 'Minimal visual artifacts' },
  ];

  const savings = originalImage && processedResult
    ? formatPercentageSaved(originalImage.originalSize, processedResult.size)
    : null;

  return (
    <div className="space-y-6">
      {/* Title and Intro */}
      <div>
        <div className="flex items-center space-x-2 text-teal-400 mb-1">
          <Zap className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider">The Compressor</h3>
        </div>
        <p className="text-xs text-slate-400">
          Smart client-side perceptual compression. Strips redundant metadata while preserving visual clarity.
        </p>
      </div>

      {/* Real-time Before & After Estimator Card */}
      {originalImage && (
        <div className="p-4 rounded-2xl bg-[#090D18] border border-white/10 space-y-3">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Size Estimation</span>
            {savings && savings.isSaved && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                {savings.text} Smaller
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Original Size</span>
              <span className="text-sm font-mono font-bold text-slate-300">
                {formatBytes(originalImage.originalSize)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
              <span className="text-[10px] text-teal-400 uppercase font-mono block">Estimated Output</span>
              <span className="text-sm font-mono font-bold text-teal-300">
                {processedResult ? formatBytes(processedResult.size) : 'Calculating...'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Presets */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-2">Compression Presets</label>
        <div className="grid grid-cols-3 gap-2">
          {presets.map((p) => {
            const isSelected = Math.abs(settings.quality - p.quality) < 0.05;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => onChange({ ...settings, quality: p.quality })}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  isSelected
                    ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 shadow-sm shadow-teal-500/10'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <div className="text-xs font-bold leading-none mb-1">{p.label}</div>
                <div className="text-[10px] text-slate-400 leading-tight truncate">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slider: Quality */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            <span>Target Quality Level</span>
          </span>
          <span className="font-mono text-teal-400 font-bold">{Math.round(settings.quality * 100)}%</span>
        </div>

        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={settings.quality}
          onChange={(e) => onChange({ ...settings, quality: parseFloat(e.target.value) })}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>Max Compress (10%)</span>
          <span>Lossless (100%)</span>
        </div>
      </div>

      {/* WebWorker toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <div>
            <div className="text-xs font-semibold text-white">Multi-threaded Web Worker</div>
            <div className="text-[10px] text-slate-400">Processes in parallel without UI lag</div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.useWebWorker}
          onChange={(e) => onChange({ ...settings, useWebWorker: e.target.checked })}
          className="w-4 h-4 rounded border-slate-700 text-teal-500 focus:ring-teal-400 focus:ring-offset-slate-900 accent-teal-400 cursor-pointer"
        />
      </div>
    </div>
  );
};
