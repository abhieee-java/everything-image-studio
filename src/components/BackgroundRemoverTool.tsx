import React, { useRef } from 'react';
import {
  Sparkles,
  Palette,
  Paintbrush,
  Crop,
  Download,
  Share2,
  Undo2,
  Redo2,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ShieldCheck,
  Image as ImageIcon,
  Eraser,
  RefreshCw,
} from 'lucide-react';
import type {
  BackgroundRemovalSettings,
  BackgroundType,
  BrushSettings,
  SmartMode,
} from '../types';

interface BackgroundRemoverToolProps {
  settings: BackgroundRemovalSettings;
  onChangeSettings: (settings: BackgroundRemovalSettings) => void;
  brushSettings: BrushSettings;
  onChangeBrush: (settings: BrushSettings) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExport: (format: 'image/png' | 'image/jpeg' | 'image/webp') => void;
  onShare: () => void;
  canShare: boolean;
  isProcessing: boolean;
  rotation: number;
  onRotate: () => void;
  flipH: boolean;
  flipV: boolean;
  onToggleFlipH: () => void;
  onToggleFlipV: () => void;
  onReprocess: () => void;
  originalFormatExtension?: string | null;
  isHeicOrRaw?: boolean;
}

export const BackgroundRemoverTool: React.FC<BackgroundRemoverToolProps> = ({
  settings,
  onChangeSettings,
  brushSettings,
  onChangeBrush,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExport,
  onShare,
  canShare,
  isProcessing,
  rotation,
  onRotate,
  flipH,
  flipV,
  onToggleFlipH,
  onToggleFlipV,
  onReprocess,
  originalFormatExtension,
  isHeicOrRaw,
}) => {
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  const smartModes: Array<{ id: SmartMode; label: string; desc: string }> = [
    { id: 'auto', label: 'Auto', desc: 'Neural general segmentation' },
    { id: 'portrait', label: 'Portrait', desc: 'Soft hair & human edges' },
    { id: 'product', label: 'Product', desc: 'Sharp studio object contours' },
    { id: 'hair-fur', label: 'Hair & Fur', desc: 'Sub-pixel fine detail matting' },
  ];

  const bgPresets: Array<{ id: BackgroundType; label: string }> = [
    { id: 'transparent', label: 'Transparent' },
    { id: 'solid', label: 'Solid Color' },
    { id: 'gradient', label: 'Gradients' },
    { id: 'blur', label: 'Blur Original' },
    { id: 'image', label: 'Custom Image' },
  ];

  const solidColors = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Black', hex: '#000000' },
    { name: 'Neutral Gray', hex: '#F1F5F9' },
    { name: 'Dark Slate', hex: '#1E293B' },
    { name: 'Vibrant Blue', hex: '#3B82F6' },
    { name: 'Emerald', hex: '#10B981' },
    { name: 'Rose', hex: '#F43F5E' },
    { name: 'Amber', hex: '#F59E0B' },
  ];

  const gradientPresets = [
    { name: 'Electric Studio', value: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' },
    { name: 'Sunset Glow', value: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' },
    { name: 'Ocean Mist', value: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' },
    { name: 'Cyber Neon', value: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' },
    { name: 'Soft Minimal', value: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)' },
    { name: 'Midnight Deep', value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' },
  ];

  const cropAspectPresets = [
    { id: 'free', label: 'Original', desc: 'Native canvas' },
    { id: 'product-white', label: 'E-Commerce', desc: 'White 1:1 + padding' },
    { id: '1:1', label: 'Square (1:1)', desc: 'Instagram post' },
    { id: '4:5', label: 'Portrait (4:5)', desc: 'Social feed' },
    { id: '9:16', label: 'Story (9:16)', desc: 'Reels / TikTok' },
    { id: '16:9', label: 'Banner (16:9)', desc: 'YouTube thumbnail' },
    { id: 'profile', label: 'Avatar Circle', desc: 'Profile photo' },
  ];

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      onChangeSettings({
        ...settings,
        bgType: 'image',
        bgImageUrl: url,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Smart Mode Selector */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>AI Smart Modes</span>
          </label>
          <button
            type="button"
            onClick={onReprocess}
            disabled={isProcessing}
            className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center space-x-1 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Re-process</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {smartModes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onChangeSettings({ ...settings, smartMode: m.id });
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                settings.smartMode === m.id
                  ? 'bg-teal-500/15 border-teal-500/50 text-white shadow-sm shadow-teal-500/20'
                  : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <div className="text-xs font-semibold">{m.label}</div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Background Selector */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
          <Palette className="w-3.5 h-3.5 text-teal-400" />
          <span>Background</span>
        </label>

        {/* Background Type Pills */}
        <div className="flex flex-wrap gap-1.5">
          {bgPresets.map((bg) => (
            <button
              key={bg.id}
              type="button"
              onClick={() => onChangeSettings({ ...settings, bgType: bg.id })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                (settings.bgType || 'transparent') === bg.id
                  ? 'bg-teal-500 text-black font-semibold shadow-md shadow-teal-500/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {bg.label}
            </button>
          ))}
        </div>

        {/* Sub-controls based on background type */}
        {settings.bgType === 'solid' && (
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-300">Preset:</span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {solidColors.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    title={col.name}
                    onClick={() => onChangeSettings({ ...settings, bgColor: col.hex })}
                    className={`w-6 h-6 rounded-full border border-white/20 transition-transform ${
                      settings.bgColor === col.hex ? 'scale-125 ring-2 ring-teal-400' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1 border-t border-white/5">
              <span className="text-xs text-slate-400">Custom Hex:</span>
              <input
                type="color"
                value={settings.bgColor || '#FFFFFF'}
                onChange={(e) => onChangeSettings({ ...settings, bgColor: e.target.value })}
                className="w-7 h-7 rounded border border-white/10 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={settings.bgColor || '#FFFFFF'}
                onChange={(e) => onChangeSettings({ ...settings, bgColor: e.target.value })}
                className="flex-1 px-2 py-1 rounded bg-black/40 border border-white/10 text-xs font-mono text-white"
              />
            </div>
          </div>
        )}

        {settings.bgType === 'gradient' && (
          <div className="grid grid-cols-3 gap-2">
            {gradientPresets.map((g) => (
              <button
                key={g.name}
                type="button"
                onClick={() => onChangeSettings({ ...settings, bgGradient: g.value })}
                className={`h-11 rounded-xl border p-1 transition-all flex flex-col justify-end text-[10px] font-medium text-white shadow-sm ${
                  settings.bgGradient === g.value ? 'ring-2 ring-teal-400 border-white' : 'border-white/10'
                }`}
                style={{ background: g.value }}
              >
                <span className="px-1 py-0.5 rounded bg-black/50 truncate w-full text-center">
                  {g.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {settings.bgType === 'blur' && (
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Blur Radius</span>
              <span className="font-mono text-teal-400">{settings.bgBlur ?? 16}px</span>
            </div>
            <input
              type="range"
              min="2"
              max="40"
              value={settings.bgBlur ?? 16}
              onChange={(e) =>
                onChangeSettings({ ...settings, bgBlur: parseInt(e.target.value, 10) })
              }
              className="w-full accent-teal-400"
            />
          </div>
        )}

        {settings.bgType === 'image' && (
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <input
              ref={bgFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCustomBgUpload}
            />
            <button
              type="button"
              onClick={() => bgFileInputRef.current?.click()}
              className="w-full py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{settings.bgImageUrl ? 'Change Background Image' : 'Upload Background Image'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Refine Edges (Interactive Brush) */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Paintbrush className="w-3.5 h-3.5 text-teal-400" />
            <span>Refine Edges (Brush)</span>
          </label>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors disabled:opacity-30"
              title="Undo Brush Edit (Ctrl+Z)"
              aria-label="Undo brush edit"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors disabled:opacity-30"
              title="Redo Brush Edit (Ctrl+Shift+Z)"
              aria-label="Redo brush edit"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Brush Mode Toggles */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onChangeBrush({ ...brushSettings, mode: 'erase' })}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              brushSettings.mode === 'erase'
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Erase (E)</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeBrush({ ...brushSettings, mode: 'restore' })}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              brushSettings.mode === 'restore'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>Restore (R)</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeBrush({ ...brushSettings, mode: 'none' })}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              brushSettings.mode === 'none'
                ? 'bg-teal-500 text-black'
                : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5'
            }`}
          >
            <span>Pan / View</span>
          </button>
        </div>

        {brushSettings.mode !== 'none' && (
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Brush Size</span>
                <span className="font-mono text-teal-400">{brushSettings.size}px</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={brushSettings.size}
                onChange={(e) =>
                  onChangeBrush({ ...brushSettings, size: parseInt(e.target.value, 10) })
                }
                className="w-full accent-teal-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Hardness / Feather</span>
                <span className="font-mono text-teal-400">
                  {Math.round(brushSettings.hardness * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={brushSettings.hardness}
                onChange={(e) =>
                  onChangeBrush({ ...brushSettings, hardness: parseFloat(e.target.value) })
                }
                className="w-full accent-teal-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Smart Crop & Presets */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
          <Crop className="w-3.5 h-3.5 text-teal-400" />
          <span>Smart Crop & Presets</span>
        </label>

        {/* Auto Crop Options */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'original', label: 'Canvas' },
            { id: 'balanced', label: 'Balanced' },
            { id: 'tight', label: 'Tight Cut' },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() =>
                onChangeSettings({
                  ...settings,
                  autoCrop: c.id as 'original' | 'tight' | 'balanced',
                })
              }
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                (settings.autoCrop || 'original') === c.id
                  ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                  : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Aspect Ratio Presets */}
        <div className="grid grid-cols-2 gap-1.5">
          {cropAspectPresets.map((asp) => (
            <button
              key={asp.id}
              type="button"
              onClick={() =>
                onChangeSettings({
                  ...settings,
                  aspectPreset: asp.id as BackgroundRemovalSettings['aspectPreset'],
                })
              }
              className={`p-2 rounded-lg border text-left transition-all ${
                (settings.aspectPreset || 'free') === asp.id
                  ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                  : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <div className="text-[11px] font-semibold text-white">{asp.label}</div>
              <div className="text-[9px] text-slate-500">{asp.desc}</div>
            </button>
          ))}
        </div>

        {/* Transforms (Rotate, Flip) */}
        <div className="flex items-center space-x-2 pt-1">
          <button
            type="button"
            onClick={onRotate}
            className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Rotate ({rotation}°)</span>
          </button>
          <button
            type="button"
            onClick={onToggleFlipH}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              flipH ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-white/5 border-transparent text-slate-300'
            }`}
            title="Flip Horizontal"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleFlipV}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              flipV ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-white/5 border-transparent text-slate-300'
            }`}
            title="Flip Vertical"
          >
            <FlipVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Metadata Privacy Toggle & Export */}
      <div className="space-y-3 pt-3 border-t border-white/10">
        <label className="flex items-center space-x-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.removeMetadata}
            onChange={(e) =>
              onChangeSettings({ ...settings, removeMetadata: e.target.checked })
            }
            className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
          />
          <div className="text-xs">
            <span className="font-semibold text-slate-200 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Remove Metadata (Privacy Shield)</span>
            </span>
            <span className="text-[10px] text-slate-500 block">
              Removes embedded EXIF location and camera information before export.
            </span>
          </div>
        </label>

        {/* Primary Export Actions */}
        <div className="space-y-2 pt-2">
          {isHeicOrRaw && originalFormatExtension ? (
            <>
              <button
                type="button"
                onClick={() => onExport('image/jpeg')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-black font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/25 transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Download {originalFormatExtension.toUpperCase()} (Native • Full Res)</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => onExport('image/png')}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-xs border border-white/10 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG</span>
                </button>

                <button
                  type="button"
                  onClick={() => onExport('image/jpeg')}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-xs border border-white/10 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JPG</span>
                </button>

                <button
                  type="button"
                  onClick={() => onExport('image/webp')}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-xs border border-white/10 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>WebP</span>
                </button>

                {canShare && (
                  <button
                    type="button"
                    onClick={onShare}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-teal-400 border border-white/10 transition-all"
                    title="Share via device Web Share API"
                    aria-label="Share result"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onExport('image/png')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-black font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/25 transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG (Transparent • Full Res)</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => onExport('image/jpeg')}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-xs border border-white/10 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JPG</span>
                </button>

                <button
                  type="button"
                  onClick={() => onExport('image/webp')}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-xs border border-white/10 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download WebP</span>
                </button>

                {canShare && (
                  <button
                    type="button"
                    onClick={onShare}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-teal-400 border border-white/10 transition-all"
                    title="Share via device Web Share API"
                    aria-label="Share result"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
