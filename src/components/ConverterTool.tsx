import React from 'react';
import { RefreshCw, Layers } from 'lucide-react';
import type { ConversionSettings, ImageFormat } from '../types';

interface ConverterToolProps {
  settings: ConversionSettings;
  onChange: (settings: ConversionSettings) => void;
  totalImages: number;
  onOpenBatch: () => void;
}

export const ConverterTool: React.FC<ConverterToolProps> = ({
  settings,
  onChange,
  totalImages,
  onOpenBatch,
}) => {
  const formats: Array<{
    format: ImageFormat;
    label: string;
    ext: string;
    badge: string;
    description: string;
  }> = [
    {
      format: 'image/webp',
      label: 'WebP',
      ext: '.webp',
      badge: 'Recommended',
      description: 'Ultra modern, 30% smaller than JPG with full transparency.',
    },
    {
      format: 'image/jpeg',
      label: 'JPEG / JPG',
      ext: '.jpg',
      badge: 'Universal',
      description: 'Universally compatible across all devices and legacy systems.',
    },
    {
      format: 'image/png',
      label: 'PNG',
      ext: '.png',
      badge: 'Lossless',
      description: 'Crisp graphics, alpha channel transparency, and text clarity.',
    },
    {
      format: 'image/avif',
      label: 'AVIF',
      ext: '.avif',
      badge: 'Next-Gen',
      description: 'Next-gen AV1 compression for extreme bandwidth efficiency.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-teal-400 mb-1">
          <RefreshCw className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider">The Converter</h3>
        </div>
        <p className="text-xs text-slate-400">
          Transform images instantly between modern and universal formats without server roundtrips.
        </p>
      </div>

      {/* Target Format Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 block">Select Target Format</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {formats.map((f) => {
            const isSelected = settings.targetFormat === f.format;
            return (
              <button
                key={f.format}
                type="button"
                onClick={() => onChange({ ...settings, targetFormat: f.format })}
                className={`p-3 rounded-2xl text-left transition-all border ${
                  isSelected
                    ? 'bg-teal-500/20 border-teal-500/60 shadow-lg shadow-teal-500/10'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-bold ${isSelected ? 'text-teal-300' : 'text-white'}`}>
                    {f.label}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                      isSelected
                        ? 'bg-teal-400 text-black font-bold'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {f.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{f.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quality slider for WebP/JPG/AVIF */}
      {settings.targetFormat !== 'image/png' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Conversion Quality</span>
            <span className="font-mono text-teal-400 font-bold">{Math.round(settings.quality * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={settings.quality}
            onChange={(e) => onChange({ ...settings, quality: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>
      )}

      {/* JPEG Background Color if converting to JPEG */}
      {settings.targetFormat === 'image/jpeg' && (
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Matte / Background Fill for Transparent Pixels
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => onChange({ ...settings, backgroundColor: e.target.value })}
              className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={settings.backgroundColor}
              onChange={(e) => onChange({ ...settings, backgroundColor: e.target.value })}
              className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
            />
            {['#FFFFFF', '#000000', '#F8FAFC'].map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => onChange({ ...settings, backgroundColor: col })}
                className="w-6 h-6 rounded-lg border border-white/20 shadow-sm"
                style={{ backgroundColor: col }}
                title={`Set to ${col}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bulk Conversion Action Trigger */}
      {totalImages > 1 && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-950/40 to-cyan-950/20 border border-teal-500/30 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white">Bulk Convert All</h4>
            <p className="text-[11px] text-teal-300/80">Convert all {totalImages} images to {formats.find(f => f.format === settings.targetFormat)?.label}</p>
          </div>
          <button
            type="button"
            onClick={onOpenBatch}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-semibold text-xs transition-all shadow-md shadow-teal-500/20 active:scale-95"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Convert All</span>
          </button>
        </div>
      )}
    </div>
  );
};
