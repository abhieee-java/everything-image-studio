import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  ChevronDown,
  Upload,
  Cpu,
  Download,
  Lock,
  Smartphone,
  CheckCircle2,
  Image as ImageIcon,
  Columns,
} from 'lucide-react';

interface ContentSectionsProps {
  onScrollToUploader: () => void;
  onLoadSample: () => void;
}

export const ContentSections: React.FC<ContentSectionsProps> = ({
  onScrollToUploader,
  onLoadSample,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [demoSplit, setDemoSplit] = useState<number>(50);

  const trustPillars = [
    {
      title: '100% Client-Side',
      desc: 'All neural networks run in-browser using WebAssembly. Zero bytes leave your device.',
      icon: Lock,
    },
    {
      title: 'No Upload Ever',
      desc: 'Your photos are processed directly in local memory. Complete privacy by mathematical guarantee.',
      icon: ShieldCheck,
    },
    {
      title: 'Unlimited & Free',
      desc: 'No credit systems, no forced accounts, no artificial waitlists, and no hidden subscriptions.',
      icon: Zap,
    },
    {
      title: 'No Watermarks',
      desc: 'Clean, professional outputs every single time. 100% yours for personal and commercial use.',
      icon: Sparkles,
    },
    {
      title: 'Full Native Quality',
      desc: 'We never silently compress or downscale. Preserves full 4K, 8K, and high-megapixel resolution.',
      icon: Layers,
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload or Paste Image',
      desc: 'Drag & drop your photo, paste with Ctrl+V from clipboard, or browse from computer/phone.',
      icon: Upload,
    },
    {
      step: '02',
      title: 'On-Device AI Analysis',
      desc: 'ISNet salient neural models detect subjects, human contours, hair follicles, and objects in milliseconds.',
      icon: Cpu,
    },
    {
      step: '03',
      title: 'Refine & Customize',
      desc: 'Add custom background colors, blur original scenery, or manually erase and restore with edge brushes.',
      icon: Sparkles,
    },
    {
      step: '04',
      title: 'Export at Full Resolution',
      desc: 'Download transparent PNGs, JPGs with solid backgrounds, or ZIP archives with metadata stripped.',
      icon: Download,
    },
  ];

  const faqs = [
    {
      q: 'Is PureCut AI really 100% free with no limits?',
      a: 'Yes, completely free. Unlike cloud background removers that charge monthly credits or blur your image behind a paywall, PureCut AI executes neural networks directly on your device CPU/GPU. Because zero server compute is consumed, there is no reason to charge or throttle you.',
    },
    {
      q: 'Are my images ever uploaded to a remote server or cloud?',
      a: 'Never. Your images never leave your browser RAM. All neural inference happens via ONNX Runtime Web and WebAssembly inside your browser. You can even disconnect your internet Wi-Fi after loading the page and process images 100% offline.',
    },
    {
      q: 'Does this tool preserve full original image resolution?',
      a: 'Yes. We never downsample or cap resolution. If you upload a 4000×3000 high-resolution photograph, your exported transparent PNG will have the exact same 4000×3000 pixel dimensions with pristine alpha transparency.',
    },
    {
      q: 'Does it work smoothly on mobile phones and tablets?',
      a: 'Yes! PureCut AI is designed mobile-first with touch-friendly sliders, bottom-sheet editing controls, and memory-aware processing that avoids iOS Safari and Android memory limits.',
    },
    {
      q: 'Can I process multiple images at once (Batch Mode)?',
      a: 'Yes. You can select or drag multiple images (10 to 20 images) and process them in sequence or parallel client-side, then download everything in one organized ZIP archive.',
    },
    {
      q: 'How does the metadata removal (privacy shield) work?',
      a: 'When you take photos with cameras or smartphones, embedded EXIF metadata often stores GPS coordinates, device serial numbers, and timestamps. PureCut AI draws your processed image onto a clean Canvas context upon export, stripping all hidden metadata automatically before saving.',
    },
    {
      q: 'Do I need to sign up or create an account?',
      a: 'No account, email, or sign-in is required. You can start removing backgrounds immediately.',
    },
  ];

  const supportedFormats = [
    { ext: 'PNG', mime: 'image/png', desc: 'Lossless transparency' },
    { ext: 'JPG / JPEG', mime: 'image/jpeg', desc: 'Standard photography' },
    { ext: 'WebP', mime: 'image/webp', desc: 'Modern high-compression' },
    { ext: 'AVIF', mime: 'image/avif', desc: 'Next-gen web format' },
    { ext: 'BMP', mime: 'image/bmp', desc: 'Bitmap graphics' },
    { ext: 'GIF', mime: 'image/gif', desc: 'Static GIF frames' },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      {/* 1. Trust Pillars */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Built on Uncompromising Privacy & Quality
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            No Upload. No Limit. No Watermark. Full Quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {trustPillars.map((tp) => {
            const Icon = tp.icon;
            return (
              <div
                key={tp.title}
                className="p-5 rounded-2xl bg-[#0E1524]/60 border border-white/5 hover:border-teal-500/30 transition-all space-y-2.5 glass-panel"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">{tp.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{tp.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Feature Showcase */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0E1524] to-[#0A0F1C] border border-white/10 shadow-2xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-teal-400">
              Interactive Showcase
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Precision Edge Isolation in Action
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mt-1">
              Test our client-side cut-out accuracy right here. Drag the slider to see how cleanly backgrounds vanish while preserving hair strands and soft edges.
            </p>
          </div>
          <button
            type="button"
            onClick={onLoadSample}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-semibold text-xs transition-all shadow-md shadow-teal-500/20 flex-shrink-0"
          >
            Try with Sample Photo
          </button>
        </div>

        {/* Interactive Comparison Demo */}
        <div className="relative max-w-3xl mx-auto aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-2xl select-none">
          {/* Transparent Grid background */}
          <div className="absolute inset-0 bg-transparency-grid" />

          {/* After: Cutout subject on transparent grid */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 shadow-2xl flex items-center justify-center text-white text-center p-6 font-bold">
              <span>Subject Perfectly Preserved</span>
            </div>
          </div>

          {/* Before: Subject with complex background */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ clipPath: `polygon(0 0, ${demoSplit}% 0, ${demoSplit}% 100%, 0 100%)` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-rose-600 to-violet-800 flex items-center justify-center p-8">
              <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 shadow-2xl flex items-center justify-center text-white text-center p-6 font-bold">
                <span>Original Background Present</span>
              </div>
            </div>
            <span className="absolute top-4 left-4 px-2.5 py-1 rounded bg-black/70 text-xs font-semibold text-white border border-white/10">
              Original Background
            </span>
          </div>

          <span className="absolute top-4 right-4 px-2.5 py-1 rounded bg-black/70 text-xs font-semibold text-teal-300 border border-teal-500/30">
            Cutout Transparency
          </span>

          {/* Draggable Divider */}
          <input
            type="range"
            min="5"
            max="95"
            value={demoSplit}
            onChange={(e) => setDemoSplit(parseInt(e.target.value, 10))}
            className="absolute inset-x-0 bottom-4 mx-auto w-48 accent-teal-400 cursor-ew-resize opacity-80 hover:opacity-100 z-30"
            aria-label="Interactive demonstration comparison slider"
          />
        </div>
      </div>

      {/* 3. How It Works */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-teal-400">
            Frictionless Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            How PureCut AI Works
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Four simple steps. Zero server uploads. Finished in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className="relative p-6 rounded-2xl bg-[#0E1524]/60 border border-white/5 space-y-3 glass-panel"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-teal-400/80">{st.step}</span>
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-300">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white">{st.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Why Privacy Matters */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#0E1524]/40 border border-white/10 glass-panel">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Client-Side Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Why Privacy Matters in Image Processing
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Most background removal websites send your personal images, corporate prototypes, or identity documents to unverified cloud servers for processing. This exposes your data to data mining, model training without consent, and potential cloud leaks.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              PureCut AI is fundamentally different. Our neural segmentation engine is compiled to WebAssembly and executed locally in your browser sandbox. Your images stay in your device RAM and disappear when you close the tab.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <span className="px-3 py-1.5 rounded-xl bg-white/5 text-xs text-slate-300 border border-white/10 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Zero Server Upload</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/5 text-xs text-slate-300 border border-white/10 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>HIPAA & GDPR Friendly</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/5 text-xs text-slate-300 border border-white/10 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Works Offline</span>
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Architectural Comparison</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                <div className="font-semibold text-rose-300">Typical Online Removers</div>
                <div className="text-slate-400 leading-relaxed">
                  Uploads image to cloud • Requires login • Watermarks free tier • Caps resolution at 0.25MP • Sells credits
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <div className="font-semibold text-emerald-300">PureCut AI (This Tool)</div>
                <div className="text-slate-300 leading-relaxed">
                  100% on-device WebAssembly • Zero account required • No watermarks • Full 4K+ export • Completely free forever
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Supported Formats */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Supported Formats</h2>
          <p className="text-slate-400 text-xs mt-1">
            PureCut AI accepts all standard web and photography raster formats.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {supportedFormats.map((fmt) => (
            <div
              key={fmt.ext}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-1 hover:border-teal-500/30 transition-all"
            >
              <span className="font-mono font-bold text-sm text-teal-300 block">{fmt.ext}</span>
              <span className="text-[10px] text-slate-500 block">{fmt.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. FAQ Accordion */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <span className="text-xs font-mono uppercase tracking-wider text-teal-400">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl bg-[#0E1524]/60 border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-teal-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
                      isOpen ? 'rotate-180 text-teal-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Bottom Conversion Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-blue-500/20 border border-teal-500/40 text-center space-y-4 shadow-2xl">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
          Remove Backgrounds Now. Keep Everything Else.
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto">
          Experience ultra-fast, watermark-free background removal at native resolution. No signup required.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onScrollToUploader}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-black font-bold text-sm shadow-xl shadow-teal-500/25 transition-all transform hover:scale-105 active:scale-95"
          >
            Remove Background Free
          </button>
        </div>
      </div>
    </section>
  );
};
