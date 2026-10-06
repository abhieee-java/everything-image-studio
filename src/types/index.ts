export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

export type ToolTab = 'ocr' | 'bg-remover' | 'compress' | 'convert' | 'resize' | 'watermark' | 'adjust';

export * from './ocr';

export type SmartMode = 'auto' | 'portrait' | 'product' | 'hair-fur';

export type BackgroundType = 'transparent' | 'solid' | 'gradient' | 'blur' | 'image';

export type BrushMode = 'erase' | 'restore' | 'none';

export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'tiled';

export interface ImageDataItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalType: string;
  previewUrl: string;
  aspectRatio: number;
  originalFormatExtension?: string | null;
  isHeicOrRaw?: boolean;
}

export interface BackgroundRemovalSettings {
  smartMode: SmartMode;
  removeMetadata: boolean;
  bgType?: BackgroundType;
  bgColor?: string;
  bgGradient?: string;
  bgBlur?: number; // 0 to 30
  bgImageUrl?: string | null;
  autoCrop?: 'original' | 'tight' | 'balanced';
  aspectPreset?: 'free' | '1:1' | '4:5' | '9:16' | '16:9' | 'profile' | 'product-white';
}

export interface BrushSettings {
  mode: BrushMode;
  size: number;
  hardness: number;
  opacity: number;
}

export interface CompressionSettings {
  quality: number; // 0.1 to 1.0
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker: boolean;
}

export interface ConversionSettings {
  targetFormat: ImageFormat;
  quality: number; // 0.1 to 1.0
  backgroundColor: string; // for JPG if transparent
}

export interface ResizeSettings {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  scalePercent: number; // 1 to 500
  resampleMode: 'canvas' | 'contain' | 'cover';
}

export interface WatermarkSettings {
  type: 'text' | 'image';
  text: string;
  fontFamily: string;
  fontSize: number; // in px
  fontWeight: string;
  color: string;
  opacity: number; // 0 to 1
  position: WatermarkPosition;
  rotation: number; // in degrees
  padding: number;
  watermarkImageFile?: File | null;
  watermarkImageUrl?: string | null;
  watermarkImageScale?: number; // 1 to 100% of base image
}

export interface AdjustmentSettings {
  brightness: number; // 0 to 200 (100 is normal)
  contrast: number; // 0 to 200 (100 is normal)
  saturation: number; // 0 to 200 (100 is normal)
  blur: number; // 0 to 20px
  grayscale: number; // 0 to 100%
  sepia: number; // 0 to 100%
  invert: number; // 0 to 100%
  rotate: number; // 0, 90, 180, 270
  flipHorizontal: boolean;
  flipVertical: boolean;
}

export interface ProcessedResult {
  id: string;
  blob: Blob;
  dataUrl: string;
  size: number;
  width: number;
  height: number;
  format: string;
  filename: string;
  processingTimeMs: number;
}

export interface BatchProgress {
  total: number;
  current: number;
  currentFilename: string;
  isProcessing: boolean;
}

export interface HistoryItem {
  id: string;
  name: string;
  timestamp: number;
  thumbnail: string;
  processedBlob: Blob;
  width: number;
  height: number;
  size: number;
}
