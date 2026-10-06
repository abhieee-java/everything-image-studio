export type OcrMode = 'standard' | 'document' | 'screenshot' | 'table' | 'handwriting';

export type OcrProgressCallback = (status: {
  status: string;
  progress: number;
  message: string;
}) => void;

export interface OcrLanguage {
  code: string;
  name: string;
  nativeName: string;
  category: 'Popular' | 'South Asian' | 'European' | 'East Asian' | 'Middle Eastern' | 'Other';
  script?: string;
}

export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface OcrWord {
  text: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface OcrLine {
  text: string;
  confidence: number;
  bbox: BoundingBox;
  words: OcrWord[];
}

export interface OcrParagraph {
  text: string;
  confidence: number;
  bbox: BoundingBox;
  lines: OcrLine[];
}

export interface OcrBlock {
  text: string;
  confidence: number;
  bbox: BoundingBox;
  paragraphs: OcrParagraph[];
}

export interface TableCell {
  row: number;
  col: number;
  text: string;
  confidence: number;
}

export interface TableStructure {
  rowCount: number;
  colCount: number;
  rows: string[][];
  csv: string;
}

export interface OcrResultData {
  id: string;
  text: string;
  confidence: number;
  wordsCount: number;
  charsCount: number;
  linesCount: number;
  readingTimeSeconds: number;
  processingTimeMs: number;
  blocks: OcrBlock[];
  lines: OcrLine[];
  words: OcrWord[];
  tableData?: TableStructure | null;
  detectedLanguage?: string;
  mode: OcrMode;
}

export interface OcrPreprocessingSettings {
  autoEnhance: boolean;
  grayscale: boolean;
  contrast: number; // -100 to 100
  brightness: number; // -100 to 100
  sharpen: boolean;
  binarize: boolean;
  threshold: number; // 0 to 255 (0 = auto Otsu)
  deskew: boolean;
  invert: boolean;
  denoise: boolean;
  rotation: number; // 0, 90, 180, 270
}

export interface OcrBatchItem {
  id: string;
  file: File;
  name: string;
  previewUrl: string;
  size: number;
  width: number;
  height: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  progressMessage: string;
  result?: OcrResultData;
  error?: string;
}

export interface OcrRouteConfig {
  path: string;
  title: string;
  metaDescription: string;
  h1: string;
  subheading: string;
  defaultMode: OcrMode;
  defaultLanguage: string;
  canonicalPath: string;
  features: { title: string; desc: string; icon: string }[];
  howItWorksSteps: { step: number; title: string; desc: string }[];
  faqs: { question: string; answer: string }[];
  introMarkdown: string;
  bestPractices: string[];
}
