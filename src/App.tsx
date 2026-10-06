import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  AdjustmentSettings,
  BackgroundRemovalSettings,
  BatchProgress,
  BrushSettings,
  CompressionSettings,
  ConversionSettings,
  HistoryItem,
  ImageDataItem,
  ProcessedResult,
  ResizeSettings,
  ToolTab,
  WatermarkSettings,
} from './types';
import {
  createZipArchive,
  generateSampleImages,
  loadImageElement,
  processImage,
  readImageFileMetadata,
} from './utils/imageUtils';
import {
  type ProgressState,
  type SubjectBoundingBox,
  detectSubjectBounds,
} from './utils/backgroundRemoval';
import { MaskEditorEngine } from './utils/maskEditor';
import { exportCompositeBlob } from './utils/compositeRenderer';
import {
  loadHistoryItems,
  saveHistoryItem,
  deleteHistoryItem,
  clearAllHistory,
} from './utils/historyStorage';
import { getInitialTheme, applyTheme, type ThemeMode } from './utils/theme';
import { isHeicOrRawFile, formatOutputForExport } from './utils/rawHeicHandler';

// Components
import { Navbar } from './components/Navbar';
import { DropZone } from './components/DropZone';
import { ThumbnailBar } from './components/ThumbnailBar';
import { ToolBar } from './components/ToolBar';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { BackgroundRemoverTool } from './components/BackgroundRemoverTool';
import { CompressorTool } from './components/CompressorTool';
import { ConverterTool } from './components/ConverterTool';
import { ResizerTool } from './components/ResizerTool';
import { WatermarkerTool } from './components/WatermarkerTool';
import { AdjustTool } from './components/AdjustTool';
import { BatchExportModal } from './components/BatchExportModal';
import { ContentSections } from './components/ContentSections';
import { HistoryDrawer } from './components/HistoryDrawer';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { CameraModal } from './components/CameraModal';
import { Footer } from './components/Footer';

