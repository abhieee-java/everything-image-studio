import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Columns,
  Eye,
  Maximize2,
  Sliders,
  Move,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveAs } from 'file-saver';
import type {
  BackgroundRemovalSettings,
  BrushSettings,
  ImageDataItem,
  ProcessedResult,
} from '../types';
import { formatBytes, formatPercentageSaved } from '../utils/imageUtils';
import { renderCompositeToCanvas } from '../utils/compositeRenderer';
import type { SubjectBoundingBox } from '../utils/backgroundRemoval';
import { formatOutputForExport } from '../utils/rawHeicHandler';

interface PreviewCanvasProps {
  originalImage: ImageDataItem | null;
  processedResult: ProcessedResult | null;
  isProcessing: boolean;
  bgSettings?: BackgroundRemovalSettings;
  brushSettings?: BrushSettings;
  onBrushStroke?: (x: number, y: number) => void;
  onBrushCommit?: () => void;
  subjectBounds?: SubjectBoundingBox | null;
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  originalImage,
  processedResult,
  isProcessing,
  bgSettings,
  brushSettings,
  onBrushStroke,
  onBrushCommit,
  subjectBounds,
  rotation = 0,
  flipH = false,
  flipV = false,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'split' | 'side-by-side' | 'single' | 'original'>('split');
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0 - 100
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Brush cursor tracking
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Canvas Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Original & Cutout image elements for composite rendering
  const [originalEl, setOriginalEl] = useState<HTMLImageElement | null>(null);
  const [cutoutEl, setCutoutEl] = useState<HTMLImageElement | null>(null);
  const [bgImageEl, setBgImageEl] = useState<HTMLImageElement | null>(null);

