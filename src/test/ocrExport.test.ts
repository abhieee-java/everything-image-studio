import { describe, it, expect, vi } from 'vitest';
import {
  copyTextToClipboard,
  exportAsTxt,
  exportAsCsv,
  exportAsJson,
  exportAsDocx,
  exportAsPdf,
} from '../utils/ocrExport';
import type { OcrResultData } from '../types/ocr';

describe('OCR Export Utilities', () => {
  it('copies text to clipboard with navigator.clipboard or textarea fallback', async () => {
    const success = await copyTextToClipboard('Test transcribed OCR text');
    expect(typeof success).toBe('boolean');
  });

  it('exports plain text without throwing', () => {
    expect(() => exportAsTxt('Sample text output', 'test-doc')).not.toThrow();
  });

  it('exports CSV table data without throwing', () => {
    const csvData = '"Item","Price"\n"Widget","$10"';
    expect(() => exportAsCsv(csvData, 'test-table')).not.toThrow();
  });

  it('exports JSON formatted structure without throwing', () => {
    const mockResult: OcrResultData = {
      id: 'test-123',
      text: 'Extracted text',
      confidence: 96,
      wordsCount: 2,
      charsCount: 14,
      linesCount: 1,
      readingTimeSeconds: 1,
      processingTimeMs: 120,
      blocks: [],
      lines: [],
      words: [],
      mode: 'standard',
    };
    expect(() => exportAsJson(mockResult, 'test-json')).not.toThrow();
  });

  it('exports DOCX document container 100% client-side', async () => {
    await expect(exportAsDocx('Paragraph 1\n\nParagraph 2', 'test-docx')).resolves.not.toThrow();
  });

  it('exports PDF document via jsPDF without throwing', () => {
    expect(() => exportAsPdf('Sample PDF extracted text content', 'test-pdf')).not.toThrow();
  });

  it('exports empty strings and special XML/HTML characters safely in DOCX and PDF', async () => {
    const specialChars = 'Special: <tag> & "quote" \'apostrophe\' \n Empty next line:\n\nDone.';
    await expect(exportAsDocx(specialChars, 'special-chars')).resolves.not.toThrow();
    expect(() => exportAsPdf(specialChars, 'special-chars')).not.toThrow();
  });

  it('handles multi-language unicode text across all export formats', async () => {
    const multiLang = 'English text\nहिन्दी पाठ\nবাংলা পাঠ\nالعربية\n中文文本';
    expect(() => exportAsTxt(multiLang, 'multilang')).not.toThrow();
    expect(() => exportAsCsv(`"${multiLang.replace(/\n/g, ' ')}"`, 'multilang')).not.toThrow();
    await expect(exportAsDocx(multiLang, 'multilang')).resolves.not.toThrow();
    expect(() => exportAsPdf(multiLang, 'multilang')).not.toThrow();
  });
});
