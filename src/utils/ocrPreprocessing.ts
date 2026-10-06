import type { OcrPreprocessingSettings } from '../types/ocr';

export const DEFAULT_PREPROCESSING_SETTINGS: OcrPreprocessingSettings = {
  autoEnhance: false,
  grayscale: false,
  contrast: 0,
  brightness: 0,
  sharpen: false,
  binarize: false,
  threshold: 0, // 0 = automatic Otsu
  deskew: false,
  invert: false,
  denoise: false,
  rotation: 0,
};

/**
 * Calculate optimal Otsu threshold for a grayscale image
 */
export function calculateOtsuThreshold(data: Uint8ClampedArray): number {
  if (!data || data.length === 0) return 128;
  const total = data.length / 4;
  if (total === 0) return 128;
  const histogram = new Int32Array(256);

  for (let i = 0; i < data.length; i += 4) {
    histogram[data[i]]++;
  }

  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVariance = 0;
  let thresholdMin = 128;
  let thresholdMax = 128;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    wF = total - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const variance = wB * wF * (mB - mF) * (mB - mF);

    if (variance > maxVariance) {
      maxVariance = variance;
      thresholdMin = t;
      thresholdMax = t;
    } else if (variance === maxVariance && variance > 0) {
      thresholdMax = t;
    }
  }

  return maxVariance > 0 ? Math.round((thresholdMin + thresholdMax) / 2) : 128;
}

/**
 * Apply 3x3 convolution kernel to image data
 */
export function applyConvolution(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[],
  weight: number = 1
): void {
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0;
      let g = 0;
      let b = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
          const kVal = kernel[(ky + 1) * 3 + (kx + 1)];
          r += src[pixelIndex] * kVal;
          g += src[pixelIndex + 1] * kVal;
          b += src[pixelIndex + 2] * kVal;
        }
      }

      const outIndex = (y * width + x) * 4;
      dst[outIndex] = Math.min(255, Math.max(0, r / weight));
      dst[outIndex + 1] = Math.min(255, Math.max(0, g / weight));
      dst[outIndex + 2] = Math.min(255, Math.max(0, b / weight));
      dst[outIndex + 3] = src[outIndex + 3];
    }
  }
}

/**
 * Estimate skew angle using horizontal line projection profiling across -15 to +15 degrees
 */
export function estimateSkewAngle(canvas: HTMLCanvasElement): number {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    // Use smaller downscaled representation for fast profile variance check
    const scale = Math.min(1, 400 / Math.max(canvas.width, canvas.height));
    const sampleWidth = Math.floor(canvas.width * scale);
    const sampleHeight = Math.floor(canvas.height * scale);

    if (sampleWidth <= 10 || sampleHeight <= 10) return 0;

    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = sampleWidth;
    sampleCanvas.height = sampleHeight;
    const sCtx = sampleCanvas.getContext('2d');
    if (!sCtx) return 0;

    sCtx.drawImage(canvas, 0, 0, sampleWidth, sampleHeight);
    const imgData = sCtx.getImageData(0, 0, sampleWidth, sampleHeight);
    const data = imgData.data;

    let bestAngle = 0;
    let maxVariance = -1;

    // Test angles from -10 to +10 degrees in 1 degree steps
    for (let angle = -10; angle <= 10; angle += 1) {
      if (angle === 0) continue;
      const rad = (angle * Math.PI) / 180;
      const tan = Math.tan(rad);

      const projections = new Float32Array(sampleHeight);
      for (let y = 0; y < sampleHeight; y++) {
        let count = 0;
        for (let x = 0; x < sampleWidth; x++) {
          const shiftedY = Math.round(y + (x - sampleWidth / 2) * tan);
          if (shiftedY >= 0 && shiftedY < sampleHeight) {
            const idx = (shiftedY * sampleWidth + x) * 4;
            // Check luminance < 128 (dark text)
            const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            if (lum < 128) count++;
          }
        }
        projections[y] = count;
      }

      // Calculate variance of row projection counts
      let sum = 0;
      for (let i = 0; i < sampleHeight; i++) sum += projections[i];
      const mean = sum / sampleHeight;
      let variance = 0;
      for (let i = 0; i < sampleHeight; i++) {
        const diff = projections[i] - mean;
        variance += diff * diff;
      }

      if (variance > maxVariance) {
        maxVariance = variance;
        bestAngle = angle;
      }
    }

    // Only return if significant skew detected (> 1.5 degrees)
    return Math.abs(bestAngle) >= 1 ? bestAngle : 0;
  } catch {
    return 0;
  }
}

/**
 * Preprocess an HTML Image or Canvas with OCR optimization settings
 */
