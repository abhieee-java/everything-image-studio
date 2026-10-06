import React from 'react';
import { ShieldCheck, Cpu, HardDrive, Lock, FileText } from 'lucide-react';

interface FooterProps {
  onSelectTool?: (tool: string) => void;
  onScrollToFaq?: () => void;
  onNavigateRoute?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTool, onScrollToFaq, onNavigateRoute }) => {
  return (
    <footer className="w-full border-t border-white/10 bg-[#060911] pt-12 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <span className="text-base font-extrabold text-white">TridentPDF</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                100% Client-Side
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extract text from images, photos, and scanned documents directly in your browser. Purely client-side with zero cloud uploads, no watermarks, and multi-language support.
            </p>
            <div className="text-[11px] text-teal-400/80 font-mono">
              «No Upload • No Watermark • 100% Free & Unlimited»
            </div>
          </div>

          {/* Tools Col */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Tools</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTool?.('ocr');
                    onNavigateRoute?.('/image-to-text');
                  }}
                  className="hover:text-teal-400 transition-colors font-medium text-teal-300 flex items-center space-x-1"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span>Image to Text OCR (Free)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTool?.('bg-remover')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Background Remover
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTool?.('compress')}
                  className="hover:text-teal-400 transition-colors"
                >
                  The Compressor
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTool?.('convert')}
                  className="hover:text-teal-400 transition-colors"
                >
                  The Converter
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTool?.('resize')}
                  className="hover:text-teal-400 transition-colors"
                >
                  The Resizer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTool?.('watermark')}
                  className="hover:text-teal-400 transition-colors"
                >
                  The Watermarker
                </button>
              </li>
            </ul>
          </div>

          {/* OCR Landing Pages */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">OCR Solutions</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateRoute?.('/table-ocr')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Table OCR (Image to CSV)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateRoute?.('/document-ocr')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Document OCR (Scanned Paper)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateRoute?.('/screenshot-to-text')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Screenshot to Text
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateRoute?.('/hindi-ocr')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Hindi OCR (हिन्दी)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateRoute?.('/bengali-ocr')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Bengali OCR (বাংলা)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateRoute?.('/assamese-ocr')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Assamese OCR (অসমীয়া)
                </button>
              </li>
            </ul>
          </div>

          {/* Privacy & Guarantees */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Privacy & Architecture</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center space-x-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Server Uploads</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tesseract WebAssembly Runtime</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>In-Memory Document Safety</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                <span>IndexedDB Offline Model Cache</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <span>Free Image to Text OCR Platform • TridentPDF & Everything Image Studio</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={onScrollToFaq}
              className="hover:text-slate-300 transition-colors"
            >
              FAQ
            </button>
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
