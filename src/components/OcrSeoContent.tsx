import React from 'react';
import {
  Zap,
  Globe,
  Lock,
  CheckCircle,
  FileText,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import type { OcrRouteConfig } from '../types/ocr';
import { OCR_LANGUAGES } from '../utils/ocrLanguages';

interface OcrSeoContentProps {
  routeConfig: OcrRouteConfig;
  onNavigateRoute: (path: string) => void;
}

export const OcrSeoContent: React.FC<OcrSeoContentProps> = ({
  routeConfig,
  onNavigateRoute,
}) => {
  // Related Tools Internal Links
  const relatedTools = [
    { name: 'Image to Text', path: '/image-to-text', desc: 'Browser-based OCR text extractor' },
    { name: 'JPG to Text', path: '/jpg-to-text', desc: 'Convert JPG photos to editable text' },
    { name: 'PNG to Text', path: '/png-to-text', desc: 'Extract text from transparent PNGs' },
    { name: 'Screenshot to Text', path: '/screenshot-to-text', desc: 'Fast UI & code snippet OCR' },
    { name: 'Table OCR', path: '/table-ocr', desc: 'Extract tables directly to CSV' },
    { name: 'Document OCR', path: '/document-ocr', desc: 'Scanned paper & contract extraction' },
    { name: 'Hindi OCR', path: '/hindi-ocr', desc: 'Devanagari Hindi text recognition' },
    { name: 'Bengali OCR', path: '/bengali-ocr', desc: 'Unicode Bangla document OCR' },
    { name: 'Assamese OCR', path: '/assamese-ocr', desc: 'Assamese character transcription' },
    { name: 'Compress Image', path: '/compress', desc: 'Lossless & perceptual size reduction' },
    { name: 'Convert Format', path: '/convert', desc: 'Cross-convert WebP, PNG, JPG, AVIF' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16 border-t border-white/10 mt-12 text-slate-200">
      {/* 1. What is Image to Text OCR? */}
      <section className="space-y-4 max-w-4xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
          <FileText className="w-3.5 h-3.5" />
          <span>Client-Side Document Intelligence</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          What is Image to Text OCR?
        </h2>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {routeConfig.introMarkdown}
        </p>
        <p className="text-sm text-slate-400 leading-relaxed">
          Unlike legacy cloud OCR providers that transmit your personal invoices, medical papers, and confidential screenshots to external remote servers, TridentPDF executes optical character recognition directly inside your web browser. Utilizing multithreaded WebAssembly (WASM) and HTML5 Canvas preprocessing, every word is digitized locally on your machine with zero server latency and absolute privacy.
        </p>
      </section>

      {/* 2. Features Grid */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Key Features of Free Browser OCR
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Engineered for speed, privacy, precision, and ease of use
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {routeConfig.features.map((feat, idx) => (
            <div
              key={`feat-${idx}`}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-teal-500/30 transition-colors space-y-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">{feat.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. How to Extract Text from an Image */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            How to Extract Text from an Image
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Follow three quick steps to digitize any graphic or scan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {routeConfig.howItWorksSteps.map((step) => (
            <div
              key={`step-${step.step}`}
              className="relative p-6 rounded-2xl bg-[#0E1524] border border-white/10 space-y-3"
            >
              <div className="w-8 h-8 rounded-full bg-teal-500 text-black font-extrabold text-sm flex items-center justify-center shadow-md shadow-teal-500/20">
                {step.step}
              </div>
              <h3 className="text-base font-bold text-white">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Supported Formats & Languages */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Supported Formats & Languages
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Supports over 30+ official language dictionaries lazy-loaded on demand
            </p>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-teal-400 font-mono">
            <Globe className="w-4 h-4" />
            <span>Intelligent On-Demand Loading</span>
          </div>
        </div>

        {/* Formats row */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 mr-2">Compatible Formats:</span>
          {['JPG / JPEG', 'PNG (Lossless & Transparent)', 'WebP', 'BMP', 'TIFF', 'GIF', 'SVG'].map((fmt) => (
            <span
              key={fmt}
              className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-slate-200"
            >
              {fmt}
            </span>
          ))}
        </div>

        {/* Languages grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {OCR_LANGUAGES.slice(0, 24).map((lang) => (
            <div
              key={lang.code}
              className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{lang.name}</span>
                <span className="text-[10px] font-mono text-teal-400">{lang.code}</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1">{lang.nativeName}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Privacy Architecture */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/30 to-[#0A1220] border border-emerald-500/20 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Private, Zero-Upload Architecture
            </h2>
            <p className="text-xs text-emerald-300">Your documents never touch our servers</p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Your image is processed locally in your browser and is not uploaded for OCR. Using client-side Web Workers and WebAssembly, optical recognition models execute entirely in your computer's local memory. When you refresh or clear your session, all cached image buffers are immediately revoked.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Zero server data transfer</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>No account registration</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>No telemetry on extracted text</span>
          </div>
        </div>
      </section>

      {/* 6. Frequently Asked Questions (Accessible Details Accordion) */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Answers to common questions about accuracy, formats, and client-side processing
          </p>
        </div>

        <div className="space-y-3">
          {routeConfig.faqs.map((faq, idx) => (
            <details
              key={`faq-${idx}`}
              className="group p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <summary className="text-sm font-semibold text-white flex items-center justify-between list-none">
                <span className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>{faq.question}</span>
                </span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 7. Related Tools Internal Linking */}
      <section className="space-y-6 pt-4 border-t border-white/5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Related Document & Image Tools</h2>
          <p className="text-xs text-slate-400 mt-1">
            Discover our collection of free browser-native utilities
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {relatedTools.map((tool) => (
            <button
              key={tool.path}
              type="button"
              onClick={() => onNavigateRoute(tool.path)}
              className="p-3.5 rounded-xl bg-[#0B101C] border border-white/5 hover:border-teal-500/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-teal-300 mb-1">
                <span>{tool.name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{tool.desc}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
