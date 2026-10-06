import React from 'react';
import { ShieldCheck, Cpu, HardDrive, Lock, Sparkles, Image as ImageIcon } from 'lucide-react';

interface FooterProps {
  onSelectTool?: (tool: string) => void;
  onScrollToFaq?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTool, onScrollToFaq }) => {
  return (
    <footer className="w-full border-t border-white/10 bg-[#060911] pt-12 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <span className="text-base font-extrabold text-white">PureCut AI</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                100% Client-Side
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Remove backgrounds instantly, privately, and at full resolution directly in your browser. Purely client-side with zero cloud uploads, no watermarks, and zero compression artifacts.
            </p>
            <div className="text-[11px] text-indigo-400/90 font-mono">
              «No Upload • No Limit • No Watermark • Full Quality»
            </div>
          </div>

          {/* Tools Col */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Studio Tools</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTool?.('bg-remover')}
                  className="hover:text-indigo-400 transition-colors font-semibold text-indigo-300 flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Background Remover</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTool?.('compress')}
                  className="hover:text-indigo-400 transition-colors flex items-center space-x-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>The Compressor</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTool?.('convert')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  The Converter
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTool?.('resize')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  The Resizer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTool?.('watermark')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  The Watermarker
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTool?.('adjust')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  The Adjuster
                </button>
              </li>
            </ul>
          </div>

          {/* Capabilities Col */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Capabilities</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>Portrait & Headshot Isolation</li>
              <li>E-Commerce Product Cutouts</li>
              <li>Hair, Fur & Complex Alpha Matting</li>
              <li>Apple HEIC & ProRAW/RAW Browser Decoding</li>
              <li>Custom Colors, Gradients & Solid Backdrops</li>
              <li>Dual Brush Erase & Restore Refinement</li>
              <li>Batch Processing with Zero Cloud Latency</li>
            </ul>
          </div>

          {/* Privacy & Architecture */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Privacy & Architecture</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center space-x-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Server Uploads</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>On-Device WebAssembly & WebGPU</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>In-Memory RAM Safety</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                <span>IndexedDB Local History Storage</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <span>PureCut AI • Everything Image Studio</span>
          </div>
          <div className="flex items-center space-x-4">
            {onScrollToFaq && (
              <button
                type="button"
                onClick={onScrollToFaq}
                className="hover:text-slate-300 transition-colors"
              >
                FAQ
              </button>
            )}
            <a
              href="https://github.com/abhieee-java/everything-image-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              GitHub Open Source
            </a>
            <span>MIT License © 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

