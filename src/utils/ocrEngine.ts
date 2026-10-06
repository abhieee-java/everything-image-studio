import { createWorker, type Worker } from 'tesseract.js';
import type {
  OcrMode,
  OcrProgressCallback,
  OcrResultData,
  TableStructure,
  OcrLine,
  OcrWord,
  OcrBlock,
  OcrParagraph,
} from '../types/ocr';

let activeWorker: Worker | null = null;
let currentLoadedLanguage: string = '';
let workerInitPromise: Promise<Worker> | null = null;

/**
 * Terminate active worker to free browser memory
 */
export async function terminateOcrWorker(): Promise<void> {
  if (workerInitPromise) {
    try {
      const pendingWorker = await workerInitPromise;
      await pendingWorker.terminate();
    } catch {
      // Ignore cleanup error
    }
    workerInitPromise = null;
  }

  if (activeWorker) {
    try {
      await activeWorker.terminate();
    } catch {
      // Ignore cleanup error
    }
    activeWorker = null;
    currentLoadedLanguage = '';
  }
}

/**
 * Initialize or reuse Tesseract Web Worker with requested language
 */
export async function getOcrWorker(
  language: string,
  onProgress?: OcrProgressCallback
): Promise<Worker> {
  const targetLang = language.trim() || 'eng';

  // If worker exists and language matches, return cached worker
  if (activeWorker && currentLoadedLanguage === targetLang) {
    return activeWorker;
  }

  // If initialization for targetLang is already in progress, reuse promise
  if (workerInitPromise && currentLoadedLanguage === targetLang) {
    return workerInitPromise;
  }

  // If worker exists with different language or another language is loading, terminate first
  if (activeWorker || workerInitPromise) {
    await terminateOcrWorker();
  }

  onProgress?.({
    status: 'loading-core',
    progress: 10,
    message: 'Loading OCR engine...',
  });

  currentLoadedLanguage = targetLang;
  workerInitPromise = (async () => {
    try {
      const worker = await createWorker(targetLang, 1, {
        logger: (m) => {
          let progress = 20;
          let message = 'Processing...';

          if (m.status === 'loading tesseract core') {
            progress = 15;
            message = 'Loading WebAssembly OCR core...';
          } else if (m.status === 'loaded tesseract core') {
            progress = 25;
            message = 'WASM OCR core ready';
          } else if (m.status === 'loading language traineddata') {
            progress = Math.min(60, Math.round(25 + (m.progress || 0) * 35));
            message = `Loading language model (${targetLang})...`;
          } else if (m.status === 'loaded language traineddata') {
            progress = 65;
            message = 'Language model loaded';
          } else if (m.status === 'initializing api') {
            progress = 70;
            message = 'Initializing OCR recognizer...';
          } else if (m.status === 'initialized api') {
            progress = 75;
            message = 'Recognizer ready';
          } else if (m.status === 'recognizing text') {
            progress = Math.min(98, Math.round(75 + (m.progress || 0) * 23));
            message = `Recognizing text (${Math.round((m.progress || 0) * 100)}%)...`;
          }

          onProgress?.({
            status: m.status,
            progress,
            message,
          });
        },
      });

      activeWorker = worker;
      return worker;
    } catch (err) {
      activeWorker = null;
      currentLoadedLanguage = '';
      throw err;
    } finally {
      workerInitPromise = null;
    }
  })();

  return workerInitPromise;
}

/**
 * Detect structured tabular data from word bounding boxes
 */
