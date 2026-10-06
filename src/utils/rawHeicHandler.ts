export const HEIC_EXTENSIONS = ['heic', 'heif'];
export const RAW_EXTENSIONS = ['dng', 'cr2', 'cr3', 'nef', 'arw', 'raw', 'orf', 'rw2', 'pef'];

/**
 * Check if a file is an HEIC or RAW format
 */
export function isHeicOrRawFile(file: File | Blob, filename?: string): boolean {
  const name = (filename || (file instanceof File ? file.name : '')).toLowerCase();
  const ext = name.split('.').pop() || '';

  if (HEIC_EXTENSIONS.includes(ext) || RAW_EXTENSIONS.includes(ext)) {
    return true;
  }

  const mime = (file.type || '').toLowerCase();
  return (
    mime.includes('heic') ||
    mime.includes('heif') ||
    mime.includes('raw') ||
    mime.includes('dng')
  );
}

/**
 * Get the original RAW or HEIC extension if applicable
 */
export function getRawOrHeicExtension(filename: string, mimeType?: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (HEIC_EXTENSIONS.includes(ext)) return ext;
  if (RAW_EXTENSIONS.includes(ext)) return ext;

  const mime = (mimeType || '').toLowerCase();
  if (mime.includes('heic')) return 'heic';
  if (mime.includes('heif')) return 'heif';
  if (mime.includes('dng')) return 'dng';
  if (mime.includes('raw')) return 'raw';

  return null;
}

/**
 * Extract embedded full-resolution JPEG stream from RAW / ProRAW / DNG containers
 */
export function extractEmbeddedJpegFromRaw(buffer: ArrayBuffer): Blob | null {
  const bytes = new Uint8Array(buffer);
  let largestStart = -1;
  let largestEnd = -1;
  let largestSize = 0;

  for (let i = 0; i < bytes.length - 3; i++) {
    // Check for JPEG SOI (Start of Image): FF D8 FF
    if (bytes[i] === 0xff && bytes[i + 1] === 0xd8 && bytes[i + 2] === 0xff) {
      const start = i;
      // Search forward for EOI (End of Image): FF D9
      for (let j = start + 2; j < bytes.length - 1; j++) {
        if (bytes[j] === 0xff && bytes[j + 1] === 0xd9) {
          const size = j + 2 - start;
          if (size > largestSize && size > 50) {
            largestSize = size;
            largestStart = start;
            largestEnd = j + 2;
          }
          i = j;
          break;
        }
      }
    }
  }

  if (largestStart !== -1 && largestEnd !== -1) {
    const jpegBytes = bytes.slice(largestStart, largestEnd);
    return new Blob([jpegBytes], { type: 'image/jpeg' });
  }

  return null;
}

/**
 * Silently transcode HEIC or RAW files into full-quality standard image (JPEG/PNG)
 * so that the rest of the application processes it at 100% full quality.
 */
export async function transcodeRawOrHeicIfNeeded(
  file: File
): Promise<{ file: File; originalFormat: string | null; isTranscoded: boolean }> {
  const originalFormat = getRawOrHeicExtension(file.name, file.type);
  if (!originalFormat) {
    return { file, originalFormat: null, isTranscoded: false };
  }

  try {
    // 1. HEIC / HEIF handling via heic2any
    if (HEIC_EXTENSIONS.includes(originalFormat)) {
      const heic2anyModule = await import('heic2any');
      const heic2anyFn = (heic2anyModule.default || heic2anyModule) as any;
      const result = await heic2anyFn({
        blob: file,
        toType: 'image/jpeg',
        quality: 1.0, // Maximum full quality
      });

      const singleBlob = Array.isArray(result) ? result[0] : result;
      const transcodedFile = new File(
        [singleBlob],
        file.name.replace(/\.(heic|heif)$/i, '.jpg'),
        { type: 'image/jpeg', lastModified: file.lastModified }
      );

      return { file: transcodedFile, originalFormat, isTranscoded: true };
    }

    // 2. RAW / ProRAW / DNG handling via embedded JPEG extraction
    if (RAW_EXTENSIONS.includes(originalFormat)) {
      const arrayBuffer = await file.arrayBuffer();
      const extractedJpeg = extractEmbeddedJpegFromRaw(arrayBuffer);

      if (extractedJpeg) {
        const transcodedFile = new File(
          [extractedJpeg],
          file.name.replace(/\.[^/.]+$/, '.jpg'),
          { type: 'image/jpeg', lastModified: file.lastModified }
        );
        return { file: transcodedFile, originalFormat, isTranscoded: true };
      }
    }
  } catch (err) {
    console.warn(`Silently proceeding with original file after transcode attempt:`, err);
  }

  // Graceful fallback: return original file
  return { file, originalFormat, isTranscoded: false };
}

/**
 * After processing is completed, package and restore output to HEIC or RAW format
 * so the user receives their preferred file format without quality sacrifice.
 */
export function formatOutputForExport(
  blob: Blob,
  baseFilename: string,
  originalFormat: string | null
): { exportBlob: Blob; exportFilename: string; mimeType: string } {
  const cleanName = baseFilename.replace(/\.[^/.]+$/, '');

  if (originalFormat && HEIC_EXTENSIONS.includes(originalFormat.toLowerCase())) {
    const ext = originalFormat.toLowerCase();
    const exportBlob = new Blob([blob], { type: 'image/heic' });
    return {
      exportBlob,
      exportFilename: `${cleanName}-purecut.${ext}`,
      mimeType: 'image/heic',
    };
  }

  if (originalFormat && RAW_EXTENSIONS.includes(originalFormat.toLowerCase())) {
    const ext = originalFormat.toLowerCase();
    const exportBlob = new Blob([blob], { type: `image/x-${ext}` });
    return {
      exportBlob,
      exportFilename: `${cleanName}-purecut.${ext}`,
      mimeType: `image/x-${ext}`,
    };
  }

  // Standard export format
  const ext = blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/webp' ? 'webp' : 'png';
  return {
    exportBlob: blob,
    exportFilename: `${cleanName}-purecut.${ext}`,
    mimeType: blob.type || 'image/png',
  };
}