import { saveAs } from 'file-saver';
import confetti from 'canvas-confetti';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Active Tool Tab (Default is flagship Background Remover)
  const [activeTab, setActiveTab] = useState<ToolTab>('bg-remover');

  // Image Store
  const [images, setImages] = useState<ImageDataItem[]>([]);
  const [activeImageId, setActiveImageId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);

  // Background Removal Progress state
  const [progressState, setProgressState] = useState<ProgressState>({
    stage: 'idle',
    percent: 0,
    message: 'Ready',
  });

  // Background Removal Tool Settings
  const [bgSettings, setBgSettings] = useState<BackgroundRemovalSettings>({
    smartMode: 'auto',
    removeMetadata: true,
    bgType: 'transparent',
    bgColor: '#FFFFFF',
    bgGradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    bgBlur: 16,
    bgImageUrl: null,
    autoCrop: 'original',
    aspectPreset: 'free',
  });

  // Brush / Refine state
  const [brushSettings, setBrushSettings] = useState<BrushSettings>({
    mode: 'none',
    size: 30,
    hardness: 0.8,
    opacity: 1.0,
  });
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const maskEditorRef = useRef<MaskEditorEngine | null>(null);

  // Transform state for background remover
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [subjectBounds, setSubjectBounds] = useState<SubjectBoundingBox | null>(null);

  // Global Drag & Drop State
  const [isGlobalDragging, setIsGlobalDragging] = useState<boolean>(false);
  const dragCounter = useRef(0);

  // History State
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Modal Dialogs
  const [isBatchOpen, setIsBatchOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Batch Processing State
  const [batchProgress, setBatchProgress] = useState<BatchProgress>({
    total: 0,
    current: 0,
    currentFilename: '',
    isProcessing: false,
  });
  const [batchResults, setBatchResults] = useState<ProcessedResult[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  // Compression, Conversion, Resize, Watermark, Adjust Settings
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    quality: 0.8,
    useWebWorker: true,
  });

  const [conversionSettings, setConversionSettings] = useState<ConversionSettings>({
    targetFormat: 'image/png',
    quality: 0.92,
    backgroundColor: '#FFFFFF',
  });

  const [resizeSettings, setResizeSettings] = useState<ResizeSettings>({
    width: 1920,
    height: 1080,
    maintainAspectRatio: true,
    scalePercent: 100,
    resampleMode: 'canvas',
  });

  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>({
    type: 'text',
    text: 'PureCut AI',
    fontFamily: 'Inter',
    fontSize: 36,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.7,
    position: 'bottom-right',
    rotation: 0,
    padding: 24,
  });

  const [adjustmentSettings, setAdjustmentSettings] = useState<AdjustmentSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    invert: 0,
    rotate: 0,
    flipHorizontal: false,
    flipVertical: false,
  });

  const activeImage = images.find((img) => img.id === activeImageId) || images[0] || null;

  // Show Toast Message helper
  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Load history from IndexedDB on startup
  useEffect(() => {
    loadHistoryItems()
      .then((items) => setHistoryItems(items))
      .catch((err) => console.warn('Failed to load local history:', err));
  }, []);

  // Update document title for flagship Background Remover
  useEffect(() => {
    document.title = 'PureCut AI – Free Client-Side Background Remover | Everything Image Studio';
  }, []);

  // Handle Initializing Files (with silent HEIC/RAW transcoding)
  const handleAddFiles = useCallback(
    async (files: File[]) => {
      try {
        const newItems: ImageDataItem[] = [];
        for (const file of files) {
          if (file.type.startsWith('image/') || isHeicOrRawFile(file)) {
            const item = await readImageFileMetadata(file);
            newItems.push(item);
          }
        }

        if (newItems.length > 0) {
          setImages((prev) => {
            const updated = [...prev, ...newItems];
            if (!activeImageId && updated.length > 0) {
              setActiveImageId(updated[0].id);
            }
            return updated;
          });

          setActiveImageId((prevId) => prevId || newItems[0].id);

          setResizeSettings((prev) => ({
            ...prev,
            width: newItems[0].originalWidth,
            height: newItems[0].originalHeight,
            scalePercent: 100,
          }));

          showToast(`Loaded ${newItems.length} image(s)`);
        }
      } catch (err) {
        console.error('Failed to parse dropped files:', err);
        showToast('Could not load file. Please try another image.');
      }
    },
    [activeImageId, showToast]
  );

  // Load Built-in Samples for Testing
  const handleLoadSamples = useCallback(async () => {
    const samples = generateSampleImages();
    const files = samples.map(
      (s) => new File([s.blob], s.name, { type: s.blob.type, lastModified: Date.now() })
    );
    await handleAddFiles(files);
  }, [handleAddFiles]);

  // Remove Single Image
  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (activeImageId === id && filtered.length > 0) {
        setActiveImageId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Clear Session & Reset State
  const handleClearAll = () => {
    setImages([]);
    setActiveImageId('');
    setProcessedResult(null);
    setSubjectBounds(null);
  };

  // Sync default dimensions for resize when active image changes
  useEffect(() => {
    if (activeImage) {
      setResizeSettings((prev) => ({
        ...prev,
        width: activeImage.originalWidth,
        height: activeImage.originalHeight,
        scalePercent: 100,
      }));
    }
  }, [activeImage]);

  // Run Process Pipeline on active image
  useEffect(() => {
    let isCurrent = true;

    if (!activeImage) {
      setProcessedResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsProcessing(true);
      try {
        let watermarkImgElement: HTMLImageElement | null = null;
        if (watermarkSettings.type === 'image' && watermarkSettings.watermarkImageUrl) {
          watermarkImgElement = await loadImageElement(watermarkSettings.watermarkImageUrl);
        }

        const result = await processImage(activeImage, {
          tab: activeTab,
          compression: compressionSettings,
          conversion: conversionSettings,
          resize: resizeSettings,
          watermark: watermarkSettings,
          adjustments: adjustmentSettings,
          bgRemoval: bgSettings,
          onBgProgress: (state) => {
            if (isCurrent) {
              setProgressState(state);
            }
          },
          watermarkImgElement,
        });

        if (isCurrent) {
          setProcessedResult(result);

          if (activeTab === 'bg-remover') {
            const bounds = await detectSubjectBounds(result.dataUrl);
            setSubjectBounds(bounds);

            // Save to IndexedDB history
            saveHistoryItem({
              id: `${activeImage.id}-${Date.now()}`,
              name: activeImage.name,
              timestamp: Date.now(),
              thumbnail: activeImage.previewUrl,
              processedBlob: result.blob,
              width: result.width,
              height: result.height,
              size: result.size,
            })
              .then(() => loadHistoryItems().then(setHistoryItems))
              .catch(() => {});
          }
        }
      } catch (err) {
        console.error('Processing error:', err);
      } finally {
        if (isCurrent) {
          setIsProcessing(false);
        }
      }
    }, 150);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [
    activeImage,
    activeTab,
    bgSettings,
    compressionSettings,
    conversionSettings,
    resizeSettings,
    watermarkSettings,
    adjustmentSettings,
  ]);

  // Brush Editor Stroke & History handlers
  const handleBrushStroke = (x: number, y: number) => {
    if (maskEditorRef.current) {
      maskEditorRef.current.stroke(x, y, brushSettings);
    }
  };

  const handleBrushCommit = async () => {
    if (maskEditorRef.current) {
      maskEditorRef.current.pushHistory();
      setCanUndo(maskEditorRef.current.canUndo());
      setCanRedo(maskEditorRef.current.canRedo());

      const updatedBlob = await maskEditorRef.current.toBlob();
      const updatedUrl = URL.createObjectURL(updatedBlob);

      setProcessedResult((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          blob: updatedBlob,
          dataUrl: updatedUrl,
          size: updatedBlob.size,
        };
      });
    }
  };

  const handleUndoBrush = async () => {
    if (maskEditorRef.current && maskEditorRef.current.canUndo()) {
      maskEditorRef.current.undo();
      setCanUndo(maskEditorRef.current.canUndo());
      setCanRedo(maskEditorRef.current.canRedo());

      const updatedBlob = await maskEditorRef.current.toBlob();
      const updatedUrl = URL.createObjectURL(updatedBlob);
      setProcessedResult((prev) => (prev ? { ...prev, blob: updatedBlob, dataUrl: updatedUrl } : null));
    }
  };

  const handleRedoBrush = async () => {
    if (maskEditorRef.current && maskEditorRef.current.canRedo()) {
      maskEditorRef.current.redo();
      setCanUndo(maskEditorRef.current.canUndo());
      setCanRedo(maskEditorRef.current.canRedo());

      const updatedBlob = await maskEditorRef.current.toBlob();
      const updatedUrl = URL.createObjectURL(updatedBlob);
      setProcessedResult((prev) => (prev ? { ...prev, blob: updatedBlob, dataUrl: updatedUrl } : null));
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      if (key === 'u') {
        const uploader = document.querySelector('input[type="file"]') as HTMLInputElement;
        uploader?.click();
      } else if (key === 'e') {
        setBrushSettings((b) => ({ ...b, mode: 'erase' }));
      } else if (key === 'r') {
        setBrushSettings((b) => ({ ...b, mode: 'restore' }));
      } else if (key === '?' || (e.shiftKey && key === '/')) {
        setIsShortcutsOpen((o) => !o);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global Clipboard Paste Listener (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const filesArray = Array.from(e.clipboardData.files).filter(
          (file) => file.type.startsWith('image/') || isHeicOrRawFile(file)
        );
        if (filesArray.length > 0) {
          handleAddFiles(filesArray);
          showToast('Image pasted from clipboard!');
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleAddFiles, showToast]);

  // Window-level Drag and Drop overlay events
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current += 1;
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        setIsGlobalDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current += 1;
      if (dragCounter.current <= 0) {
        setIsGlobalDragging(false);
        dragCounter.current = 0;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsGlobalDragging(false);
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        const filesArray = Array.from(e.dataTransfer.files).filter(
          (file) => file.type.startsWith('image/') || isHeicOrRawFile(file)
        );
        if (filesArray.length > 0) {
          handleAddFiles(filesArray);
          showToast(`Added ${filesArray.length} image(s)!`);
        }
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleAddFiles, showToast]);

  // Start Batch Execution for background removal
  const handleStartBatch = async () => {
    if (images.length === 0) return;

    setBatchProgress({
      total: images.length,
      current: 0,
      currentFilename: 'Starting...',
      isProcessing: true,
    });
    setBatchResults([]);
    setZipBlob(null);

    try {
      let watermarkImgElement: HTMLImageElement | null = null;
      if (watermarkSettings.type === 'image' && watermarkSettings.watermarkImageUrl) {
        watermarkImgElement = await loadImageElement(watermarkSettings.watermarkImageUrl);
      }

      const results: ProcessedResult[] = [];

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        setBatchProgress({
          total: images.length,
          current: i + 1,
          currentFilename: img.name,
          isProcessing: true,
        });

        const res = await processImage(img, {
          tab: activeTab,
          compression: compressionSettings,
          conversion: conversionSettings,
          resize: resizeSettings,
          watermark: watermarkSettings,
          adjustments: adjustmentSettings,
          bgRemoval: bgSettings,
          watermarkImgElement,
        });
        results.push(res);
      }

      const filesForZip = results.map((r, idx) => {
        const correspondingImage = images[idx];
        const formatted = formatOutputForExport(
          r.blob,
          correspondingImage?.name || r.filename,
          correspondingImage?.originalFormatExtension || null
        );
        return {
          filename: formatted.exportFilename,
          blob: formatted.exportBlob,
        };
      });

      const zip = await createZipArchive(filesForZip);

      setBatchResults(results);
      setZipBlob(zip);
      setBatchProgress((prev) => ({ ...prev, isProcessing: false }));
    } catch (err) {
      console.error('Batch error:', err);
      setBatchProgress((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  // Export composite for background remover
  const handleExportComposite = async (format: 'image/png' | 'image/jpeg' | 'image/webp') => {
    if (!activeImage || !processedResult) return;

    try {
      const origEl = await loadImageElement(activeImage.previewUrl);
      const cutoutEl = await loadImageElement(processedResult.dataUrl);

      let bgImgEl: HTMLImageElement | null = null;
      if (bgSettings.bgType === 'image' && bgSettings.bgImageUrl) {
        bgImgEl = await loadImageElement(bgSettings.bgImageUrl);
      }

      // For HEIC or RAW exports, preserve full 1.0 quality
      const actualFormat = activeImage.isHeicOrRaw && activeImage.originalFormatExtension ? 'image/jpeg' : format;

      const blob = await exportCompositeBlob(
        {
          originalImage: origEl,
          cutoutImage: cutoutEl,
          backgroundImage: bgImgEl,
          settings: bgSettings,
          subjectBounds,
          rotation,
          flipHorizontal: flipH,
          flipVertical: flipV,
        },
        actualFormat,
        1.0
      );

      const { exportBlob, exportFilename } = formatOutputForExport(
        blob,
        activeImage.name,
        activeImage.originalFormatExtension || null
      );
      saveAs(exportBlob, exportFilename);

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#2dd4bf', '#38bdf8', '#818cf8', '#34d399'],
        });
      } catch {
        // Confetti fallback
      }

      showToast(`Exported ${exportFilename} successfully!`);
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Export failed. Please try again.');
    }
  };

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleShareResult = async () => {
    if (!processedResult || !canShare) return;
    try {
      const file = new File([processedResult.blob], processedResult.filename, {
        type: processedResult.format,
      });
      await navigator.share({
        title: 'PureCut AI Background Cutout',
        text: 'Processed 100% locally with PureCut AI',
        files: [file],
      });
    } catch {
      // Share cancelled
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    const url = URL.createObjectURL(item.processedBlob);
    setProcessedResult({
      id: item.id,
      blob: item.processedBlob,
      dataUrl: url,
      size: item.size,
      width: item.width,
      height: item.height,
      format: 'image/png',
      filename: `${item.name}-history.png`,
      processingTimeMs: 0,
    });
    setIsHistoryOpen(false);
    showToast(`Loaded ${item.name} from history`);
  };

  const scrollToWorkspace = () => {
    const uploader = document.getElementById('uploader-section');
    uploader?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-slate-100 selection:bg-teal-500 selection:text-black">
      {/* Global Drag Drop Visual Backdrop */}
      {isGlobalDragging && (
        <div className="fixed inset-0 z-50 bg-teal-950/80 backdrop-blur-md border-4 border-dashed border-teal-400 flex flex-col items-center justify-center p-8 pointer-events-none">
          <div className="w-24 h-24 rounded-3xl bg-teal-500/20 border border-teal-400 flex items-center justify-center mb-4 animate-bounce">
            <span className="text-4xl">📥</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Drop images anywhere</h2>
          <p className="text-teal-200 text-sm">
            They will be processed 100% locally with PureCut AI
          </p>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-teal-500 text-black font-semibold text-xs shadow-2xl shadow-teal-500/30 flex items-center space-x-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        imageCount={images.length}
        onClearAll={handleClearAll}
        onLoadSamples={handleLoadSamples}
        onOpenBatch={() => {
          setIsBatchOpen(true);
          setBatchResults([]);
          setZipBlob(null);
          setBatchProgress({
            total: images.length,
            current: 0,
            currentFilename: '',
            isProcessing: false,
          });
        }}
        historyCount={historyItems.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main App Content Area */}
      <main className="flex-1 flex flex-col">
        {images.length === 0 ? (
          /* Empty State / Welcome Dropzone & Landing SEO Content */
          <>
            <DropZone
              onFilesSelected={handleAddFiles}
              onLoadSamples={handleLoadSamples}
              h1Text="Remove Backgrounds. Keep Everything Else."
              subheadingText="Full resolution. Unlimited. No watermark. Everything happens directly on your device."
              onOpenCamera={() => setIsCameraOpen(true)}
              activeTab={activeTab}
            />

            {/* PureCut AI Flagship Marketing & Trust Content */}
            <ContentSections
              onScrollToUploader={scrollToWorkspace}
              onLoadSample={handleLoadSamples}
            />
          </>
        ) : (
          /* Active Studio Workspace */
          <div id="editor-workspace" className="flex-1 flex flex-col">
            {/* Top Multi-Image Carousel Strip */}
            <ThumbnailBar
              images={images}
              activeImageId={activeImageId}
              onSelectImage={setActiveImageId}
              onRemoveImage={handleRemoveImage}
              onFilesSelected={handleAddFiles}
            />

            {/* Tool Tabs Switcher */}
            <ToolBar activeTab={activeTab} onSelectTab={setActiveTab} />

            {/* Studio Workspace 2-Column Layout */}
            <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Canvas */}
              <div className="lg:col-span-7 flex flex-col h-full">
                {isProcessing && activeTab === 'bg-remover' ? (
                  <ProcessingOverlay
                    previewUrl={activeImage.previewUrl}
                    progress={progressState}
                    onCancel={() => setIsProcessing(false)}
                  />
                ) : (
                  <PreviewCanvas
                    originalImage={activeImage}
                    processedResult={processedResult}
                    isProcessing={isProcessing}
                    bgSettings={bgSettings}
                    brushSettings={brushSettings}
                    onBrushStroke={handleBrushStroke}
                    onBrushCommit={handleBrushCommit}
                    subjectBounds={subjectBounds}
                    rotation={rotation}
                    flipH={flipH}
                    flipV={flipV}
                  />
                )}
              </div>

              {/* Right Column: Active Tool Control Panel */}
              <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#0E1524] border border-white/10 shadow-xl space-y-6">
                {activeTab === 'bg-remover' && (
                  <BackgroundRemoverTool
                    settings={bgSettings}
                    onChangeSettings={setBgSettings}
                    brushSettings={brushSettings}
                    onChangeBrush={setBrushSettings}
                    onUndo={handleUndoBrush}
                    onRedo={handleRedoBrush}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onExport={handleExportComposite}
                    onShare={handleShareResult}
                    canShare={canShare}
                    isProcessing={isProcessing}
                    rotation={rotation}
                    onRotate={() => setRotation((r) => (r + 90) % 360)}
                    flipH={flipH}
                    flipV={flipV}
                    onToggleFlipH={() => setFlipH((h) => !h)}
                    onToggleFlipV={() => setFlipV((v) => !v)}
                    onReprocess={() => {
                      if (activeImage) {
                        setIsProcessing(true);
                      }
                    }}
                    originalFormatExtension={activeImage?.originalFormatExtension}
                    isHeicOrRaw={activeImage?.isHeicOrRaw}
                  />
                )}

                {activeTab === 'compress' && (
                  <CompressorTool
                    settings={compressionSettings}
                    onChange={setCompressionSettings}
                    originalImage={activeImage}
                    processedResult={processedResult}
                  />
                )}

                {activeTab === 'convert' && (
                  <ConverterTool
                    settings={conversionSettings}
                    onChange={setConversionSettings}
                    totalImages={images.length}
                    onOpenBatch={() => setIsBatchOpen(true)}
                  />
                )}

                {activeTab === 'resize' && (
                  <ResizerTool
                    settings={resizeSettings}
                    onChange={setResizeSettings}
                    originalImage={activeImage}
                  />
                )}

                {activeTab === 'watermark' && (
                  <WatermarkerTool
                    settings={watermarkSettings}
                    onChange={setWatermarkSettings}
                  />
                )}

                {activeTab === 'adjust' && (
                  <AdjustTool
                    settings={adjustmentSettings}
                    onChange={setAdjustmentSettings}
                    onReset={() =>
                      setAdjustmentSettings({
                        brightness: 100,
                        contrast: 100,
                        saturation: 100,
                        blur: 0,
                        grayscale: 0,
                        sepia: 0,
                        invert: 0,
                        rotate: 0,
                        flipHorizontal: false,
                        flipVertical: false,
                      })
                    }
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Batch Export Modal */}
      <BatchExportModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        progress={batchProgress}
        batchResults={batchResults}
        zipBlob={zipBlob}
        onStartBatch={handleStartBatch}
        toolName="PureCut AI Background Remover"
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
        onSelectItem={handleSelectHistoryItem}
        onDeleteItem={async (id) => {
          await deleteHistoryItem(id);
          const updated = await loadHistoryItems();
          setHistoryItems(updated);
        }}
        onClearAll={async () => {
          await clearAllHistory();
          setHistoryItems([]);
        }}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={async (blob) => {
          const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
          await handleAddFiles([file]);
          setIsCameraOpen(false);
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