export function detectTableFromWords(words: OcrWord[]): TableStructure | null {
  if (!words || words.length < 4) return null;

  // Filter out noisy single-character symbols with low confidence
  const validWords = words.filter((w) => w.text.trim().length > 0);
  if (validWords.length < 4) return null;

  // Step 1: Cluster words into rows based on vertical proximity
  const getY0 = (w: OcrWord) => (Number.isFinite(w.bbox?.y0) ? w.bbox.y0 : 0);
  const getY1 = (w: OcrWord) => (Number.isFinite(w.bbox?.y1) ? w.bbox.y1 : getY0(w) + 10);
  const getX0 = (w: OcrWord) => (Number.isFinite(w.bbox?.x0) ? w.bbox.x0 : 0);

  const sortedByY = [...validWords].sort((a, b) => getY0(a) - getY0(b));
  const rows: OcrWord[][] = [];

  for (const word of sortedByY) {
    const wordYCenter = (getY0(word) + getY1(word)) / 2;
    const wordHeight = Math.max(1, getY1(word) - getY0(word));
    const tolerance = Math.max(8, wordHeight * 0.6);

    let foundRow = false;
    for (const row of rows) {
      const rowYCenters = row.map((w) => (getY0(w) + getY1(w)) / 2);
      const rowAvgY = rowYCenters.reduce((sum, v) => sum + v, 0) / row.length;

      if (Math.abs(wordYCenter - rowAvgY) <= tolerance) {
        row.push(word);
        foundRow = true;
        break;
      }
    }

    if (!foundRow) {
      rows.push([word]);
    }
  }

  // Need at least 2 rows for a table
  if (rows.length < 2) return null;

  // Sort words in each row from left to right
  for (const row of rows) {
    row.sort((a, b) => getX0(a) - getX0(b));
  }

  // Step 2: Determine column boundaries using x0 centroids
  const xCoords: number[] = [];
  for (const row of rows) {
    for (const w of row) {
      xCoords.push(getX0(w));
    }
  }
  xCoords.sort((a, b) => a - b);

  // Group x coordinates that are close together into column slots
  const colSlots: number[] = [];
  for (const x of xCoords) {
    const matchedSlot = colSlots.find((slot) => Math.abs(slot - x) < 35);
    if (matchedSlot === undefined) {
      colSlots.push(x);
    }
  }
  colSlots.sort((a, b) => a - b);

  if (colSlots.length < 2) return null;

  // Step 3: Populate grid
  const gridRows: string[][] = [];
  for (const row of rows) {
    const rowCells = new Array(colSlots.length).fill('');
    for (const word of row) {
      // Find closest column slot
      let bestColIdx = 0;
      let minDiff = Infinity;
      for (let c = 0; c < colSlots.length; c++) {
        const diff = Math.abs(colSlots[c] - getX0(word));
        if (diff < minDiff) {
          minDiff = diff;
          bestColIdx = c;
        }
      }
      rowCells[bestColIdx] = (rowCells[bestColIdx] ? `${rowCells[bestColIdx]} ` : '') + word.text;
    }
    gridRows.push(rowCells);
  }

  // Step 4: Generate CSV string
  const csvLines = gridRows.map((r) =>
    r
      .map((cell) => {
        const escaped = cell.replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(',')
  );

  return {
    rowCount: gridRows.length,
    colCount: colSlots.length,
    rows: gridRows,
    csv: csvLines.join('\n'),
  };
}

/**
 * Run OCR recognition on an image canvas or URL
 */
export async function recognizeImage(
  imageSource: HTMLCanvasElement | HTMLImageElement | string,
  options: {
    language: string;
    mode: OcrMode;
    onProgress?: OcrProgressCallback;
  }
): Promise<OcrResultData> {
  const startTime = performance.now();
  const { language, mode, onProgress } = options;

  const worker = await getOcrWorker(language, onProgress);

  onProgress?.({
    status: 'recognizing',
    progress: 80,
    message: 'Analyzing page layout and extracting characters...',
  });

  const recogResult = await worker.recognize(imageSource);
  const data = recogResult.data;

  // Extract structured spatial objects
  const rawWords: OcrWord[] = [];
  const rawLines: OcrLine[] = [];
  const rawBlocks: OcrBlock[] = [];

  if (data.blocks && data.blocks.length > 0) {
    for (const b of data.blocks) {
      const blockParagraphs: OcrParagraph[] = [];
      if (b.paragraphs) {
        for (const p of b.paragraphs) {
          const paraLines: OcrLine[] = [];
          if (p.lines) {
            for (const l of p.lines) {
              const lineWords: OcrWord[] = [];
              if (l.words) {
                for (const w of l.words) {
                  const wordObj: OcrWord = {
                    text: w.text,
                    confidence: Math.round(w.confidence || 0),
                    bbox: {
                      x0: w.bbox.x0,
                      y0: w.bbox.y0,
                      x1: w.bbox.x1,
                      y1: w.bbox.y1,
                    },
                  };
                  lineWords.push(wordObj);
                  rawWords.push(wordObj);
                }
              }

              const lineObj: OcrLine = {
                text: l.text,
                confidence: Math.round(l.confidence || 0),
                bbox: {
                  x0: l.bbox.x0,
                  y0: l.bbox.y0,
                  x1: l.bbox.x1,
                  y1: l.bbox.y1,
                },
                words: lineWords,
              };
              paraLines.push(lineObj);
              rawLines.push(lineObj);
            }
          }

          blockParagraphs.push({
            text: p.text,
            confidence: Math.round(p.confidence || 0),
            bbox: {
              x0: p.bbox.x0,
              y0: p.bbox.y0,
              x1: p.bbox.x1,
              y1: p.bbox.y1,
            },
            lines: paraLines,
          });
        }
      }

      rawBlocks.push({
        text: b.text,
        confidence: Math.round(b.confidence || 0),
        bbox: {
          x0: b.bbox.x0,
          y0: b.bbox.y0,
          x1: b.bbox.x1,
          y1: b.bbox.y1,
        },
        paragraphs: blockParagraphs,
      });
    }
  }

  // Detect table if in table mode or if spatial rows indicate table
  let tableData: TableStructure | null = null;
  if (mode === 'table' || rawWords.length >= 6) {
    tableData = detectTableFromWords(rawWords);
  }

  // Format clean text
  const cleanText = data.text.trim();
  const wordsCount = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
  const charsCount = cleanText.length;
  const linesCount = cleanText ? cleanText.split('\n').filter(Boolean).length : 0;
  const readingTimeSeconds = Math.max(1, Math.round((wordsCount / 200) * 60));
  const processingTimeMs = Math.round(performance.now() - startTime);

  onProgress?.({
    status: 'complete',
    progress: 100,
    message: 'Text extraction complete!',
  });

  return {
    id: `ocr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text: cleanText,
    confidence: Math.round(data.confidence || 0),
    wordsCount,
    charsCount,
    linesCount,
    readingTimeSeconds,
    processingTimeMs,
    blocks: rawBlocks,
    lines: rawLines,
    words: rawWords,
    tableData,
    detectedLanguage: language,
    mode,
  };
}
