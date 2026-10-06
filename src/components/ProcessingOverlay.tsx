import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';
import type { ProgressState } from '../utils/backgroundRemoval';

interface ProcessingOverlayProps {
  previewUrl: string;
  progress: ProgressState;
  onCancel?: () => void;
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  previewUrl,
  progress,
  onCancel,
}) => {
  return (
    <div className="relative w-full h-full min-h-[460px] flex flex-col items-center justify-center p-6 bg-[#070B14] rounded-2xl overflow-hidden border border-teal-500/30 shadow-2xl">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-cyan-500/5 to-transparent pointer-events-none" />

      {/* Frame Container */}
      <div className="relative max-w-md w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-teal-500/40 shadow-2xl bg-black">
        {/* Underneath: Transparent Grid */}
        <div className="absolute inset-0 bg-transparency-grid opacity-80" />

        {/* Original Base Image */}
        <img
          src={previewUrl}
          alt="Processing Source"
          className="w-full h-full object-contain relative z-10"
        />

        {/* Dynamic Alpha Wipe effect according to progress */}
        <div
          className="absolute inset-y-0 right-0 bg-transparency-grid z-20 transition-all duration-300 pointer-events-none opacity-40 mix-blend-overlay"
          style={{ width: `${Math.max(0, Math.min(100, progress.percent))}%` }}
        />

        {/* Laser Scanning Beam */}
        <div className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_20px_#2dd4bf] z-30 animate-scanline pointer-events-none">
          <div className="w-full h-12 -mt-6 bg-gradient-to-b from-teal-400/20 to-transparent blur-sm pointer-events-none" />
        </div>

        {/* Real-time Percentage Pill Badge */}
        <div className="absolute top-3 right-3 z-30 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-teal-500/40 text-teal-300 font-mono text-xs font-bold shadow-lg">
          {progress.percent}%
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-6 text-center max-w-sm w-full space-y-3 relative z-10">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-semibold text-teal-300 flex items-center space-x-1.5">
            <Cpu className="w-4 h-4 text-teal-400 animate-pulse" />
            <span>{progress.message || 'Analyzing subject…'}</span>
          </span>
          <span className="font-mono text-slate-400">{progress.percent}%</span>
        </div>

        {/* High Precision Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 transition-all duration-300 rounded-full shadow-[0_0_12px_rgba(45,212,191,0.5)]"
            style={{ width: `${progress.percent}%` }}
          />
        </div>

        <div className="flex items-center justify-center space-x-1.5 text-[11px] text-emerald-400/90 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span>100% On-Device Neural Processing • Zero Server Upload</span>
        </div>

        {onCancel && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-rose-400 underline transition-colors"
            >
              Cancel processing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
