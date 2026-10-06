import React from 'react';
import { Sliders, RotateCw, FlipHorizontal, FlipVertical, Undo2, Sun, Contrast, Droplet } from 'lucide-react';
import type { AdjustmentSettings } from '../types';

interface AdjustToolProps {
  settings: AdjustmentSettings;
  onChange: (settings: AdjustmentSettings) => void;
  onReset: () => void;
}

export const AdjustTool: React.FC<AdjustToolProps> = ({
  settings,
  onChange,
  onReset,
}) => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-teal-400 mb-1">
            <Sliders className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Enhance & Adjust</h3>
          </div>
          <p className="text-xs text-slate-400">
            Tune lighting, color tones, orientation, and artistic filters.
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          title="Reset all adjustments"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Transform Controls (Rotate & Flip) */}
      <div className="p-3.5 rounded-2xl bg-[#090D18] border border-white/10 space-y-2">
        <label className="text-xs font-semibold text-slate-300 block">Transform & Orientation</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() =>
              onChange({ ...settings, rotate: (settings.rotate + 90) % 360 })
            }
            className="flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 text-xs font-medium border border-white/5 transition-all"
          >
            <RotateCw className="w-3.5 h-3.5 text-teal-400" />
            <span>Rotate 90°</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onChange({ ...settings, flipHorizontal: !settings.flipHorizontal })
            }
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-medium border transition-all ${
              settings.flipHorizontal
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                : 'bg-white/[0.03] text-slate-300 border-white/5 hover:bg-white/[0.08]'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5 text-teal-400" />
            <span>Flip H</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onChange({ ...settings, flipVertical: !settings.flipVertical })
            }
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-medium border transition-all ${
              settings.flipVertical
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                : 'bg-white/[0.03] text-slate-300 border-white/5 hover:bg-white/[0.08]'
            }`}
          >
            <FlipVertical className="w-3.5 h-3.5 text-teal-400" />
            <span>Flip V</span>
          </button>
        </div>
      </div>

      {/* Sliders for Tone and Color */}
      <div className="space-y-4">
        {/* Brightness */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center space-x-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Brightness</span>
            </span>
            <span className="font-mono text-teal-400">{settings.brightness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={settings.brightness}
            onChange={(e) => onChange({ ...settings, brightness: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center space-x-1.5">
              <Contrast className="w-3.5 h-3.5 text-cyan-400" />
              <span>Contrast</span>
            </span>
            <span className="font-mono text-teal-400">{settings.contrast}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={settings.contrast}
            onChange={(e) => onChange({ ...settings, contrast: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        {/* Saturation */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center space-x-1.5">
              <Droplet className="w-3.5 h-3.5 text-rose-400" />
              <span>Saturation</span>
            </span>
            <span className="font-mono text-teal-400">{settings.saturation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={settings.saturation}
            onChange={(e) => onChange({ ...settings, saturation: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        {/* Artistic Quick Filters */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">Artistic Filters</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() =>
                onChange({ ...settings, grayscale: settings.grayscale === 100 ? 0 : 100 })
              }
              className={`py-1.5 rounded-xl text-xs font-medium border transition-all ${
                settings.grayscale === 100
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                  : 'bg-white/[0.03] text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              Grayscale
            </button>

            <button
              type="button"
              onClick={() =>
                onChange({ ...settings, sepia: settings.sepia === 100 ? 0 : 100 })
              }
              className={`py-1.5 rounded-xl text-xs font-medium border transition-all ${
                settings.sepia === 100
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                  : 'bg-white/[0.03] text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              Sepia
            </button>

            <button
              type="button"
              onClick={() =>
                onChange({ ...settings, invert: settings.invert === 100 ? 0 : 100 })
              }
              className={`py-1.5 rounded-xl text-xs font-medium border transition-all ${
                settings.invert === 100
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                  : 'bg-white/[0.03] text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              Invert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
