import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Clipboard, Zap } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  onLoadSamples: () => void;
  compact?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  onLoadSamples,
  compact = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (filesArray.length > 0) {
        onFilesSelected(filesArray);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
      e.target.value = ''; // Reset so the same file can be re-selected if desired
    }
  };

  if (compact) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex items-center justify-center p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-teal-400 bg-teal-500/10 text-teal-300'
            : 'border-white/10 hover:border-teal-500/40 bg-white/[0.02] hover:bg-white/[0.05] text-slate-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
        />
        <div className="flex items-center space-x-2 text-xs font-medium">
          <UploadCloud className="w-4 h-4 text-teal-400" />
          <span>Add More Images</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Intro */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-4">
          <Zap className="w-3.5 h-3.5" />
          <span>Next-Gen In-Browser Studio</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
          The Everything{' '}
          <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Image Studio
          </span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Compress, convert, resize, watermark, and enhance your photos in seconds. Purely client-side with zero server latency and total privacy.
        </p>
      </div>

      {/* Main Dropzone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
          isDragOver
            ? 'border-teal-400 bg-teal-500/10 scale-[1.01] shadow-2xl shadow-teal-500/20'
            : 'border-white/15 hover:border-teal-500/50 bg-[#0E1524]/60 hover:bg-[#111B30]/70 glass-panel shadow-2xl'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml,image/bmp"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <UploadCloud className="w-10 h-10 text-teal-400 group-hover:text-teal-300 transition-colors" />
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
              Drag & Drop your images here
            </h3>
            <p className="text-sm text-slate-400">
              or <span className="text-teal-400 underline underline-offset-4 font-medium">browse files</span> from your computer
            </p>
          </div>

          {/* Supported formats pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            {['PNG', 'JPG', 'WEBP', 'AVIF', 'GIF', 'SVG', 'BMP'].map((fmt) => (
              <span
                key={fmt}
                className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-white/5 border border-white/10 text-slate-300"
              >
                {fmt}
              </span>
            ))}
          </div>

          {/* Clipboard Hint */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 pt-1">
            <Clipboard className="w-3.5 h-3.5" />
            <span>ProTip: You can also paste directly with <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-slate-300">Ctrl + V</kbd></span>
          </div>
        </div>
      </div>

      {/* Quick Start with Samples */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <span className="text-xs text-slate-400">Want to test it out right away?</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLoadSamples();
          }}
          className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Load High-Res Sample Images</span>
        </button>
      </div>

      {/* Features Showcase Grid */}
      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'The Compressor',
            desc: 'Extreme size reduction with intelligent perceptual quality preservation.',
            icon: '⚡',
          },
          {
            title: 'The Converter',
            desc: 'Lightning-fast cross-format conversion between JPG, PNG, and WebP.',
            icon: '🔄',
          },
          {
            title: 'The Resizer',
            desc: 'Precision aspect-ratio lock, custom dimensions, and social presets.',
            icon: '📐',
          },
          {
            title: 'The Watermarker',
            desc: 'Custom text overlays, opacity control, and 9-point grid positioning.',
            icon: '🏷️',
          },
        ].map((feat) => (
          <div
            key={feat.title}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="text-2xl mb-2">{feat.icon}</div>
            <h4 className="text-sm font-semibold text-white mb-1">{feat.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
