import { describe, it, expect, vi } from 'vitest';
import {
  isHeicOrRawFile,
  getRawOrHeicExtension,
  extractEmbeddedJpegFromRaw,
  transcodeRawOrHeicIfNeeded,
  formatOutputForExport,
  HEIC_EXTENSIONS,
  RAW_EXTENSIONS,
} from '../utils/rawHeicHandler';

vi.mock('heic2any', () => ({
  default: vi.fn(async () => {
    return new Blob(['fake-transcoded-jpeg'], { type: 'image/jpeg' });
  }),
}));

describe('rawHeicHandler utility suite', () => {
  describe('isHeicOrRawFile', () => {
    it('identifies HEIC and HEIF files correctly', () => {
      const file1 = new File(['data'], 'photo.heic', { type: 'image/heic' });
      const file2 = new File(['data'], 'vacation.HEIF', { type: '' });
      expect(isHeicOrRawFile(file1)).toBe(true);
      expect(isHeicOrRawFile(file2)).toBe(true);
      expect(isHeicOrRawFile(new Blob(['data'], { type: 'image/heic' }), 'test.heic')).toBe(true);
    });

    it('identifies major RAW and ProRAW formats', () => {
      const rawNames = ['shot.dng', 'camera.CR2', 'canon.cr3', 'nikon.NEF', 'sony.ARW', 'generic.raw'];
      for (const name of rawNames) {
        const file = new File(['data'], name, { type: '' });
        expect(isHeicOrRawFile(file)).toBe(true);
      }
    });

    it('returns false for standard image types', () => {
      const standardFiles = [
        new File(['data'], 'image.jpg', { type: 'image/jpeg' }),
        new File(['data'], 'graphic.png', { type: 'image/png' }),
        new File(['data'], 'banner.webp', { type: 'image/webp' }),
      ];
      for (const file of standardFiles) {
        expect(isHeicOrRawFile(file)).toBe(false);
      }
    });
  });

  describe('getRawOrHeicExtension', () => {
    it('extracts extensions from filename correctly', () => {
      expect(getRawOrHeicExtension('IMG_1234.HEIC')).toBe('heic');
      expect(getRawOrHeicExtension('proraw_capture.dng')).toBe('dng');
      expect(getRawOrHeicExtension('photo.cr2')).toBe('cr2');
      expect(getRawOrHeicExtension('standard.jpg')).toBe(null);
    });

    it('resolves extension from MIME type if filename extension is absent', () => {
      expect(getRawOrHeicExtension('unnamed', 'image/heic')).toBe('heic');
      expect(getRawOrHeicExtension('blob-data', 'image/x-adobe-dng')).toBe('dng');
    });
  });

  describe('extractEmbeddedJpegFromRaw', () => {
    it('extracts embedded JPEG bytes between SOI (FF D8 FF) and EOI (FF D9)', () => {
      // Build a mock RAW buffer containing an embedded JPEG stream
      const prefix = new Uint8Array([0x49, 0x49, 0x2a, 0x00]); // TIFF header
      const jpegPayload = new Uint8Array(80).fill(0x55);
      const jpegSoi = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
      const jpegEoi = new Uint8Array([0xff, 0xd9]);
      const suffix = new Uint8Array([0x00, 0x01, 0x02]);

      const totalLen = prefix.length + jpegSoi.length + jpegPayload.length + jpegEoi.length + suffix.length;
      const combined = new Uint8Array(totalLen);
      let offset = 0;

      combined.set(prefix, offset); offset += prefix.length;
      combined.set(jpegSoi, offset); offset += jpegSoi.length;
      combined.set(jpegPayload, offset); offset += jpegPayload.length;
      combined.set(jpegEoi, offset); offset += jpegEoi.length;
      combined.set(suffix, offset);

      const extracted = extractEmbeddedJpegFromRaw(combined.buffer);
      expect(extracted).not.toBeNull();
      expect(extracted?.type).toBe('image/jpeg');
      expect(extracted?.size).toBe(jpegSoi.length + jpegPayload.length + jpegEoi.length);
    });

    it('returns null if no embedded JPEG is present', () => {
      const emptyBuffer = new Uint8Array(200).fill(0x00).buffer;
      const extracted = extractEmbeddedJpegFromRaw(emptyBuffer);
      expect(extracted).toBeNull();
    });
  });

  describe('transcodeRawOrHeicIfNeeded', () => {
    it('silently transcodes HEIC files to high-quality JPEG in memory', async () => {
      const file = new File(['fake-heic-data'], 'iphone-portrait.heic', { type: 'image/heic' });
      const result = await transcodeRawOrHeicIfNeeded(file);

      expect(result.isTranscoded).toBe(true);
      expect(result.originalFormat).toBe('heic');
      expect(result.file.type).toBe('image/jpeg');
      expect(result.file.name).toBe('iphone-portrait.jpg');
    });

    it('silently extracts embedded JPEG from RAW files', async () => {
      const jpegSoi = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
      const jpegPayload = new Uint8Array(70).fill(0xaa);
      const jpegEoi = new Uint8Array([0xff, 0xd9]);
      const rawData = new Uint8Array([...jpegSoi, ...jpegPayload, ...jpegEoi]);

      const rawFile = new File([rawData], 'nikon-shot.nef', { type: 'image/x-nikon-nef' });
      const result = await transcodeRawOrHeicIfNeeded(rawFile);

      expect(result.isTranscoded).toBe(true);
      expect(result.originalFormat).toBe('nef');
      expect(result.file.type).toBe('image/jpeg');
      expect(result.file.name).toBe('nikon-shot.jpg');
    });

    it('passes standard image files through without modification', async () => {
      const file = new File(['png-data'], 'sample.png', { type: 'image/png' });
      const result = await transcodeRawOrHeicIfNeeded(file);

      expect(result.isTranscoded).toBe(false);
      expect(result.originalFormat).toBe(null);
      expect(result.file).toBe(file);
    });
  });

  describe('formatOutputForExport', () => {
    it('packages output back to HEIC format when original was HEIC', () => {
      const blob = new Blob(['processed-pixels'], { type: 'image/jpeg' });
      const out = formatOutputForExport(blob, 'IMG_9999.HEIC', 'heic');

      expect(out.exportFilename).toBe('IMG_9999-purecut.heic');
      expect(out.mimeType).toBe('image/heic');
      expect(out.exportBlob.type).toBe('image/heic');
    });

    it('packages output back to DNG / RAW format when original was RAW', () => {
      const blob = new Blob(['processed-pixels'], { type: 'image/jpeg' });
      const out = formatOutputForExport(blob, 'proraw_studio.dng', 'dng');

      expect(out.exportFilename).toBe('proraw_studio-purecut.dng');
      expect(out.mimeType).toBe('image/x-dng');
      expect(out.exportBlob.type).toBe('image/x-dng');
    });

    it('produces standard PNG/JPG when original was standard', () => {
      const pngBlob = new Blob(['png-bytes'], { type: 'image/png' });
      const out = formatOutputForExport(pngBlob, 'logo.png', null);

      expect(out.exportFilename).toBe('logo-purecut.png');
      expect(out.mimeType).toBe('image/png');
    });
  });
});