export function preprocessCanvasForOcr(
  source: HTMLImageElement | HTMLCanvasElement,
  settings: OcrPreprocessingSettings
): HTMLCanvasElement {
  let initialWidth = source.width;
  let initialHeight = source.height;
  if (!Number.isFinite(initialWidth) || initialWidth <= 0) initialWidth = 100;
  if (!Number.isFinite(initialHeight) || initialHeight <= 0) initialHeight = 100;

  // Handle Rotation first
  const rot = ((settings.rotation % 360) + 360) % 360;
  const isPerpendicular = rot === 90 || rot === 270;
  const rotatedWidth = isPerpendicular ? initialHeight : initialWidth;
  const rotatedHeight = isPerpendicular ? initialWidth : initialHeight;

  // Optimal OCR resolution normalization (aim for ~1800 - 2400 max dimension)
  const maxDim = Math.max(rotatedWidth, rotatedHeight);
  let scale = 1;
  if (maxDim > 2400) {
    scale = 2400 / maxDim;
  } else if (maxDim > 0 && maxDim < 600) {
    scale = Math.min(2, 600 / maxDim); // Upscale small images for clearer text
  }
  if (!Number.isFinite(scale) || scale <= 0) {
    scale = 1;
  }

  const finalWidth = Math.max(1, Math.round(rotatedWidth * scale) || 1);
  const finalHeight = Math.max(1, Math.round(rotatedHeight * scale) || 1);

  const canvas = document.createElement('canvas');
  canvas.width = finalWidth;
  canvas.height = finalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  // Draw background white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Apply Rotation
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (rot !== 0) {
    ctx.rotate((rot * Math.PI) / 180);
  }

  const drawW = (isPerpendicular ? canvas.height : canvas.width);
  const drawH = (isPerpendicular ? canvas.width : canvas.height);
  ctx.drawImage(source, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  // If deskew requested, calculate and rotate
  if (settings.deskew) {
    const skew = estimateSkewAngle(canvas);
    if (Math.abs(skew) > 0.5) {
      const deskewCanvas = document.createElement('canvas');
      deskewCanvas.width = canvas.width;
      deskewCanvas.height = canvas.height;
      const dCtx = deskewCanvas.getContext('2d');
      if (dCtx) {
        dCtx.fillStyle = '#FFFFFF';
        dCtx.fillRect(0, 0, deskewCanvas.width, deskewCanvas.height);
        dCtx.translate(deskewCanvas.width / 2, deskewCanvas.height / 2);
        dCtx.rotate((-skew * Math.PI) / 180);
        dCtx.drawImage(canvas, -deskewCanvas.width / 2, -deskewCanvas.height / 2);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(deskewCanvas, 0, 0);
      }
    }
  }

  // Pixel Manipulation
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const len = data.length;

  const doAuto = settings.autoEnhance;
  const doGray = settings.grayscale || doAuto || settings.binarize;
  const doSharpen = settings.sharpen || doAuto;
  const doBinarize = settings.binarize || (doAuto && settings.threshold > 0);

  // Contrast & Brightness factors
  const brightnessOffset = settings.brightness * 1.28; // -128 to +128
  const contrastFactor =
    settings.contrast === 0
      ? 1
      : (259 * (settings.contrast * 2.55 + 255)) / (255 * (259 - settings.contrast * 2.55));

  // Step 1: Grayscale, Invert, Brightness, and Contrast
  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (settings.invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    if (doGray) {
      // ITU-R BT.709 luminance
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = gray;
      g = gray;
      b = gray;
    }

    // Brightness
    if (brightnessOffset !== 0) {
      r += brightnessOffset;
      g += brightnessOffset;
      b += brightnessOffset;
    }

    // Contrast
    if (contrastFactor !== 1) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  // Step 2: Denoise if enabled (simple 3x3 median on luminance)
  if (settings.denoise) {
    const copy = new Uint8ClampedArray(data);
    const w = canvas.width;
    const h = canvas.height;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const windowVals: number[] = [];
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * w + (x + kx)) * 4;
            windowVals.push(copy[idx]);
          }
        }
        windowVals.sort((a, b) => a - b);
        const median = windowVals[4];
        const outIdx = (y * w + x) * 4;
        data[outIdx] = median;
        data[outIdx + 1] = median;
        data[outIdx + 2] = median;
      }
    }
  }

  // Step 3: Sharpen filter (Laplacian unsharp mask)
  if (doSharpen && canvas.width > 2 && canvas.height > 2) {
    const copy = new Uint8ClampedArray(data);
    const sharpenKernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    applyConvolution(copy, data, canvas.width, canvas.height, sharpenKernel, 1);
  }

  // Step 4: Binarization (Otsu or custom threshold)
  if (doBinarize) {
    const thresholdVal =
      settings.threshold > 0 ? settings.threshold : calculateOtsuThreshold(data);
    for (let i = 0; i < len; i += 4) {
      const val = data[i] > thresholdVal ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}
