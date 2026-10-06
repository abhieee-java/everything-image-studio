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
  OcrMode,
  OcrPreprocessingSettings,
  OcrResultData,
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
} from './utils/backgroundRemoval';
import { MaskEditorEngine } from './utils/maskEditor';
import { exportCompositeBlob } from './utils/compositeRenderer';
import {
  loadHistoryItems,
  deleteHistoryItem,
  clearAllHistory,
} from './utils/historyStorage';
import { getInitialTheme, applyTheme, type ThemeMode } from './utils/theme';
import { isHeicOrRawFile, formatOutputForExport } from './utils/rawHeicHandler';

// OCR Engine & Helpers
import {
  DEFAULT_PREPROCESSING_SETTINGS,
  preprocessCanvasForOcr,
} from './utils/ocrPreprocessing';
import { recognizeImage, terminateOcrWorker } from './utils/ocrEngine';
import { getRouteConfig, OCR_ROUTES } from './utils/ocrRoutes';

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
import { Footer } from './components/Footer';

// OCR Dedicated Components
import { OcrTool } from './components/OcrTool';
import { OcrResultWorkspace } from './components/OcrResultWorkspace';
import { OcrBatchModal } from './components/OcrBatchModal';
import { CameraModal } from './components/CameraModal';
import { OcrSeoContent } from './components/OcrSeoContent';

import { saveAs } from 'file-saver';
import confetti from 'canvas-confetti';

