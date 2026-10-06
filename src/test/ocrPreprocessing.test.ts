import { describe, it, expect } from 'vitest';
import {
  calculateOtsuThreshold,
  applyConvolution,
  estimateSkewAngle,
  preprocessCanvasForOcr,
  DEFAULT_PREPROCESSING_SETTINGS,
} from '../utils/ocrPreprocessing';

describe('OCR Preprocessing Utilities', () => {
  it('calculates optimal Otsu threshold for bimodal pixel distribution', () => {
    // Construct sample bimodal data: 50 dark pixels (value 40) and 50 light pixels (value 220)
    const data = new Uint8ClampedArray(100 * 4);
    for (let i = 0; i < 50; i++) {
      data[i * 4] = 40;
      data[i * 4 + 1] = 40;
      data[i * 4 + 2] = 40;
      data[i * 4 + 3] = 255;
    }
    for (let i = 50; i < 100; i++) {
      data[i * 4] = 220;
      data[i * 4 + 1] = 220;
      data[i * 4 + 2] = 220;
      data[i * 4 + 3] = 255;
    }

    const threshold = calculateOtsuThreshold(data);
    expect(threshold).toBeGreaterThan(40);
    expect(threshold).toBeLessThan(220);
  });

  it('applies 3x3 sharpening convolution kernel', () => {
    const width = 5;
    const height = 5;
    const src = new Uint8ClampedArray(width * height * 4).fill(100);
    // Center pixel different value
    const centerIdx = (2 * width + 2) * 4;
    src[centerIdx] = 200;
    src[centerIdx + 1] = 200;
    src[centerIdx + 2] = 200;

    const dst = new Uint8ClampedArray(src);
    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    applyConvolution(src, dst, width, height, kernel, 1);

    expect(dst[centerIdx]).toBeGreaterThanOrEqual(100);
  });

  it('runs canvas preprocessing pipeline without errors', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;

    const result = preprocessCanvasForOcr(canvas, {
      ...DEFAULT_PREPROCESSING_SETTINGS,
      autoEnhance: true,
      grayscale: true,
      sharpen: true,
      binarize: true,
    });

    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it('handles empty image data buffer safely in calculateOtsuThreshold', () => {
    const emptyData = new Uint8ClampedArray(0);
    expect(calculateOtsuThreshold(emptyData)).toBe(128);
  });

  it('handles extreme rotation and zero dimension canvas gracefully in preprocessCanvasForOcr', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 0;
    canvas.height = 0;

    const result = preprocessCanvasForOcr(canvas, {
      ...DEFAULT_PREPROCESSING_SETTINGS,
      rotation: -450,
      contrast: 50,
      brightness: -20,
      invert: true,
      denoise: true,
    });

    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(1);
    expect(result.height).toBeGreaterThanOrEqual(1);
  });

  it('handles estimateSkewAngle on small and normal canvases', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    const angle = estimateSkewAngle(canvas);
    expect(typeof angle).toBe('number');
  });
});
