import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Sparkles,
  Clipboard,
  ShieldCheck,
  Camera,
  ArrowRight,
  FileText,
} from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  onLoadSamples: () => void;
  compact?: boolean;
  h1Text?: string;
  subheadingText?: string;
  onOpenCamera?: () => void;
  activeTab?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  onLoadSamples,
  compact = false,
  h1Text = 'Image to Text Converter – Free Online OCR',
  subheadingText = 'Extract text from images directly in your browser. Free, unlimited, completely private, with no file uploads and no watermarks.',
  onOpenCamera,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  const isAcceptableFile = (file: File) => {
    if (file.type.startsWith('image/')) return true;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    return [
      'heic', 'heif', 'dng', 'cr2', 'cr3', 'nef', 'arw', 'raw', 'orf', 'rw2', 'pef',
      'png', 'jpg', 'jpeg', 'webp', 'avif', 'bmp', 'gif', 'tiff', 'tif'
    ].includes(ext);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).filter(isAcceptableFile);
      if (filesArray.length > 0) {
        onFilesSelected(filesArray);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
      e.target.value = '';
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
          accept="image/*,.heic,.heif,.dng,.cr2,.cr3,.nef,.arw,.raw"
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
    <div id="uploader-section" className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Hero Headline & Subtitle */}
      <div className="text-center mb-8 sm:mb-10 space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Client-Side Processing • Your Photos Never Leave Your Device</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
          {h1Text}
        </h1>

        <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
          {subheadingText}
        </p>

        {/* Hero Trust Badges Pill Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
            ✓ 100% Browser Processing
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
            ✓ No OCR Upload
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
            ✓ Free & Unlimited
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
            ✓ No Registration Required
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
            ✓ No Watermark
          </span>
        </div>
      </div>

      {/* Main Drag & Drop Surface */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-300 border-2 border-dashed select-none ${
          isDragOver
            ? 'border-teal-400 bg-teal-500/15 scale-[1.02] shadow-2xl shadow-teal-500/30'
            : 'border-white/15 hover:border-teal-500/50 bg-[#0E1524]/70 hover:bg-[#121B30]/80 glass-panel shadow-2xl'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.heic,.heif,.dng,.cr2,.cr3,.nef,.arw,.raw"
          className="hidden"
          onChange={handleFileInputChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="flex flex-col items-center justify-center space-y-5">
          {/* Animated Glow Icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-teal-500/20 blur-xl group-hover:bg-teal-500/40 transition-all" />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-teal-500/25 to-cyan-500/10 border border-teal-500/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg">
              <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12 text-teal-400 group-hover:text-teal-300 transition-colors" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isDragOver ? 'Drop your image here' : 'Drag & Drop your images here'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              or <span className="text-teal-400 font-semibold underline underline-offset-4">browse files</span> from your computer or phone
            </p>
          </div>

          {/* Action buttons inside drop surface */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-black font-bold text-xs sm:text-sm shadow-xl shadow-teal-500/25 transition-all flex items-center space-x-2 active:scale-95 cursor-pointer"
            >
              <span>Remove Background</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Camera Capture Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenCamera) {
                  onOpenCamera();
                } else {
                  cameraInputRef.current?.click();
                }
              }}
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-medium text-xs flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
              title="Capture document using webcam or phone camera"
            >
              <Camera className="w-4 h-4 text-teal-400" />
              <span>Camera</span>
            </button>
          </div>

          {/* Supported format pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {['PNG', 'JPG', 'WEBP', 'HEIC', 'RAW / ProRAW', 'AVIF', 'BMP'].map((fmt) => (
              <span
                key={fmt}
                className="px-2 py-0.5 text-[10px] sm:text-[11px] font-mono font-medium rounded-md bg-white/5 border border-white/10 text-slate-300"
              >
                {fmt}
              </span>
            ))}
          </div>

          {/* ProTip Clipboard paste hint */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 pt-1">
            <Clipboard className="w-3.5 h-3.5 text-teal-400" />
            <span>
              ProTip: Paste screenshot directly with{' '}
              <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded text-[10px] text-slate-300 font-mono">
                Ctrl + V
              </kbd>
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Sample Pill Action */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <span className="text-xs text-slate-400">Want to test it out right away?</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLoadSamples();
          }}
          className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Load High-Res Sample Images</span>
        </button>
      </div>
    </div>
  );
};
