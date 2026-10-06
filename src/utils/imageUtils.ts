import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import type {
  AdjustmentSettings,
  CompressionSettings,
  ConversionSettings,
  ImageDataItem,
  ImageFormat,
  ProcessedResult,
  ResizeSettings,
  ToolTab,
  WatermarkPosition,
  WatermarkSettings,
} from '../types';

/**
 * Format raw byte size into human readable string (KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0 || isNaN(bytes)) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const clampedIndex = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, clampedIndex)).toFixed(dm))} ${sizes[clampedIndex]}`;
}

/**
 * Calculate file size difference percentage
 */
export function formatPercentageSaved(
  originalSize: number,
  newSize: number
): { percent: number; isSaved: boolean; text: string } {
  if (!originalSize || originalSize <= 0) {
    return { percent: 0, isSaved: false, text: '0%' };
  }
  const diff = originalSize - newSize;
  const percent = Math.round((Math.abs(diff) / originalSize) * 100);
  if (diff > 0) {
    return { percent, isSaved: true, text: `-${percent}%` };
  } else if (diff < 0) {
    return { percent, isSaved: false, text: `+${percent}%` };
  }
  return { percent: 0, isSaved: false, text: '0%' };
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/avif':
      return 'avif';
    case 'image/svg+xml':
      return 'svg';
    case 'image/gif':
      return 'gif';
    default:
      return 'png';
  }
}

/**
 * Get MIME type from extension or target name
 */
export function getMimeTypeFromExtension(extOrFilename: string): ImageFormat {
  const ext = extOrFilename.split('.').pop()?.toLowerCase() || '';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'avif') return 'image/avif';
  return 'image/png';
}

/**
 * Calculate target dimensions based on resize mode, aspect ratio lock, or scaling percentage
 */
export function calculateTargetDimensions(
  origWidth: number,
  origHeight: number,
  params: {
    targetWidth?: number;
    targetHeight?: number;
    maintainAspectRatio?: boolean;
    scalePercent?: number;
    resampleMode?: 'canvas' | 'contain' | 'cover';
  }
): { width: number; height: number } {
  if (origWidth <= 0 || origHeight <= 0) {
    return { width: Math.max(1, params.targetWidth || 100), height: Math.max(1, params.targetHeight || 100) };
  }

  const aspectRatio = origWidth / origHeight;

  // Scale percentage takes priority if defined and no manual pixel targets
  if (params.scalePercent !== undefined && params.scalePercent > 0) {
    const scale = params.scalePercent / 100;
    return {
      width: Math.max(1, Math.round(origWidth * scale)),
      height: Math.max(1, Math.round(origHeight * scale)),
    };
  }

  let width = params.targetWidth ?? origWidth;
  let height = params.targetHeight ?? origHeight;

  if (params.maintainAspectRatio) {
    if (params.targetWidth && !params.targetHeight) {
      height = Math.round(width / aspectRatio);
    } else if (params.targetHeight && !params.targetWidth) {
      width = Math.round(height * aspectRatio);
    } else if (params.targetWidth && params.targetHeight) {
      // Fit within bounding box while preserving aspect
      const fitRatio = Math.min(params.targetWidth / origWidth, params.targetHeight / origHeight);
      width = Math.round(origWidth * fitRatio);
      height = Math.round(origHeight * fitRatio);
    }
  }

  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
}

/**
 * Calculate coordinates for watermark positioning
 */
export function calculateWatermarkPosition(
  canvasWidth: number,
  canvasHeight: number,
  itemWidth: number,
  itemHeight: number,
  position: WatermarkPosition,
  padding: number = 20
): { x: number; y: number } {
  let x = padding;
  let y = padding;

  switch (position) {
    case 'top-left':
      x = padding;
      y = padding;
      break;
    case 'top-center':
      x = (canvasWidth - itemWidth) / 2;
      y = padding;
      break;
    case 'top-right':
      x = canvasWidth - itemWidth - padding;
      y = padding;
      break;
    case 'center-left':
      x = padding;
      y = (canvasHeight - itemHeight) / 2;
      break;
    case 'center':
      x = (canvasWidth - itemWidth) / 2;
      y = (canvasHeight - itemHeight) / 2;
      break;
    case 'center-right':
      x = canvasWidth - itemWidth - padding;
      y = (canvasHeight - itemHeight) / 2;
      break;
    case 'bottom-left':
      x = padding;
      y = canvasHeight - itemHeight - padding;
      break;
    case 'bottom-center':
      x = (canvasWidth - itemWidth) / 2;
      y = canvasHeight - itemHeight - padding;
      break;
    case 'bottom-right':
    default:
      x = canvasWidth - itemWidth - padding;
      y = canvasHeight - itemHeight - padding;
      break;
  }

  return {
    x: Math.max(0, Math.round(x)),
    y: Math.max(0, Math.round(y)),
  };
}

