import { describe, it, expect, vi } from 'vitest';
import {
  formatBytes,
  formatPercentageSaved,
  getExtensionFromMimeType,
  getMimeTypeFromExtension,
  calculateTargetDimensions,
  calculateWatermarkPosition,
  applyFiltersToContext,
  renderWatermarkOnContext,
  generateSampleImages,
  createZipArchive,
} from '../utils/imageUtils';
import type { WatermarkSettings, AdjustmentSettings } from '../types';

describe('imageUtils Pure Utilities', () => {
  describe('formatBytes', () => {
    it('handles 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('handles negative or NaN values', () => {
      expect(formatBytes(-50)).toBe('0 B');
      expect(formatBytes(NaN)).toBe('0 B');
    });

    it('formats bytes, KB, MB, GB correctly', () => {
      expect(formatBytes(500)).toBe('500 B');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(2621440)).toBe('2.5 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    it('respects decimal precision', () => {
      expect(formatBytes(1572864, 2)).toBe('1.5 MB');
      expect(formatBytes(1572864, 0)).toBe('2 MB');
    });
  });

  describe('formatPercentageSaved', () => {
    it('calculates savings correctly when new size is smaller', () => {
      const res = formatPercentageSaved(1000, 250);
      expect(res.percent).toBe(75);
      expect(res.isSaved).toBe(true);
      expect(res.text).toBe('-75%');
    });

    it('calculates size increase when new size is larger', () => {
      const res = formatPercentageSaved(1000, 1500);
      expect(res.percent).toBe(50);
      expect(res.isSaved).toBe(false);
      expect(res.text).toBe('+50%');
    });

    it('handles zero or equal sizes gracefully', () => {
      expect(formatPercentageSaved(1000, 1000).text).toBe('0%');
      expect(formatPercentageSaved(0, 100).text).toBe('0%');
    });
  });

  describe('getExtensionFromMimeType & getMimeTypeFromExtension', () => {
    it('maps MIME types to file extensions correctly', () => {
      expect(getExtensionFromMimeType('image/jpeg')).toBe('jpg');
      expect(getExtensionFromMimeType('image/png')).toBe('png');
      expect(getExtensionFromMimeType('image/webp')).toBe('webp');
      expect(getExtensionFromMimeType('image/avif')).toBe('avif');
      expect(getExtensionFromMimeType('image/svg+xml')).toBe('svg');
      expect(getExtensionFromMimeType('image/gif')).toBe('gif');
      expect(getExtensionFromMimeType('unknown/type')).toBe('png');
    });

    it('maps extensions/filenames to MIME types correctly', () => {
      expect(getMimeTypeFromExtension('photo.jpg')).toBe('image/jpeg');
      expect(getMimeTypeFromExtension('photo.jpeg')).toBe('image/jpeg');
      expect(getMimeTypeFromExtension('photo.webp')).toBe('image/webp');
      expect(getMimeTypeFromExtension('photo.avif')).toBe('image/avif');
      expect(getMimeTypeFromExtension('photo.png')).toBe('image/png');
    });
  });

  describe('calculateTargetDimensions', () => {
    const origW = 1920;
    const origH = 1080;

    it('scales by percentage correctly', () => {
      const scaled50 = calculateTargetDimensions(origW, origH, { scalePercent: 50 });
      expect(scaled50.width).toBe(960);
      expect(scaled50.height).toBe(540);

      const scaled200 = calculateTargetDimensions(origW, origH, { scalePercent: 200 });
      expect(scaled200.width).toBe(3840);
      expect(scaled200.height).toBe(2160);
    });

    it('locks aspect ratio when width changes', () => {
      const res = calculateTargetDimensions(origW, origH, {
        targetWidth: 960,
        maintainAspectRatio: true,
      });
      expect(res.width).toBe(960);
      expect(res.height).toBe(540);
    });

    it('locks aspect ratio when height changes', () => {
      const res = calculateTargetDimensions(origW, origH, {
        targetHeight: 540,
        maintainAspectRatio: true,
      });
      expect(res.width).toBe(960);
      expect(res.height).toBe(540);
    });

    it('allows free aspect ratio when maintainAspectRatio is false', () => {
      const res = calculateTargetDimensions(origW, origH, {
        targetWidth: 800,
        targetHeight: 800,
        maintainAspectRatio: false,
      });
      expect(res.width).toBe(800);
      expect(res.height).toBe(800);
    });

    it('fits inside bounding box when both target dimensions provided with maintainAspectRatio', () => {
      const res = calculateTargetDimensions(1000, 500, {
        targetWidth: 500,
        targetHeight: 500,
        maintainAspectRatio: true,
      });
      expect(res.width).toBe(500);
      expect(res.height).toBe(250);
    });
  });

  describe('calculateWatermarkPosition', () => {
    const canvasW = 1000;
    const canvasH = 800;
    const itemW = 200;
    const itemH = 50;
    const pad = 20;

    it('calculates top-left coordinates', () => {
      const pos = calculateWatermarkPosition(canvasW, canvasH, itemW, itemH, 'top-left', pad);
      expect(pos).toEqual({ x: 20, y: 20 });
    });

    it('calculates top-center coordinates', () => {
      const pos = calculateWatermarkPosition(canvasW, canvasH, itemW, itemH, 'top-center', pad);
      expect(pos).toEqual({ x: (1000 - 200) / 2, y: 20 });
    });

    it('calculates top-right coordinates', () => {
      const pos = calculateWatermarkPosition(canvasW, canvasH, itemW, itemH, 'top-right', pad);
      expect(pos).toEqual({ x: 1000 - 200 - 20, y: 20 });
    });

    it('calculates center coordinates', () => {
      const pos = calculateWatermarkPosition(canvasW, canvasH, itemW, itemH, 'center', pad);
      expect(pos).toEqual({ x: 400, y: 375 });
    });

    it('calculates bottom-right coordinates', () => {
      const pos = calculateWatermarkPosition(canvasW, canvasH, itemW, itemH, 'bottom-right', pad);
      expect(pos).toEqual({ x: 780, y: 730 });
    });

    it('calculates bottom-left coordinates', () => {
      const pos = calculateWatermarkPosition(canvasW, canvasH, itemW, itemH, 'bottom-left', pad);
      expect(pos).toEqual({ x: 20, y: 730 });
    });
  });

  describe('applyFiltersToContext', () => {
    it('sets ctx.filter to none when default adjustments', () => {
      const ctx = { filter: '' } as unknown as CanvasRenderingContext2D;
      const defaultAdj: AdjustmentSettings = {
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
      };
      applyFiltersToContext(ctx, defaultAdj);
      expect(ctx.filter).toBe('none');
    });

    it('builds combined CSS filter string correctly', () => {
      const ctx = { filter: '' } as unknown as CanvasRenderingContext2D;
      const adj: AdjustmentSettings = {
        brightness: 120,
        contrast: 150,
        saturation: 80,
        blur: 4,
        grayscale: 50,
        sepia: 20,
        invert: 10,
        rotate: 0,
        flipHorizontal: false,
        flipVertical: false,
      };
      applyFiltersToContext(ctx, adj);
      expect(ctx.filter).toContain('brightness(120%)');
      expect(ctx.filter).toContain('contrast(150%)');
      expect(ctx.filter).toContain('saturate(80%)');
      expect(ctx.filter).toContain('blur(4px)');
      expect(ctx.filter).toContain('grayscale(50%)');
      expect(ctx.filter).toContain('sepia(20%)');
      expect(ctx.filter).toContain('invert(10%)');
    });
  });

  describe('renderWatermarkOnContext', () => {
    it('renders text watermark with save and restore', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({ width: 150 })),
      } as unknown as CanvasRenderingContext2D;

      const settings: WatermarkSettings = {
        type: 'text',
        text: 'Watermark Test',
        fontFamily: 'Inter',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        opacity: 0.8,
        position: 'bottom-right',
        rotation: 0,
        padding: 20,
      };

      renderWatermarkOnContext(ctx, settings, 800, 600);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('renders tiled text watermark across grid', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({ width: 100 })),
      } as unknown as CanvasRenderingContext2D;

      const settings: WatermarkSettings = {
        type: 'text',
        text: 'Tiled Stamp',
        fontFamily: 'Inter',
        fontSize: 24,
        fontWeight: 'normal',
        color: '#FFFFFF',
        opacity: 0.5,
        position: 'tiled',
        rotation: -30,
        padding: 0,
      };

      renderWatermarkOnContext(ctx, settings, 500, 500);
      expect(ctx.fillText).toHaveBeenCalled();
    });
  });

  describe('generateSampleImages & createZipArchive', () => {
    it('generates sample image set with valid data', () => {
      const samples = generateSampleImages();
      expect(samples.length).toBe(3);
      expect(samples[0].name).toContain('sample-sunset-landscape');
      expect(samples[0].blob).toBeDefined();
      expect(samples[0].url).toBeDefined();
    });

    it('creates zip archive from processed items', async () => {
      const blob1 = new Blob(['sample-img-1'], { type: 'image/png' });
      const blob2 = new Blob(['sample-img-2'], { type: 'image/jpeg' });
      const items = [
        { filename: 'photo1.png', blob: blob1 },
        { filename: 'photo2.jpg', blob: blob2 },
      ];

      const zip = await createZipArchive(items);
      expect(zip).toBeInstanceOf(Blob);
      expect(zip.size).toBeGreaterThan(0);
    });
  });
});
