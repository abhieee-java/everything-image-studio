import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  AdjustmentSettings,
  BatchProgress,
  CompressionSettings,
  ConversionSettings,
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

import { Navbar } from './components/Navbar';
import { DropZone } from './components/DropZone';
import { ThumbnailBar } from './components/ThumbnailBar';
import { ToolBar } from './components/ToolBar';
import { PreviewCanvas } from './components/PreviewCanvas';
import { CompressorTool } from './components/CompressorTool';
import { ConverterTool } from './components/ConverterTool';
import { ResizerTool } from './components/ResizerTool';
import { WatermarkerTool } from './components/WatermarkerTool';
import { AdjustTool } from './components/AdjustTool';
import { BatchExportModal } from './components/BatchExportModal';
import { Footer } from './components/Footer';

export function App() {
  // Image Store
  const [images, setImages] = useState<ImageDataItem[]>([]);
  const [activeImageId, setActiveImageId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ToolTab>('compress');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);

  // Global Drag & Drop State
  const [isGlobalDragging, setIsGlobalDragging] = useState<boolean>(false);
  const dragCounter = useRef(0);

  // Tool Settings
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    quality: 0.75,
    useWebWorker: true,
  });

  const [conversionSettings, setConversionSettings] = useState<ConversionSettings>({
    targetFormat: 'image/webp',
    quality: 0.85,
    backgroundColor: '#FFFFFF',
  });

  const [resizeSettings, setResizeSettings] = useState<ResizeSettings>({
    width: 1200,
    height: 800,
    maintainAspectRatio: true,
    scalePercent: 100,
    resampleMode: 'canvas',
  });

  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>({
    type: 'text',
    text: 'Everything Studio',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.75,
    position: 'bottom-right',
    rotation: 0,
    padding: 24,
    watermarkImageScale: 25,
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

  // Batch Export State
  const [isBatchOpen, setIsBatchOpen] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgress>({
    total: 0,
    current: 0,
    currentFilename: '',
    isProcessing: false,
  });
  const [batchResults, setBatchResults] = useState<ProcessedResult[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  // Active Image Object
  const activeImage = images.find((img) => img.id === activeImageId) || images[0] || null;

  // Handle Initializing Files
  const handleAddFiles = useCallback(async (files: File[]) => {
    try {
      const newItems: ImageDataItem[] = [];
      for (const file of files) {
        if (file.type.startsWith('image/')) {
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

        // Initialize active image ID if none
        setActiveImageId((prevId) => prevId || newItems[0].id);

        // Sync resizer dimensions with newly selected image
        setResizeSettings((prev) => ({
          ...prev,
          width: newItems[0].originalWidth,
          height: newItems[0].originalHeight,
          scalePercent: 100,
        }));
      }
    } catch (err) {
      console.error('Failed to parse dropped files:', err);
    }
  }, [activeImageId]);

  // Load Built-in Samples
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

  // Clear All
  const handleClearAll = () => {
    setImages([]);
    setActiveImageId('');
    setProcessedResult(null);
  };

  // Reset Adjustments
  const handleResetAdjustments = () => {
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
    });
  };

  // When active image changes, update default dimensions for resize
  useEffect(() => {
    if (activeImage) {
      setResizeSettings((prev) => ({
        ...prev,
        width: activeImage.originalWidth,
        height: activeImage.originalHeight,
        scalePercent: 100,
      }));
    }
  }, [activeImage?.id]);

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
          watermarkImgElement,
        });

        if (isCurrent) {
          setProcessedResult(result);
        }
      } catch (err) {
        console.error('Processing error:', err);
      } finally {
        if (isCurrent) {
          setIsProcessing(false);
        }
      }
    }, 150); // 150ms debounce for responsive slider feedback

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [
    activeImage?.id,
    activeTab,
    compressionSettings,
    conversionSettings,
    resizeSettings,
    watermarkSettings,
    adjustmentSettings,
  ]);

  // Global Clipboard Paste Listener (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const filesArray = Array.from(e.clipboardData.files).filter((file) =>
          file.type.startsWith('image/')
        );
        if (filesArray.length > 0) {
          handleAddFiles(filesArray);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleAddFiles]);

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
      dragCounter.current -= 1;
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
        const filesArray = Array.from(e.dataTransfer.files).filter((file) =>
          file.type.startsWith('image/')
        );
        if (filesArray.length > 0) {
          handleAddFiles(filesArray);
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
  }, [handleAddFiles]);

  // Start Batch Execution
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
          watermarkImgElement,
        });
        results.push(res);
      }

      // Generate Zip
      const zip = await createZipArchive(
        results.map((r) => ({ filename: r.filename, blob: r.blob }))
      );

      setBatchResults(results);
      setZipBlob(zip);
      setBatchProgress((prev) => ({ ...prev, isProcessing: false }));
    } catch (err) {
      console.error('Batch error:', err);
      setBatchProgress((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const currentToolName =
    activeTab === 'compress'
      ? 'The Compressor'
      : activeTab === 'convert'
      ? 'The Converter'
      : activeTab === 'resize'
      ? 'The Resizer'
      : activeTab === 'watermark'
      ? 'The Watermarker'
      : 'Image Enhancements';

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-slate-100 selection:bg-teal-500 selection:text-black">
      {/* Global Drag Drop Visual Backdrop */}
      {isGlobalDragging && (
        <div className="fixed inset-0 z-50 bg-teal-950/80 backdrop-blur-md border-4 border-dashed border-teal-400 flex flex-col items-center justify-center p-8 pointer-events-none">
          <div className="w-24 h-24 rounded-3xl bg-teal-500/20 border border-teal-400 flex items-center justify-center mb-4 animate-bounce">
            <span className="text-4xl">📥</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Drop images anywhere</h2>
          <p className="text-teal-200 text-sm">They will be loaded instantly into Everything Image Studio</p>
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
      />

      {/* Main App Content Area */}
      <main className="flex-1 flex flex-col">
        {images.length === 0 ? (
          /* Empty State / Welcome Dropzone */
          <DropZone
            onFilesSelected={handleAddFiles}
            onLoadSamples={handleLoadSamples}
          />
        ) : (
          /* Active Studio Workspace */
          <div className="flex-1 flex flex-col">
            {/* Top Multi-Image Carousel */}
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
              {/* Left Column: Interactive Preview Canvas (7 cols) */}
              <div className="lg:col-span-7 flex flex-col h-full">
                <PreviewCanvas
                  originalImage={activeImage}
                  processedResult={processedResult}
                  isProcessing={isProcessing}
                />
              </div>

              {/* Right Column: Active Tool Control Panel (5 cols) */}
              <div className="lg:col-span-5 bg-[#0E1524] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
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
                    onOpenBatch={() => {
                      setIsBatchOpen(true);
                      handleStartBatch();
                    }}
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
                    onReset={handleResetAdjustments}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Batch Processing Modal */}
      <BatchExportModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        progress={batchProgress}
        batchResults={batchResults}
        zipBlob={zipBlob}
        onStartBatch={handleStartBatch}
        toolName={currentToolName}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