export function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Routing State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    }
    return '/';
  });

  const routeConfig = getRouteConfig(currentPath);

  // Active Tool Tab
  const [activeTab, setActiveTab] = useState<ToolTab>(() => {
    // If route matches an OCR route or root, default to OCR
    const path = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/';
    if (path === '/' || path in OCR_ROUTES) {
      return 'ocr';
    }
    if (path.includes('bg-remover')) return 'bg-remover';
    if (path.includes('compress')) return 'compress';
    if (path.includes('convert')) return 'convert';
    if (path.includes('resize')) return 'resize';
    if (path.includes('watermark')) return 'watermark';
    if (path.includes('adjust')) return 'adjust';
    return 'ocr';
  });

  // Image Store
  const [images, setImages] = useState<ImageDataItem[]>([]);
  const [activeImageId, setActiveImageId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);

  // OCR Specialized State
  const [selectedLanguage, setSelectedLanguage] = useState<string>(routeConfig.defaultLanguage || 'eng');
  const [selectedMode, setSelectedMode] = useState<OcrMode>(routeConfig.defaultMode || 'standard');
  const [ocrPreprocessing, setOcrPreprocessing] = useState<OcrPreprocessingSettings>(DEFAULT_PREPROCESSING_SETTINGS);
  const [ocrResultsByImageId, setOcrResultsByImageId] = useState<Record<string, OcrResultData>>({});
  const [preprocessedCanvasesByImageId, setPreprocessedCanvasesByImageId] = useState<Record<string, HTMLCanvasElement>>({});
  const [isOcrProcessing, setIsOcrProcessing] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<{ percent: number; message: string }>({
    percent: 0,
    message: '',
  });
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isOcrBatchOpen, setIsOcrBatchOpen] = useState<boolean>(false);
  const currentOcrJobId = useRef<string | null>(null);

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

  // Keyboard Shortcuts Modal State
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

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

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Active Image Object
  const activeImage = images.find((img) => img.id === activeImageId) || images[0] || null;

  // Active OCR Data derived per selected image
  const ocrResult = (activeImage ? ocrResultsByImageId[activeImage.id] : null) || null;
  const preprocessedCanvas = (activeImage ? preprocessedCanvasesByImageId[activeImage.id] : null) || null;

  // Load History on Mount
  useEffect(() => {
    loadHistoryItems().then(setHistoryItems);
  }, []);

  // Sync Dynamic Route Metadata & Schema.org JSON-LD
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Title
    document.title = routeConfig.title;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', routeConfig.metaDescription);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', routeConfig.canonicalPath);

    // OpenGraph Title & Description
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', routeConfig.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', routeConfig.metaDescription);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', routeConfig.canonicalPath);

    // Update JSON-LD structured data
    let schemaScript = document.getElementById('route-schema-jsonld') as HTMLScriptElement;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'route-schema-jsonld';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          name: 'TridentPDF Image to Text OCR',
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Any modern web browser',
          offers: {
            '@type': 'Offer',
            price: '0.00',
            priceCurrency: 'USD',
          },
          description: routeConfig.metaDescription,
        },
        {
          '@type': 'FAQPage',
          mainEntity: routeConfig.faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://everything-image-studio.web.app/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: routeConfig.h1,
              item: routeConfig.canonicalPath,
            },
          ],
        },
      ],
    };

    schemaScript.text = JSON.stringify(schemaData);
  }, [routeConfig]);

  // Listen to popstate (back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
      setCurrentPath(path);
      const cfg = getRouteConfig(path);
      setSelectedLanguage(cfg.defaultLanguage);
      setSelectedMode(cfg.defaultMode);
      if (path === '/' || path in OCR_ROUTES) {
        setActiveTab('ocr');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Programmatic Internal Route Navigation
  const handleNavigateRoute = (newPath: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', newPath);
    }
    const normalized = newPath.toLowerCase().replace(/\/+$/, '') || '/';
    setCurrentPath(normalized);
    const cfg = getRouteConfig(normalized);
    setSelectedLanguage(cfg.defaultLanguage);
    setSelectedMode(cfg.defaultMode);
    setActiveTab('ocr');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Initializing Files
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
        }
      } catch (err) {
        console.error('Failed to parse dropped files:', err);
      }
    },
    [activeImageId]
  );

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
    const imgToRemove = images.find((img) => img.id === id);
    if (imgToRemove?.previewUrl) {
      try {
        URL.revokeObjectURL(imgToRemove.previewUrl);
      } catch {
        // Ignore
      }
    }
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (activeImageId === id && filtered.length > 0) {
        setActiveImageId(filtered[0].id);
      }
      return filtered;
    });
    setOcrResultsByImageId((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setPreprocessedCanvasesByImageId((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Clear Session & Reset State
  const handleClearAll = () => {
    currentOcrJobId.current = null;
    images.forEach((img) => {
      if (img.previewUrl) {
        try {
          URL.revokeObjectURL(img.previewUrl);
        } catch {
          // Ignore
        }
      }
    });
    if (processedResult?.dataUrl) {
      try {
        URL.revokeObjectURL(processedResult.dataUrl);
      } catch {
        // Ignore
      }
    }
    setImages([]);
    setActiveImageId('');
    setProcessedResult(null);
    setOcrResultsByImageId({});
    setPreprocessedCanvasesByImageId({});
    setIsOcrProcessing(false);
    terminateOcrWorker();
  };

  // Clear Active Image OCR Result
  const handleClearActiveOcrResult = () => {
    if (activeImage) {
      setOcrResultsByImageId((prev) => {
        const copy = { ...prev };
        delete copy[activeImage.id];
        return copy;
      });
    }
  };

  // Update Active Image OCR Result (e.g. text/table edits)
  const handleUpdateActiveOcrResult = (updated: OcrResultData) => {
    if (activeImage) {
      setOcrResultsByImageId((prev) => ({
        ...prev,
        [activeImage.id]: updated,
      }));
    }
  };

  // Cancel in-flight OCR job
  const handleCancelOcr = useCallback(() => {
    currentOcrJobId.current = null;
    setIsOcrProcessing(false);
    terminateOcrWorker();
    showToast('OCR cancelled');
  }, []);

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

  // Run OCR on demand or when active image changes in OCR tab
  const handleRunOcr = useCallback(async () => {
    if (!activeImage || isOcrProcessing) return;

    const targetImageId = activeImage.id;
    const jobId = Math.random().toString(36).slice(2);
    currentOcrJobId.current = jobId;

    setIsOcrProcessing(true);
    setOcrProgress({ percent: 10, message: 'Preparing image for recognition...' });

    try {
      const imgEl = new Image();
      imgEl.crossOrigin = 'anonymous';
      imgEl.src = activeImage.previewUrl;
      await new Promise((resolve, reject) => {
        imgEl.onload = resolve;
        imgEl.onerror = () => reject(new Error('Failed to load image for OCR processing'));
      });

      if (currentOcrJobId.current !== jobId) return;

      const canvas = preprocessCanvasForOcr(imgEl, ocrPreprocessing);

      if (currentOcrJobId.current !== jobId) return;

      setPreprocessedCanvasesByImageId((prev) => ({
        ...prev,
        [targetImageId]: canvas,
      }));

      const result = await recognizeImage(canvas, {
        language: selectedLanguage,
        mode: selectedMode,
        onProgress: (p) => {
          if (currentOcrJobId.current !== jobId) return;
          setOcrProgress({
            percent: p.progress,
            message: p.message,
          });
        },
      });

      if (currentOcrJobId.current !== jobId) return;

      setOcrResultsByImageId((prev) => ({
        ...prev,
        [targetImageId]: result,
      }));
      showToast(`OCR Complete! Extracted ${result.wordsCount} words.`);
    } catch (err: unknown) {
      if (currentOcrJobId.current !== jobId) return;
      const msg = err instanceof Error ? err.message : 'OCR processing failed. Please try again.';
      console.error('OCR Error:', err);
      showToast(msg);
    } finally {
      if (currentOcrJobId.current === jobId) {
        setIsOcrProcessing(false);
      }
    }
  }, [activeImage, isOcrProcessing, ocrPreprocessing, selectedLanguage, selectedMode]);

  // Automatically trigger OCR when image is loaded if in OCR tab and no result yet
  useEffect(() => {
    if (activeTab === 'ocr' && activeImage && !ocrResult && !isOcrProcessing) {
      const timer = setTimeout(() => {
        handleRunOcr();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab, activeImage, ocrResult, isOcrProcessing, handleRunOcr]);

  // Run Process Pipeline on active image for non-OCR tools
  useEffect(() => {
    let isCurrent = true;

    if (!activeImage || activeTab === 'ocr') {
      if (activeTab !== 'ocr') {
        setProcessedResult(null);
      }
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
            const { detectSubjectBounds } = await import('./utils/backgroundRemoval');
            const bounds = await detectSubjectBounds(result.dataUrl);
            setSubjectBounds(bounds);
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
  }, [handleAddFiles]);

  // Start Batch Execution for non-OCR tools
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
        title: 'Everything Image Studio Cutout',
        text: 'Processed 100% locally with Everything Image Studio',
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

  const currentToolName =
    activeTab === 'ocr'
      ? 'Image to Text (OCR)'
      : activeTab === 'bg-remover'
      ? 'Background Remover'
      : activeTab === 'compress'
      ? 'The Compressor'
      : activeTab === 'convert'
      ? 'The Converter'
      : activeTab === 'resize'
      ? 'The Resizer'
      : activeTab === 'watermark'
      ? 'The Watermarker'
      : 'Image Enhancements';

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
            They will be loaded instantly into TridentPDF OCR & Image Studio
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
          if (activeTab === 'ocr') {
            setIsOcrBatchOpen(true);
          } else {
            setIsBatchOpen(true);
            setBatchResults([]);
            setZipBlob(null);
            setBatchProgress({
              total: images.length,
              current: 0,
              currentFilename: '',
              isProcessing: false,
            });
          }
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
              h1Text={routeConfig.h1}
              subheadingText={routeConfig.subheading}
              onOpenCamera={() => setIsCameraOpen(true)}
              activeTab={activeTab}
            />

            {/* SEO Content Section for current route */}
            {activeTab === 'ocr' ? (
              <OcrSeoContent
                routeConfig={routeConfig}
                onNavigateRoute={handleNavigateRoute}
              />
            ) : (
              <ContentSections
                onScrollToUploader={scrollToWorkspace}
                onLoadSample={handleLoadSamples}
              />
            )}
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
              {/* Left Column: Interactive Canvas / OCR Workspace */}
              <div className="lg:col-span-7 flex flex-col h-full">
                {activeTab === 'ocr' ? (
                  <OcrResultWorkspace
                    originalImage={activeImage}
                    ocrResult={ocrResult}
                    isProcessing={isOcrProcessing}
                    preprocessedCanvas={preprocessedCanvas}
                    onClearResult={handleClearActiveOcrResult}
                    onUpdateResult={handleUpdateActiveOcrResult}
                  />
                ) : isProcessing && activeTab === 'bg-remover' ? (
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
                {activeTab === 'ocr' && (
                  <OcrTool
                    selectedLanguage={selectedLanguage}
                    onSelectLanguage={setSelectedLanguage}
                    selectedMode={selectedMode}
                    onSelectMode={setSelectedMode}
                    preprocessing={ocrPreprocessing}
                    onChangePreprocessing={setOcrPreprocessing}
                    isProcessing={isOcrProcessing}
                    progressPercent={ocrProgress.percent}
                    progressMessage={ocrProgress.message}
                    onRunOcr={handleRunOcr}
                    onCancelOcr={handleCancelOcr}
                    hasImage={!!activeImage}
                    onOpenBatch={() => setIsOcrBatchOpen(true)}
                    totalImagesCount={images.length}
                  />
                )}

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
                    onReprocess={() => {}}
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
                    onReset={handleResetAdjustments}
                  />
                )}
              </div>
            </div>

            {/* Bottom Content / SEO Section */}
            {activeTab === 'ocr' ? (
              <OcrSeoContent
                routeConfig={routeConfig}
                onNavigateRoute={handleNavigateRoute}
              />
            ) : (
              <ContentSections
                onScrollToUploader={scrollToWorkspace}
                onLoadSample={handleLoadSamples}
              />
            )}
          </div>
        )}
      </main>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => handleAddFiles([file])}
      />

      {/* Batch OCR Modal */}
      <OcrBatchModal
        isOpen={isOcrBatchOpen}
        onClose={() => setIsOcrBatchOpen(false)}
        images={images}
        selectedLanguage={selectedLanguage}
        selectedMode={selectedMode}
        preprocessing={ocrPreprocessing}
      />

      {/* Background Remover History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
        onSelectItem={handleSelectHistoryItem}
        onDeleteItem={async (id) => {
          await deleteHistoryItem(id);
          loadHistoryItems().then(setHistoryItems);
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

      {/* Batch Export Modal for Other Tools */}
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
      <Footer
        onSelectTool={(tool) => {
          setActiveTab(tool as ToolTab);
          scrollToWorkspace();
        }}
        onScrollToFaq={() => {
          const faq = document.querySelector('details');
          faq?.scrollIntoView({ behavior: 'smooth' });
        }}
        onNavigateRoute={handleNavigateRoute}
      />
    </div>
  );
}

export default App;