/**
 * Load HTMLImageElement from object URL or data URL
 */
export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));
    img.src = src;
  });
}

/**
 * Read File object and extract dimensions, size, preview URL
 */
export async function readImageFileMetadata(file: File): Promise<ImageDataItem> {
  const previewUrl = URL.createObjectURL(file);
  const img = await loadImageElement(previewUrl);

  const width = img.naturalWidth || img.width || 800;
  const height = img.naturalHeight || img.height || 600;

  return {
    id: `${file.name}-${file.lastModified}-${Math.random().toString(36).substring(2, 9)}`,
    file,
    name: file.name,
    originalSize: file.size,
    originalWidth: width,
    originalHeight: height,
    originalType: file.type || 'image/png',
    previewUrl,
    aspectRatio: width / height,
  };
}

/**
 * Render watermark on 2D canvas context
 */
export function renderWatermarkOnContext(
  ctx: CanvasRenderingContext2D,
  settings: WatermarkSettings,
  canvasWidth: number,
  canvasHeight: number,
  watermarkImg?: HTMLImageElement | null
): void {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, settings.opacity));

  if (settings.type === 'text') {
    if (!settings.text.trim()) {
      ctx.restore();
      return;
    }

    const fontSize = settings.fontSize || 32;
    ctx.font = `${settings.fontWeight || '600'} ${fontSize}px ${settings.fontFamily || 'Inter, sans-serif'}`;
    ctx.fillStyle = settings.color || '#FFFFFF';
    ctx.textBaseline = 'top';

    const metrics = ctx.measureText(settings.text);
    const textWidth = metrics.width;
    const textHeight = fontSize * 1.2;

    if (settings.position === 'tiled') {
      const stepX = Math.max(150, textWidth + 80);
      const stepY = Math.max(100, textHeight + 80);
      const rad = ((settings.rotation || -30) * Math.PI) / 180;

      for (let y = -canvasHeight; y < canvasHeight * 2; y += stepY) {
        for (let x = -canvasWidth; x < canvasWidth * 2; x += stepX) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rad);
          ctx.fillText(settings.text, 0, 0);
          ctx.restore();
        }
      }
    } else {
      const { x, y } = calculateWatermarkPosition(
        canvasWidth,
        canvasHeight,
        textWidth,
        textHeight,
        settings.position,
        settings.padding || 24
      );

      ctx.save();
      const centerX = x + textWidth / 2;
      const centerY = y + textHeight / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(((settings.rotation || 0) * Math.PI) / 180);
      ctx.fillText(settings.text, -textWidth / 2, -textHeight / 2);
      ctx.restore();
    }
  } else if (settings.type === 'image' && watermarkImg) {
    const scale = (settings.watermarkImageScale || 25) / 100;
    const wmWidth = Math.max(20, watermarkImg.width * scale);
    const wmHeight = Math.max(20, watermarkImg.height * scale);

    if (settings.position === 'tiled') {
      const stepX = Math.max(100, wmWidth + 60);
      const stepY = Math.max(100, wmHeight + 60);
      const rad = ((settings.rotation || -30) * Math.PI) / 180;

      for (let y = -canvasHeight; y < canvasHeight * 2; y += stepY) {
        for (let x = -canvasWidth; x < canvasWidth * 2; x += stepX) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rad);
          ctx.drawImage(watermarkImg, 0, 0, wmWidth, wmHeight);
          ctx.restore();
        }
      }
    } else {
      const { x, y } = calculateWatermarkPosition(
        canvasWidth,
        canvasHeight,
        wmWidth,
        wmHeight,
        settings.position,
        settings.padding || 24
      );

      ctx.save();
      const centerX = x + wmWidth / 2;
      const centerY = y + wmHeight / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(((settings.rotation || 0) * Math.PI) / 180);
      ctx.drawImage(watermarkImg, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
      ctx.restore();
    }
  }

  ctx.restore();
}

/**
 * Apply adjustments/filters to canvas context
 */
