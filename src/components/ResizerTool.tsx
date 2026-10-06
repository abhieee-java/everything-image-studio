import React from 'react';
import { Maximize2, Lock, Unlock, Percent, Hash } from 'lucide-react';
import type { ImageDataItem, ResizeSettings } from '../types';

interface ResizerToolProps {
  settings: ResizeSettings;
  onChange: (settings: ResizeSettings) => void;
  originalImage: ImageDataItem | null;
}

export const ResizerTool: React.FC<ResizerToolProps> = ({
  settings,
  onChange,
  originalImage,
}) => {
  const socialPresets = [
    { label: 'Instagram Square', width: 1080, height: 1080, desc: '1:1 feed' },
    { label: 'Instagram Story / Reel', width: 1080, height: 1920, desc: '9:16 vertical' },
    { label: 'Twitter / X Banner', width: 1500, height: 500, desc: '3:1 header' },
    { label: 'YouTube Thumbnail', width: 1280, height: 720, desc: '16:9 HD' },
    { label: 'Full HD Standard', width: 1920, height: 1080, desc: '1080p' },
    { label: 'Avatar / Profile', width: 500, height: 500, desc: '1:1 icon' },
  ];

  const scalePercentages = [25, 50, 75, 100, 150, 200];

  const handleWidthChange = (w: number) => {
    const validW = Math.max(1, w);
    if (settings.maintainAspectRatio && originalImage) {
      const ratio = originalImage.originalWidth / originalImage.originalHeight;
      onChange({
        ...settings,
        width: validW,
        height: Math.max(1, Math.round(validW / ratio)),
        scalePercent: 100,
      });
    } else {
      onChange({ ...settings, width: validW, scalePercent: 100 });
    }
  };

  const handleHeightChange = (h: number) => {
    const validH = Math.max(1, h);
    if (settings.maintainAspectRatio && originalImage) {
      const ratio = originalImage.originalWidth / originalImage.originalHeight;
      onChange({
        ...settings,
        height: validH,
        width: Math.max(1, Math.round(validH * ratio)),
        scalePercent: 100,
      });
    } else {
      onChange({ ...settings, height: validH, scalePercent: 100 });
    }
  };

  const handleScalePercent = (percent: number) => {
    if (!originalImage) return;
    const scale = percent / 100;
    onChange({
      ...settings,
      scalePercent: percent,
      width: Math.max(1, Math.round(originalImage.originalWidth * scale)),
      height: Math.max(1, Math.round(originalImage.originalHeight * scale)),
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-teal-400 mb-1">
          <Maximize2 className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider">The Resizer</h3>
        </div>
        <p className="text-xs text-slate-400">
          Scale by exact pixels or percentage while maintaining pixel clarity and aspect ratio.
        </p>
      </div>

      {/* Mode Selector: Exact Pixels vs Percentage */}
      <div className="p-4 rounded-2xl bg-[#090D18] border border-white/10 space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center space-x-1.5">
            <Hash className="w-3.5 h-3.5 text-teal-400" />
            <span>Target Dimensions (Pixels)</span>
          </span>

          <button
            type="button"
            onClick={() =>
              onChange({ ...settings, maintainAspectRatio: !settings.maintainAspectRatio })
            }
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              settings.maintainAspectRatio
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
            }`}
            title="Lock / Unlock Aspect Ratio"
          >
            {settings.maintainAspectRatio ? (
              <>
                <Lock className="w-3 h-3 text-teal-400" />
                <span>Aspect Locked</span>
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3" />
                <span>Free Ratio</span>
              </>
            )}
          </button>
        </div>

        {/* Width & Height Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Width (px)</label>
            <input
              type="number"
              min="1"
              max="10000"
              value={settings.width}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Height (px)</label>
            <input
              type="number"
              min="1"
              max="10000"
              value={settings.height}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Percentage Scaling Slider & Quick Chips */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
            <Percent className="w-3.5 h-3.5 text-teal-400" />
            <span>Scale Percentage</span>
          </span>
          <span className="font-mono text-teal-400 font-bold">{settings.scalePercent}%</span>
        </div>

        <input
          type="range"
          min="10"
          max="300"
          step="5"
          value={settings.scalePercent}
          onChange={(e) => handleScalePercent(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
        />

        <div className="flex flex-wrap gap-1.5 pt-1">
          {scalePercentages.map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => handleScalePercent(pct)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                settings.scalePercent === pct
                  ? 'bg-teal-500 text-black font-bold'
                  : 'bg-white/[0.03] text-slate-400 border border-white/10 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Social & Popular Size Presets */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-2">Social & Display Presets</label>
        <div className="grid grid-cols-2 gap-2">
          {socialPresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() =>
                onChange({
                  ...settings,
                  width: preset.width,
                  height: preset.height,
                  scalePercent: 100,
                  maintainAspectRatio: false,
                })
              }
              className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-teal-500/40 hover:bg-white/[0.06] text-left transition-all group"
            >
              <div className="text-xs font-bold text-white group-hover:text-teal-300 truncate">
                {preset.label}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {preset.width} × {preset.height} px
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
