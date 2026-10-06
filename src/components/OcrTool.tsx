import React, { useState } from 'react';
import {
  FileText,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Globe,
  RotateCw,
  RotateCcw,
  Zap,
  Shield,
  Layers,
  HelpCircle,
} from 'lucide-react';
import type {
  OcrLanguage,
  OcrMode,
  OcrPreprocessingSettings,
} from '../types/ocr';
import { OCR_LANGUAGES, searchLanguages } from '../utils/ocrLanguages';

interface OcrToolProps {
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  selectedMode: OcrMode;
  onSelectMode: (mode: OcrMode) => void;
  preprocessing: OcrPreprocessingSettings;
  onChangePreprocessing: (settings: OcrPreprocessingSettings) => void;
  isProcessing: boolean;
  progressPercent: number;
  progressMessage: string;
  onRunOcr: () => void;
  onCancelOcr?: () => void;
  hasImage: boolean;
  onOpenBatch?: () => void;
  totalImagesCount?: number;
}

export const OcrTool: React.FC<OcrToolProps> = ({
  selectedLanguage,
  onSelectLanguage,
  selectedMode,
  onSelectMode,
  preprocessing,
  onChangePreprocessing,
  isProcessing,
  progressPercent,
  progressMessage,
  onRunOcr,
  onCancelOcr,
  hasImage,
  onOpenBatch,
  totalImagesCount = 1,
}) => {
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [showAdvancedPreprocessing, setShowAdvancedPreprocessing] = useState(false);

  // Close language dropdown on Escape key
  React.useEffect(() => {
    if (!isLangDropdownOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLangDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLangDropdownOpen]);

  const filteredLanguages = searchLanguages(langSearch);
  const currentLangObj = OCR_LANGUAGES.find((l) => l.code === selectedLanguage) || OCR_LANGUAGES[0];

  const popularLanguages = OCR_LANGUAGES.filter((l) =>
    ['eng', 'hin', 'ben', 'asm', 'spa', 'fra', 'deu', 'chi_sim', 'ara'].includes(l.code)
  );

  const modes: Array<{ id: OcrMode; label: string; desc: string; icon: string }> = [
    { id: 'standard', label: 'Standard OCR', desc: 'General-purpose text recognition', icon: '⚡' },
    { id: 'document', label: 'Document OCR', desc: 'Scanned pages, contracts & books', icon: '📄' },
    { id: 'screenshot', label: 'Screenshot OCR', desc: 'UI, chats, code & screen grabs', icon: '💻' },
    { id: 'table', label: 'Table OCR', desc: 'Spreadsheets, receipts & grid tables', icon: '📊' },
    { id: 'handwriting', label: 'Handwriting', desc: 'Cursive & print notes (best-effort)', icon: '✍️' },
  ];

  return (
    <div className="space-y-5">
      {/* Tool Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-teal-400" />
            <span>Client-Side OCR Engine</span>
          </h2>
          <p className="text-xs text-slate-400">High-quality text extraction running locally in WebAssembly</p>
        </div>
        <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium">
          <Shield className="w-3 h-3" />
          <span>Zero Server Uploads</span>
        </div>
      </div>

      {/* 1. Language Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>Recognition Language</span>
          </span>
          <span className="text-[11px] text-slate-500 font-normal">Lazy-loaded on demand</span>
        </label>

        {/* Selected Language Display Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs font-medium text-white transition-colors"
            aria-expanded={isLangDropdownOpen}
            aria-haspopup="listbox"
          >
            <div className="flex items-center space-x-2">
              <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono text-[10px]">
                {currentLangObj.code}
              </span>
              <span className="font-semibold">{currentLangObj.name}</span>
              <span className="text-slate-400">({currentLangObj.nativeName})</span>
            </div>
            {isLangDropdownOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Language Dropdown Modal */}
          {isLangDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0E1524] border border-white/15 rounded-xl shadow-2xl p-3 max-h-72 overflow-y-auto">
              <input
                type="text"
                placeholder="Search languages (English, Hindi, Bengali, Arabic...)"
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                className="w-full px-3 py-1.5 mb-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                autoFocus
              />

              <div className="space-y-1">
                {filteredLanguages.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2 text-center">No matching languages found</p>
                ) : (
                  filteredLanguages.map((l: OcrLanguage) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        onSelectLanguage(l.code);
                        setIsLangDropdownOpen(false);
                        setLangSearch('');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                        selectedLanguage === l.code
                          ? 'bg-teal-500/20 text-teal-300 font-medium'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-slate-400">{l.code}</span>
                        <span>{l.name}</span>
                        <span className="text-slate-500 text-[11px]">{l.nativeName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{l.category}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick popular language pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {popularLanguages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => onSelectLanguage(l.code)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                selectedLanguage === l.code
                  ? 'bg-teal-500 text-black shadow-sm font-semibold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. OCR Mode Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">OCR Extraction Mode</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {modes.map((m) => {
            const isSelected = selectedMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMode(m.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-teal-400 bg-teal-500/15 text-white shadow-md shadow-teal-500/10'
                    : 'border-white/10 hover:border-white/20 bg-white/[0.02] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-0.5">
                  <span className="text-sm">{m.icon}</span>
                  <span className={`text-xs font-semibold ${isSelected ? 'text-teal-300' : 'text-slate-200'}`}>
                    {m.label}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight line-clamp-1">{m.desc}</p>
              </button>
            );
          })}
        </div>

        {selectedMode === 'handwriting' && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start space-x-2">
            <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <p>
              Handwriting recognition operates on a best-effort basis. Clean block print and semi-cursive characters achieve the highest accuracy.
            </p>
          </div>
        )}
      </div>

      {/* 3. Image Preprocessing (Auto Enhance & Advanced) */}
      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-semibold text-white">Image Preprocessing</span>
          </div>

          {/* 1-Click Auto Enhance Button */}
          <button
            type="button"
            onClick={() =>
              onChangePreprocessing({
                ...preprocessing,
                autoEnhance: !preprocessing.autoEnhance,
              })
            }
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              preprocessing.autoEnhance
                ? 'bg-teal-500 text-black shadow-md shadow-teal-500/25 scale-105'
                : 'bg-white/5 hover:bg-white/10 text-teal-300 border border-teal-500/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto Enhance</span>
          </button>
        </div>

        {/* Expandable Advanced Controls Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvancedPreprocessing((prev) => !prev)}
          className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 pt-1"
        >
          <span>Advanced Preprocessing Filters (Binarize, Deskew, Sharpen...)</span>
          {showAdvancedPreprocessing ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvancedPreprocessing && (
          <div className="pt-2 space-y-3 border-t border-white/5">
            {/* Quick toggle chips */}
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preprocessing.grayscale}
                  onChange={(e) =>
                    onChangePreprocessing({ ...preprocessing, grayscale: e.target.checked })
                  }
                  className="rounded text-teal-500 focus:ring-teal-400 bg-white/5 border-white/20"
                />
                <span>Grayscale</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preprocessing.sharpen}
                  onChange={(e) =>
                    onChangePreprocessing({ ...preprocessing, sharpen: e.target.checked })
                  }
                  className="rounded text-teal-500 focus:ring-teal-400 bg-white/5 border-white/20"
                />
                <span>Sharpen Filter</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preprocessing.deskew}
                  onChange={(e) =>
                    onChangePreprocessing({ ...preprocessing, deskew: e.target.checked })
                  }
                  className="rounded text-teal-500 focus:ring-teal-400 bg-white/5 border-white/20"
                />
                <span>Auto-Deskew (Straighten)</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preprocessing.binarize}
                  onChange={(e) =>
                    onChangePreprocessing({ ...preprocessing, binarize: e.target.checked })
                  }
                  className="rounded text-teal-500 focus:ring-teal-400 bg-white/5 border-white/20"
                />
                <span>Otsu Binarization</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preprocessing.invert}
                  onChange={(e) =>
                    onChangePreprocessing({ ...preprocessing, invert: e.target.checked })
                  }
                  className="rounded text-teal-500 focus:ring-teal-400 bg-white/5 border-white/20"
                />
                <span>Invert (Dark Mode Text)</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preprocessing.denoise}
                  onChange={(e) =>
                    onChangePreprocessing({ ...preprocessing, denoise: e.target.checked })
                  }
                  className="rounded text-teal-500 focus:ring-teal-400 bg-white/5 border-white/20"
                />
                <span>Noise Reduction</span>
              </label>
            </div>

            {/* Sliders: Contrast & Brightness */}
            <div className="space-y-2 pt-1">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Contrast Adjustment</span>
                  <span>{preprocessing.contrast > 0 ? `+${preprocessing.contrast}` : preprocessing.contrast}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="100"
                  value={preprocessing.contrast}
                  aria-label="Contrast Adjustment"
                  onChange={(e) =>
                    onChangePreprocessing({ ...preprocessing, contrast: Number(e.target.value) })
                  }
                  className="w-full accent-teal-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Brightness Adjustment</span>
                  <span>{preprocessing.brightness > 0 ? `+${preprocessing.brightness}` : preprocessing.brightness}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={preprocessing.brightness}
                  aria-label="Brightness Adjustment"
                  onChange={(e) =>
                    onChangePreprocessing({ ...preprocessing, brightness: Number(e.target.value) })
                  }
                  className="w-full accent-teal-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Rotation Controls */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Orientation</span>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() =>
                    onChangePreprocessing({
                      ...preprocessing,
                      rotation: (preprocessing.rotation - 90 + 360) % 360,
                    })
                  }
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs flex items-center space-x-1"
                  title="Rotate 90° CCW"
                  aria-label="Rotate 90 degrees counter-clockwise"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>90°</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChangePreprocessing({
                      ...preprocessing,
                      rotation: (preprocessing.rotation + 90) % 360,
                    })
                  }
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs flex items-center space-x-1"
                  title="Rotate 90° CW"
                  aria-label="Rotate 90 degrees clockwise"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>90°</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Action Button & Progress */}
      <div className="space-y-3 pt-2">
        {isProcessing && (
          <div className="p-3.5 rounded-xl bg-teal-950/40 border border-teal-500/30 space-y-2" aria-live="polite">
            <div className="flex items-center justify-between text-xs">
              <span className="text-teal-300 font-medium">{progressMessage || 'Processing OCR locally...'}</span>
              <div className="flex items-center space-x-2">
                <span className="text-teal-400 font-bold">{progressPercent}%</span>
                {onCancelOcr && (
                  <button
                    type="button"
                    onClick={onCancelOcr}
                    className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-semibold border border-rose-500/30 transition-colors"
                    aria-label="Cancel OCR extraction"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-300"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={!hasImage || isProcessing}
          onClick={onRunOcr}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-teal-400 via-teal-500 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-black shadow-lg shadow-teal-500/25 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-black" />
          <span>{isProcessing ? 'Extracting Text...' : 'Extract Text Directly in Browser'}</span>
        </button>

        {totalImagesCount > 1 && onOpenBatch && (
          <button
            type="button"
            onClick={onOpenBatch}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>Process All {totalImagesCount} Images in Batch</span>
          </button>
        )}
      </div>
    </div>
  );
};