export function applyFiltersToContext(
  ctx: CanvasRenderingContext2D,
  adjustments?: AdjustmentSettings
): void {
  if (!adjustments) return;

  const filters: string[] = [];
  if (adjustments.brightness !== 100) filters.push(`brightness(${adjustments.brightness}%)`);
  if (adjustments.contrast !== 100) filters.push(`contrast(${adjustments.contrast}%)`);
  if (adjustments.saturation !== 100) filters.push(`saturate(${adjustments.saturation}%)`);
  if (adjustments.blur > 0) filters.push(`blur(${adjustments.blur}px)`);
  if (adjustments.grayscale > 0) filters.push(`grayscale(${adjustments.grayscale}%)`);
  if (adjustments.sepia > 0) filters.push(`sepia(${adjustments.sepia}%)`);
  if (adjustments.invert > 0) filters.push(`invert(${adjustments.invert}%)`);

  if (filters.length > 0) {
    ctx.filter = filters.join(' ');
  } else {
    ctx.filter = 'none';
  }
}

/**
 * Convert HTMLCanvasElement to Blob with quality fallback
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string = 'image/png',
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          // Fallback if browser doesn't support specific mimeType in toBlob
          try {
            const dataUrl = canvas.toDataURL(mimeType, quality);
            const byteString = atob(dataUrl.split(',')[1]);
            const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            resolve(new Blob([ab], { type: mimeString }));
          } catch (e) {
            reject(new Error('Canvas conversion to blob failed: ' + e));
          }
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Main Image Processing Pipeline
 */
export async function processImage(
  item: ImageDataItem,
  options: {
    tab: ToolTab;
    compression: CompressionSettings;
    conversion: ConversionSettings;
    resize: ResizeSettings;
    watermark: WatermarkSettings;
    adjustments: AdjustmentSettings;
    watermarkImgElement?: HTMLImageElement | null;
  }
): Promise<ProcessedResult> {
  const startTime = performance.now();
  const originalExt = item.name.substring(item.name.lastIndexOf('.'));
  const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;

  // 1. Dedicated compression module (using browser-image-compression with canvas fallback)
  if (options.tab === 'compress') {
    try {
      const targetSizeMB = options.compression.maxSizeMB || (item.originalSize * options.compression.quality) / (1024 * 1024);
      const compressOptions = {
        maxSizeMB: Math.max(0.01, targetSizeMB),
        maxWidthOrHeight: options.compression.maxWidthOrHeight || Math.max(item.originalWidth, item.originalHeight),
        useWebWorker: options.compression.useWebWorker,
        initialQuality: options.compression.quality,
        fileType: item.originalType.includes('png') ? 'image/png' : 'image/jpeg',
      };

      const compressedFile = await imageCompression(item.file, compressOptions);
      const dataUrl = URL.createObjectURL(compressedFile);
      const img = await loadImageElement(dataUrl);

      return {
        id: item.id,
        blob: compressedFile,
        dataUrl,
        size: compressedFile.size,
        width: img.naturalWidth || item.originalWidth,
        height: img.naturalHeight || item.originalHeight,
        format: compressedFile.type || item.originalType,
        filename: `${baseName}-compressed${originalExt}`,
        processingTimeMs: Math.round(performance.now() - startTime),
      };
    } catch {
      // Fallback to canvas compression if worker/lib throws
      // Continues to canvas processing below
    }
  }

  // 2. Canvas-based pipeline for Resize, Convert, Watermark, Adjustments, and Canvas Compression
  const img = await loadImageElement(item.previewUrl);
  let targetWidth = item.originalWidth;
  let targetHeight = item.originalHeight;

  if (options.tab === 'resize') {
    const dims = calculateTargetDimensions(item.originalWidth, item.originalHeight, {
      targetWidth: options.resize.width,
      targetHeight: options.resize.height,
      maintainAspectRatio: options.resize.maintainAspectRatio,
      scalePercent: options.resize.scalePercent !== 100 ? options.resize.scalePercent : undefined,
      resampleMode: options.resize.resampleMode,
    });
    targetWidth = dims.width;
    targetHeight = dims.height;
  }

  // Handle Rotation (90, 180, 270)
  const isRotated90or270 = options.adjustments.rotate % 180 !== 0;
  const canvasW = isRotated90or270 ? targetHeight : targetWidth;
  const canvasH = isRotated90or270 ? targetWidth : targetHeight;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Failed to create 2D canvas context');
  }

  // Set Background for opaque target formats (like JPEG)
  const targetFormat = options.tab === 'convert' ? options.conversion.targetFormat : (item.originalType as ImageFormat);
  if (targetFormat === 'image/jpeg' || (options.tab === 'convert' && options.conversion.backgroundColor)) {
    ctx.fillStyle = options.tab === 'convert' && options.conversion.backgroundColor ? options.conversion.backgroundColor : '#FFFFFF';
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  // Apply visual adjustments
  ctx.save();
  applyFiltersToContext(ctx, options.adjustments);

  // Position, Rotation & Flip transforms
  ctx.translate(canvasW / 2, canvasH / 2);
  if (options.adjustments.rotate !== 0) {
    ctx.rotate((options.adjustments.rotate * Math.PI) / 180);
  }
  ctx.scale(
    options.adjustments.flipHorizontal ? -1 : 1,
    options.adjustments.flipVertical ? -1 : 1
  );

  // Draw main image
  ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
  ctx.restore();

  // Apply Watermark
  if (options.tab === 'watermark') {
    renderWatermarkOnContext(ctx, options.watermark, canvasW, canvasH, options.watermarkImgElement);
  }

  // Determine export quality and MIME type
  let exportQuality = 0.92;
  let exportFormat: string = item.originalType;
  let outputExtension = originalExt.replace('.', '') || 'png';

  if (options.tab === 'convert') {
    exportFormat = options.conversion.targetFormat;
    exportQuality = options.conversion.quality;
    outputExtension = getExtensionFromMimeType(exportFormat);
  } else if (options.tab === 'compress') {
    exportQuality = options.compression.quality;
    exportFormat = item.originalType.includes('png') ? 'image/jpeg' : item.originalType;
    outputExtension = getExtensionFromMimeType(exportFormat);
  }

  const resultBlob = await canvasToBlob(canvas, exportFormat, exportQuality);
  const dataUrl = URL.createObjectURL(resultBlob);

  const suffix = `-${options.tab}`;
  const filename = `${baseName}${suffix}.${outputExtension}`;

  return {
    id: item.id,
    blob: resultBlob,
    dataUrl,
    size: resultBlob.size,
    width: canvasW,
    height: canvasH,
    format: exportFormat,
    filename,
    processingTimeMs: Math.round(performance.now() - startTime),
  };
}

