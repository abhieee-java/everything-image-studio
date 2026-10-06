import React, { useRef } from 'react';
import { Type, Grid3X3, Image as ImageIcon, RotateCw, Sparkles } from 'lucide-react';
import type { WatermarkPosition, WatermarkSettings } from '../types';

interface WatermarkerToolProps {
  settings: WatermarkSettings;
  onChange: (settings: WatermarkSettings) => void;
}

export const WatermarkerTool: React.FC<WatermarkerToolProps> = ({
  settings,
  onChange,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const positions: Array<{ id: WatermarkPosition; label: string; icon: string }> = [
    { id: 'top-left', label: 'Top Left', icon: '↖' },
    { id: 'top-center', label: 'Top Center', icon: '↑' },
    { id: 'top-right', label: 'Top Right', icon: '↗' },
    { id: 'center-left', label: 'Center Left', icon: '←' },
    { id: 'center', label: 'Center', icon: '•' },
    { id: 'center-right', label: 'Center Right', icon: '→' },
    { id: 'bottom-left', label: 'Bottom Left', icon: '↙' },
    { id: 'bottom-center', label: 'Bottom Center', icon: '↓' },
    { id: 'bottom-right', label: 'Bottom Right', icon: '↘' },
  ];

  const fontFamilies = [
    { label: 'Sans Serif (Modern)', value: 'Inter, system-ui, sans-serif' },
    { label: 'Monospace (Tech)', value: 'JetBrains Mono, monospace' },
    { label: 'Serif (Editorial)', value: 'Georgia, serif' },
    { label: 'Impact (Bold)', value: 'Impact, sans-serif' },
  ];

  const presetColors = ['#FFFFFF', '#000000', '#2DD4BF', '#F59E0B', '#EF4444', '#818CF8'];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      onChange({
        ...settings,
        type: 'image',
        watermarkImageFile: file,
        watermarkImageUrl: url,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-teal-400 mb-1">
          <Type className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider">The Watermarker</h3>
        </div>
        <p className="text-xs text-slate-400">
          Protect your creative assets with custom text stamps or logo overlays.
        </p>
      </div>

      {/* Watermark Type Selector (Text vs Logo Image) */}
      <div className="flex items-center p-1 bg-slate-900 border border-white/10 rounded-xl">
        <button
          type="button"
          onClick={() => onChange({ ...settings, type: 'text' })}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
            settings.type === 'text'
              ? 'bg-teal-500 text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Text Watermark</span>
        </button>

        <button
          type="button"
          onClick={() => onChange({ ...settings, type: 'image' })}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
            settings.type === 'image'
              ? 'bg-teal-500 text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Logo Image Stamp</span>
        </button>
      </div>

      {/* TEXT WATERMARK CONTROLS */}
      {settings.type === 'text' ? (
        <div className="space-y-4">
          {/* Custom Text Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Watermark Text</label>
            <input
              type="text"
              value={settings.text}
              onChange={(e) => onChange({ ...settings, text: e.target.value })}
              placeholder="e.g. © 2026 Your Brand"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-teal-500 focus:outline-none placeholder-slate-600 font-medium"
            />
          </div>

          {/* Font Family & Size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Typography</label>
              <select
                value={settings.fontFamily}
                onChange={(e) => onChange({ ...settings, fontFamily: e.target.value })}
                aria-label="Watermark Typography"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              >
                {fontFamilies.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Font Size</span>
                <span className="font-mono text-teal-400">{settings.fontSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="120"
                value={settings.fontSize}
                onChange={(e) => onChange({ ...settings, fontSize: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 mt-2"
              />
            </div>
          </div>

          {/* Color & Opacity */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Text Color</label>
              <div className="flex items-center space-x-1.5">
                {presetColors.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => onChange({ ...settings, color: col })}
                    className={`w-5 h-5 rounded-md border transition-all ${
                      settings.color === col ? 'scale-110 border-teal-400 shadow-sm' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
                <input
                  type="color"
                  value={settings.color}
                  onChange={(e) => onChange({ ...settings, color: e.target.value })}
                  className="w-6 h-6 rounded-md border-0 bg-transparent cursor-pointer ml-1"
                />
              </div>
            </div>

            {/* Opacity slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Opacity</span>
                <span className="font-mono text-teal-400 font-bold">
                  {Math.round(settings.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={settings.opacity}
                onChange={(e) => onChange({ ...settings, opacity: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>
          </div>
        </div>
      ) : (
        /* IMAGE / LOGO WATERMARK CONTROLS */
        <div className="space-y-4">
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/svg+xml,image/webp"
            className="hidden"
            onChange={handleLogoUpload}
          />

          <div
            onClick={() => logoInputRef.current?.click()}
            className="p-4 rounded-2xl border-2 border-dashed border-white/20 hover:border-teal-400/50 bg-white/[0.02] hover:bg-white/[0.05] text-center cursor-pointer transition-all"
          >
            {settings.watermarkImageUrl ? (
              <div className="flex items-center justify-center space-x-3">
                <img
                  src={settings.watermarkImageUrl}
                  alt="Watermark Logo"
                  className="h-10 w-auto max-w-[120px] object-contain border border-white/10 rounded p-1 bg-black/40"
                />
                <div className="text-left text-xs">
                  <p className="font-semibold text-white">Logo Uploaded</p>
                  <p className="text-teal-400 text-[11px]">Click to replace logo</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <ImageIcon className="w-6 h-6 text-teal-400 mx-auto" />
                <p className="text-xs font-semibold text-white">Upload Watermark Stamp</p>
                <p className="text-[10px] text-slate-400">PNG with transparency recommended</p>
              </div>
            )}
          </div>

          {/* Logo Scale */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Logo Scale</span>
              <span className="font-mono text-teal-400 font-bold">
                {settings.watermarkImageScale || 25}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={settings.watermarkImageScale || 25}
              onChange={(e) =>
                onChange({ ...settings, watermarkImageScale: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
          </div>

          {/* Logo Opacity */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Logo Opacity</span>
              <span className="font-mono text-teal-400 font-bold">
                {Math.round(settings.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={settings.opacity}
              onChange={(e) => onChange({ ...settings, opacity: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
          </div>
        </div>
      )}

      {/* Positioning Matrix & Tiled Mode */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center space-x-1.5">
            <Grid3X3 className="w-3.5 h-3.5 text-teal-400" />
            <span>Positioning Matrix</span>
          </span>

          <button
            type="button"
            onClick={() =>
              onChange({
                ...settings,
                position: settings.position === 'tiled' ? 'bottom-right' : 'tiled',
              })
            }
            className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
              settings.position === 'tiled'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Tiled Repeat Pattern</span>
          </button>
        </div>

        {/* 9-Point Grid Selector */}
        {settings.position !== 'tiled' && (
          <div className="grid grid-cols-3 gap-1.5 p-3 rounded-2xl bg-[#090D18] border border-white/10 max-w-[240px] mx-auto">
            {positions.map((pos) => {
              const isSelected = settings.position === pos.id;
              return (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => onChange({ ...settings, position: pos.id })}
                  title={pos.label}
                  className={`h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    isSelected
                      ? 'bg-teal-500 text-black shadow-md shadow-teal-500/30 scale-105'
                      : 'bg-white/[0.04] text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {pos.icon}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Rotation Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
            <RotateCw className="w-3.5 h-3.5 text-teal-400" />
            <span>Angle / Rotation</span>
          </span>
          <span className="font-mono text-teal-400 font-bold">{settings.rotation}°</span>
        </div>

        <input
          type="range"
          min="-90"
          max="90"
          step="5"
          value={settings.rotation}
          onChange={(e) => onChange({ ...settings, rotation: parseInt(e.target.value) })}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
        />

        <div className="flex justify-center space-x-2 pt-1">
          {[-45, -30, 0, 30, 45].map((deg) => (
            <button
              key={deg}
              type="button"
              onClick={() => onChange({ ...settings, rotation: deg })}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                settings.rotation === deg
                  ? 'bg-teal-500 text-black font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {deg}°
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
