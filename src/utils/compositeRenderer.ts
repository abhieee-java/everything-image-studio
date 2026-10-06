import type { BackgroundRemovalSettings, SubjectBoundingBox } from './backgroundRemoval';

export interface CompositeRenderOptions {
  originalImage: HTMLImageElement;
  cutoutImage: HTMLImageElement;
  backgroundImage?: HTMLImageElement | null;
  settings: BackgroundRemovalSettings;
  subjectBounds?: SubjectBoundingBox | null;
  rotation?: number; // 0, 90, 180, 270
  flipHorizontal?: boolean;
  flipVertical?: boolean;
}

/**
 * Render complete composite result on a target canvas with full original resolution
 */
export function renderCompositeToCanvas(
  targetCanvas: HTMLCanvasElement,
  options: CompositeRenderOptions
): void {
  const {
    originalImage,
    cutoutImage,
    backgroundImage,
    settings,
    subjectBounds,
    rotation = 0,
    flipHorizontal = false,
    flipVertical = false,
  } = options;

  const origW = cutoutImage.naturalWidth || cutoutImage.width || 800;
  const origH = cutoutImage.naturalHeight || cutoutImage.height || 600;

  // Determine crop box if auto-crop is specified
  let cropX = 0;
  let cropY = 0;
  let cropW = origW;
  let cropH = origH;

  if (settings.autoCrop && settings.autoCrop !== 'original' && subjectBounds) {
    const padFactor = settings.autoCrop === 'tight' ? 0.05 : 0.15;
    const padX = Math.round(subjectBounds.width * padFactor);
    const padY = Math.round(subjectBounds.height * padFactor);

    cropX = Math.max(0, subjectBounds.minX - padX);
    cropY = Math.max(0, subjectBounds.minY - padY);
    cropW = Math.min(origW - cropX, subjectBounds.width + padX * 2);
    cropH = Math.min(origH - cropY, subjectBounds.height + padY * 2);
  }

  // Adjust for aspect ratio presets if chosen
  if (settings.aspectPreset && settings.aspectPreset !== 'free') {
    let targetRatio = 1;
    if (settings.aspectPreset === '1:1' || settings.aspectPreset === 'profile' || settings.aspectPreset === 'product-white') {
      targetRatio = 1;
    } else if (settings.aspectPreset === '4:5') {
      targetRatio = 4 / 5;
    } else if (settings.aspectPreset === '9:16') {
      targetRatio = 9 / 16;
    } else if (settings.aspectPreset === '16:9') {
      targetRatio = 16 / 9;
    }

    const currentRatio = cropW / cropH;
    if (currentRatio > targetRatio) {
      // Wider than desired ratio, expand height if possible or crop width
      const newW = Math.round(cropH * targetRatio);
      cropX = Math.max(0, cropX + Math.round((cropW - newW) / 2));
      cropW = newW;
    } else {
      // Taller than desired ratio, crop height
      const newH = Math.round(cropW / targetRatio);
      cropY = Math.max(0, cropY + Math.round((cropH - newH) / 2));
      cropH = newH;
    }
  }

  // Set canvas dimensions
  const isRotatedQuarter = rotation === 90 || rotation === 270;
  targetCanvas.width = isRotatedQuarter ? cropH : cropW;
  targetCanvas.height = isRotatedQuarter ? cropW : cropH;

  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  ctx.save();

  // Handle Rotation and Flip transformations
  const cx = targetCanvas.width / 2;
  const cy = targetCanvas.height / 2;
  ctx.translate(cx, cy);

  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }
  if (flipHorizontal) {
    ctx.scale(-1, 1);
  }
  if (flipVertical) {
    ctx.scale(1, -1);
  }

  // Draw background relative to center
  const drawX = -cropW / 2;
  const drawY = -cropH / 2;

  // 1. Render Background
  const bgType = settings.bgType || 'transparent';

  if (settings.aspectPreset === 'product-white') {
    // E-commerce product preset always has a crisp clean white studio base
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(drawX, drawY, cropW, cropH);
  } else if (bgType === 'solid') {
    ctx.fillStyle = settings.bgColor || '#FFFFFF';
    ctx.fillRect(drawX, drawY, cropW, cropH);
  } else if (bgType === 'gradient') {
    const gradSpec = settings.bgGradient || 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)';
    const grad = parseGradient(ctx, gradSpec, drawX, drawY, cropW, cropH);
    ctx.fillStyle = grad;
    ctx.fillRect(drawX, drawY, cropW, cropH);
  } else if (bgType === 'blur') {
    ctx.save();
    const blurRadius = settings.bgBlur ?? 16;
    ctx.filter = `blur(${blurRadius}px)`;
    // Scale slightly to prevent blur transparent edge artifacts
    const scale = 1.05;
    ctx.drawImage(
      originalImage,
      cropX,
      cropY,
      cropW,
      cropH,
      drawX - (cropW * (scale - 1)) / 2,
      drawY - (cropH * (scale - 1)) / 2,
      cropW * scale,
      cropH * scale
    );
    ctx.restore();
  } else if (bgType === 'image' && backgroundImage) {
    ctx.drawImage(
      backgroundImage,
      0,
      0,
      backgroundImage.width,
      backgroundImage.height,
      drawX,
      drawY,
      cropW,
      cropH
    );
  }

  // 2. Render Cutout Foreground Subject
  if (settings.aspectPreset === 'product-white') {
    // Add balanced padding for product preset
    const pad = Math.round(Math.min(cropW, cropH) * 0.1);
    ctx.drawImage(
      cutoutImage,
      cropX,
      cropY,
      cropW,
      cropH,
      drawX + pad,
      drawY + pad,
      cropW - pad * 2,
      cropH - pad * 2
    );
  } else {
    ctx.drawImage(
      cutoutImage,
      cropX,
      cropY,
      cropW,
      cropH,
      drawX,
      drawY,
      cropW,
      cropH
    );
  }

  ctx.restore();

  // Profile circular preset: mask out outer ring if circular preset is selected
  if (settings.aspectPreset === 'profile') {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    const radius = Math.min(targetCanvas.width, targetCanvas.height) / 2;
    ctx.arc(targetCanvas.width / 2, targetCanvas.height / 2, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Export composite result as a high-resolution Blob
 */
export async function exportCompositeBlob(
  options: CompositeRenderOptions,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality: number = 0.95
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  renderCompositeToCanvas(canvas, options);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate export blob'));
        }
      },
      format,
      quality
    );
  });
}

/**
 * Helper to parse linear-gradient CSS string into 2D CanvasGradient
 */
function parseGradient(
  ctx: CanvasRenderingContext2D,
  gradientStr: string,
  x: number,
  y: number,
  w: number,
  h: number
): CanvasGradient {
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);

  // Default fallback gradient presets
  if (gradientStr.includes('#')) {
    const hexMatches = gradientStr.match(/#[0-9a-fA-F]{3,8}/g);
    if (hexMatches && hexMatches.length >= 2) {
      grad.addColorStop(0, hexMatches[0]);
      grad.addColorStop(1, hexMatches[1]);
      return grad;
    }
  }

  // Standard Linear Sunset
  grad.addColorStop(0, '#6366f1');
  grad.addColorStop(1, '#a855f7');
  return grad;
}