/**
 * Generate sample image files for instant live testing
 */
export function generateSampleImages(): Array<{ name: string; blob: Blob; url: string }> {
  const samples = [
    { name: 'sample-sunset-landscape.jpg', colorA: '#FF5E62', colorB: '#FF9966', title: 'Sunset Horizon', w: 1200, h: 800 },
    { name: 'sample-tech-avatar.png', colorA: '#4A00E0', colorB: '#8E2DE2', title: 'Studio Avatar', w: 1000, h: 1000 },
    { name: 'sample-neon-cyber.webp', colorA: '#00F260', colorB: '#0575E6', title: 'Cyber Pulse', w: 1600, h: 900 },
  ];

  return samples.map((s) => {
    const canvas = document.createElement('canvas');
    canvas.width = s.w;
    canvas.height = s.h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, s.w, s.h);
      grad.addColorStop(0, s.colorA);
      grad.addColorStop(1, s.colorB);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, s.w, s.h);

      // Decorative circles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(s.w * 0.3, s.h * 0.4, s.w * 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(s.w * 0.75, s.h * 0.7, s.w * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.round(s.w * 0.05)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.title, s.w / 2, s.h / 2 - 20);

      ctx.font = `normal ${Math.round(s.w * 0.025)}px sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(`Sample Test Image (${s.w} × ${s.h})`, s.w / 2, s.h / 2 + 35);
    }

    const dataUrl = canvas.toDataURL(s.name.endsWith('.jpg') ? 'image/jpeg' : 'image/png', 0.95);
    const byteString = atob(dataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: s.name.endsWith('.jpg') ? 'image/jpeg' : 'image/png' });

    return {
      name: s.name,
      blob,
      url: URL.createObjectURL(blob),
    };
  });
}

/**
 * Create a Zip file of multiple processed images
 */
export async function createZipArchive(
  items: Array<{ filename: string; blob: Blob }>
): Promise<Blob> {
  const zip = new JSZip();
  items.forEach((item, index) => {
    // Avoid name collisions
    const safeName = items.filter((x, i) => i < index && x.filename === item.filename).length > 0
      ? `${index + 1}_${item.filename}`
      : item.filename;
    zip.file(safeName, item.blob);
  });

  return await zip.generateAsync({ type: 'blob' });
}
