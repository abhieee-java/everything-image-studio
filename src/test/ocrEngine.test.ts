import { describe, it, expect } from 'vitest';
import { OCR_LANGUAGES, getLanguageByCode, searchLanguages } from '../utils/ocrLanguages';
import { detectTableFromWords } from '../utils/ocrEngine';
import type { OcrWord } from '../types/ocr';

describe('OCR Languages & Models', () => {
  it('contains all required major languages', () => {
    const codes = OCR_LANGUAGES.map((l) => l.code);
    expect(codes).toContain('eng'); // English
    expect(codes).toContain('hin'); // Hindi
    expect(codes).toContain('ben'); // Bengali
    expect(codes).toContain('asm'); // Assamese
    expect(codes).toContain('spa'); // Spanish
    expect(codes).toContain('fra'); // French
    expect(codes).toContain('deu'); // German
    expect(codes).toContain('ara'); // Arabic
    expect(codes).toContain('chi_sim'); // Chinese
    expect(codes).toContain('jpn'); // Japanese
    expect(codes).toContain('kor'); // Korean
    expect(codes).toContain('rus'); // Russian
  });

  it('retrieves language by code', () => {
    const hindi = getLanguageByCode('hin');
    expect(hindi).toBeDefined();
    expect(hindi?.name).toBe('Hindi');
    expect(hindi?.nativeName).toBe('हिन्दी');
    expect(hindi?.category).toBe('Popular');

    const bengali = getLanguageByCode('ben');
    expect(bengali).toBeDefined();
    expect(bengali?.name).toBe('Bengali');
    expect(bengali?.nativeName).toBe('বাংলা');

    const assamese = getLanguageByCode('asm');
    expect(assamese).toBeDefined();
    expect(assamese?.name).toBe('Assamese');
    expect(assamese?.nativeName).toBe('অসমীয়া');
  });

  it('searches languages by query', () => {
    const searchEng = searchLanguages('eng');
    expect(searchEng.some((l) => l.code === 'eng')).toBe(true);

    const searchHindi = searchLanguages('hindi');
    expect(searchHindi.some((l) => l.code === 'hin')).toBe(true);

    const searchDevanagari = searchLanguages('devanagari');
    expect(searchDevanagari.some((l) => l.code === 'hin' || l.code === 'mar')).toBe(true);
  });
});

describe('Table Detection Algorithm', () => {
  it('detects structured table rows and columns from word bounding boxes', () => {
    // 2 rows x 3 columns of words
    const mockWords: OcrWord[] = [
      // Row 1 (y around 100)
      { text: 'Item', confidence: 95, bbox: { x0: 50, y0: 95, x1: 100, y1: 115 } },
      { text: 'Qty', confidence: 92, bbox: { x0: 200, y0: 96, x1: 240, y1: 116 } },
      { text: 'Price', confidence: 98, bbox: { x0: 350, y0: 94, x1: 400, y1: 114 } },

      // Row 2 (y around 160)
      { text: 'Widget', confidence: 90, bbox: { x0: 50, y0: 155, x1: 110, y1: 175 } },
      { text: '5', confidence: 99, bbox: { x0: 200, y0: 156, x1: 215, y1: 176 } },
      { text: '$25.00', confidence: 94, bbox: { x0: 350, y0: 154, x1: 410, y1: 174 } },
    ];

    const table = detectTableFromWords(mockWords);
    expect(table).not.toBeNull();
    expect(table?.rowCount).toBe(2);
    expect(table?.colCount).toBeGreaterThanOrEqual(2);
    expect(table?.csv).toContain('Item');
    expect(table?.csv).toContain('$25.00');
  });

  it('returns null for insufficient words or non-tabular layout', () => {
    const sparseWords: OcrWord[] = [
      { text: 'Hello', confidence: 90, bbox: { x0: 10, y0: 10, x1: 50, y1: 30 } },
      { text: 'World', confidence: 90, bbox: { x0: 60, y0: 10, x1: 100, y1: 30 } },
    ];

    const result = detectTableFromWords(sparseWords);
    expect(result).toBeNull();
  });

  it('handles words with NaN or missing bbox coordinates gracefully in detectTableFromWords', () => {
    const invalidWords: OcrWord[] = [
      { text: 'A', confidence: 90, bbox: { x0: NaN, y0: NaN, x1: NaN, y1: NaN } },
      { text: 'B', confidence: 90, bbox: { x0: 10, y0: 10, x1: 20, y1: 20 } },
      { text: 'C', confidence: 90, bbox: { x0: -50, y0: 10, x1: -10, y1: 20 } },
      { text: 'D', confidence: 90, bbox: { x0: 100, y0: 50, x1: 120, y1: 60 } },
    ];

    expect(() => detectTableFromWords(invalidWords)).not.toThrow();
  });
});