  // Load original image element
  useEffect(() => {
    if (!originalImage) {
      setOriginalEl(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setOriginalEl(img);
    img.src = originalImage.previewUrl;
  }, [originalImage?.previewUrl]);

  // Load cutout image element
  useEffect(() => {
    if (!processedResult) {
      setCutoutEl(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setCutoutEl(img);
    img.src = processedResult.dataUrl;
  }, [processedResult?.dataUrl]);

  // Load custom background image element if provided
  useEffect(() => {
    if (!bgSettings?.bgImageUrl) {
      setBgImageEl(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setBgImageEl(img);
    img.src = bgSettings.bgImageUrl;
  }, [bgSettings?.bgImageUrl]);

  // Redraw composite canvas whenever settings, images, or transforms change
  useEffect(() => {
    if (!compositeCanvasRef.current || !originalEl || !cutoutEl) return;

    renderCompositeToCanvas(compositeCanvasRef.current, {
      originalImage: originalEl,
      cutoutImage: cutoutEl,
      backgroundImage: bgImageEl,
      settings: bgSettings || { smartMode: 'auto', removeMetadata: true, bgType: 'transparent' },
      subjectBounds,
      rotation,
      flipHorizontal: flipH,
      flipVertical: flipV,
    });
  }, [originalEl, cutoutEl, bgImageEl, bgSettings, subjectBounds, rotation, flipH, flipV]);

  // Keyboard shortcut listener for divider arrows & zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') {
        setSplitPos((p) => Math.max(5, p - 5));
      } else if (e.key === 'ArrowRight') {
        setSplitPos((p) => Math.min(95, p + 5));
      } else if (e.key.toLowerCase() === 'b') {
        setViewMode((m) => (m === 'split' ? 'single' : 'split'));
      } else if (e.key.toLowerCase() === 'z') {
        setZoom((z) => (z === 100 ? 175 : 100));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Split Divider Dragging handlers
  const handleSplitMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDraggingSplit(true);
  };

  const updateSplitPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitPos(pct);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingSplit) {
      updateSplitPosition(e.clientX);
      return;
    }

    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    // Brush cursor update
    if (brushSettings && brushSettings.mode !== 'none' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      setCursorPos({ x: clientX, y: clientY, visible: true });

      if (isDrawing && onBrushStroke && compositeCanvasRef.current) {
        // Map screen point to canvas coordinate
        const canvas = compositeCanvasRef.current;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        onBrushStroke(clientX * scaleX, clientY * scaleY);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDraggingSplit && e.touches[0]) {
      updateSplitPosition(e.touches[0].clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingSplit(false);
    setIsPanning(false);
    if (isDrawing) {
      setIsDrawing(false);
      if (onBrushCommit) onBrushCommit();
    }
  };

  const handleMouseDownOnCanvas = (e: React.MouseEvent<HTMLDivElement>) => {
    if (brushSettings && brushSettings.mode !== 'none') {
      setIsDrawing(true);
      if (onBrushStroke && containerRef.current && compositeCanvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;
        const canvas = compositeCanvasRef.current;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        onBrushStroke(clientX * scaleX, clientY * scaleY);
      }
    } else if (e.button === 0 && zoom > 100) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  if (!originalImage) {
    return (
      <div className="flex-1 min-h-[460px] flex items-center justify-center bg-[#070A12] border border-white/5 rounded-2xl p-8 text-center text-slate-500">
        <p>No image selected for preview</p>
      </div>
    );
  }

  const handleDownload = () => {
    if (!processedResult) return;
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#2dd4bf', '#38bdf8', '#818cf8', '#f43f5e'],
      });
    } catch {
      // Confetti fallback
    }

    if (compositeCanvasRef.current && bgSettings && bgSettings.bgType !== 'transparent') {
      compositeCanvasRef.current.toBlob((blob) => {
        if (blob) {
          const { exportBlob, exportFilename } = formatOutputForExport(
            blob,
            originalImage.name,
            originalImage.originalFormatExtension || null
          );
          saveAs(exportBlob, exportFilename);
        }
      }, 'image/png');
    } else {
      const { exportBlob, exportFilename } = formatOutputForExport(
        processedResult.blob,
        originalImage.name,
        originalImage.originalFormatExtension || null
      );
      saveAs(exportBlob, exportFilename);
    }
  };

  const savings = processedResult
    ? formatPercentageSaved(originalImage.originalSize, processedResult.size)
    : null;

  const currentPreviewUrl = processedResult ? processedResult.dataUrl : originalImage.previewUrl;
  const isBrushActive = brushSettings && brushSettings.mode !== 'none';

  return (
    <div className="flex-1 flex flex-col bg-[#070B14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#0D1322] border-b border-white/10 gap-2">
        {/* Left: View Mode Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'split'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Interactive Split Comparison Slider (B)"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Side by Side Comparison"
          >
            <Columns className="w-3.5 h-3.5 rotate-90" />
            <span>Side by Side</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('single')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'single'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Processed Cutout Only"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Processed</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('original')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'original'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Original Image"
          >
            <span>Original</span>
          </button>
        </div>

        {/* Center: Zoom, Grid and Reset */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
              showGrid ? 'bg-white/10 text-teal-300' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Transparent Grid"
          >
            Grid
          </button>

          <div className="h-4 w-[1px] bg-white/10" />

          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(25, z - 25))}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-xs font-mono text-slate-400 w-10 text-center">{zoom}%</span>

          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(400, z + 25))}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setZoom(100);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5"
            title="Reset Zoom & Pan"
            aria-label="Reset Zoom and Pan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Quick Download */}
        <div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!processedResult || isProcessing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-black font-semibold text-xs shadow-md shadow-teal-500/20 transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        onMouseDown={handleMouseDownOnCanvas}
        onMouseLeave={() => {
          handleMouseUp();
          setCursorPos((c) => ({ ...c, visible: false }));
        }}
        className={`relative flex-1 min-h-[460px] flex items-center justify-center p-4 overflow-hidden select-none ${
          isBrushActive
            ? 'cursor-crosshair'
            : zoom > 100
            ? 'cursor-grab active:cursor-grabbing'
            : 'cursor-default'
        } ${showGrid ? 'bg-transparency-grid' : 'bg-[#060911]'}`}
      >
        {/* Subtle Transparent label */}
        {showGrid && (
          <div className="absolute top-4 left-4 z-30 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono tracking-wider uppercase text-slate-400 pointer-events-none">
            Transparent
          </div>
        )}

        {/* Dynamic Zoom & Pan Transform Wrapper */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-75"
          style={{
            transform: `scale(${zoom / 100}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          }}
        >
          {/* VIEW MODE 1: Split Slider */}
          {viewMode === 'split' && processedResult && (
            <div className="relative inline-block max-w-[85vw] max-h-[65vh] rounded-xl overflow-hidden shadow-2xl border border-white/10">
              {/* Underlying Cutout Composite Canvas */}
              <canvas
                ref={compositeCanvasRef}
                className="block max-w-full max-h-[65vh] object-contain"
              />

              {/* Overlaid Original Image Clipped to splitPos */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)` }}
              >
                <img
                  src={originalImage.previewUrl}
                  alt="Original"
                  className="w-full h-full object-contain pointer-events-none"
                />
                <span className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] font-semibold text-slate-200 border border-white/10">
                  Before
                </span>
              </div>

              <span className="absolute top-3 right-3 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] font-semibold text-teal-300 border border-teal-500/30 pointer-events-none">
                After
              </span>

              {/* Draggable Divider Handle */}
              <div
                onMouseDown={handleSplitMouseDown}
                onTouchStart={handleSplitMouseDown}
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_12px_rgba(0,0,0,0.8)]"
                style={{ left: `${splitPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xl border border-slate-300">
                  <Columns className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: Side by Side */}
          {viewMode === 'side-by-side' && processedResult && (
            <div className="flex flex-col md:flex-row items-center gap-4 max-w-[85vw] max-h-[65vh]">
              <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-xl bg-black/40">
                <img
                  src={originalImage.previewUrl}
                  alt="Original"
                  className="max-w-[40vw] max-h-[60vh] object-contain"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-semibold text-slate-300">
                  Original
                </span>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-teal-500/30 shadow-xl">
                <canvas
                  ref={compositeCanvasRef}
                  className="max-w-[40vw] max-h-[60vh] object-contain"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-semibold text-teal-300">
                  Cutout Result
                </span>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: Processed Single */}
          {viewMode === 'single' && (
            <div className="relative inline-block max-w-[85vw] max-h-[65vh] rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <canvas
                ref={compositeCanvasRef}
                className="block max-w-full max-h-[65vh] object-contain"
              />
            </div>
          )}

          {/* VIEW MODE 4: Original Only */}
          {viewMode === 'original' && (
            <div className="relative inline-block max-w-[85vw] max-h-[65vh] rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src={originalImage.previewUrl}
                alt="Original"
                className="block max-w-full max-h-[65vh] object-contain"
              />
            </div>
          )}

          {/* Fallback if processing has not produced result yet */}
          {!processedResult && (
            <div className="relative inline-block max-w-[85vw] max-h-[65vh] rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src={originalImage.previewUrl}
                alt="Original"
                className="block max-w-full max-h-[65vh] object-contain"
              />
            </div>
          )}
        </div>

        {/* Live Circular Brush Cursor Preview */}
        {isBrushActive && cursorPos.visible && (
          <div
            className="absolute rounded-full pointer-events-none border-2 border-teal-300 shadow-[0_0_8px_rgba(45,212,191,0.6)] -translate-x-1/2 -translate-y-1/2 z-40 transition-none"
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              width: `${(brushSettings?.size || 30) * (zoom / 100)}px`,
              height: `${(brushSettings?.size || 30) * (zoom / 100)}px`,
              backgroundColor:
                brushSettings?.mode === 'erase'
                  ? 'rgba(244, 63, 94, 0.15)'
                  : 'rgba(16, 185, 129, 0.15)',
            }}
          />
        )}
      </div>

      {/* Bottom Status Info Strip */}
      <div className="px-4 py-2 bg-[#090D18] border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center space-x-3">
          <span className="font-mono text-slate-200">
            {originalImage.originalWidth} × {originalImage.originalHeight}
          </span>
          <span>•</span>
          <span className="font-mono">{formatBytes(originalImage.originalSize)}</span>
          {processedResult && (
            <>
              <span>•</span>
              <span className="text-teal-400 font-semibold uppercase">
                {processedResult.format.replace('image/', '')}
              </span>
              <span>•</span>
              <span className="font-mono">{formatBytes(processedResult.size)}</span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {savings && savings.isSaved && (
            <span className="text-emerald-400 font-medium font-mono">
              {savings.text} smaller
            </span>
          )}
          {processedResult && (
            <span className="text-[11px] text-slate-500 font-mono">
              {processedResult.processingTimeMs}ms
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
