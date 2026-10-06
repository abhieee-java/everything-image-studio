import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OcrTool } from '../components/OcrTool';
import { OcrResultWorkspace } from '../components/OcrResultWorkspace';
import { OcrSeoContent } from '../components/OcrSeoContent';
import { CameraModal } from '../components/CameraModal';
import { DEFAULT_PREPROCESSING_SETTINGS } from '../utils/ocrPreprocessing';
import { getRouteConfig } from '../utils/ocrRoutes';
import type { ImageDataItem, OcrResultData } from '../types';

const mockImage: ImageDataItem = {
  id: 'img-1',
  file: new File(['fake'], 'sample-doc.png', { type: 'image/png' }),
  name: 'sample-doc.png',
  originalSize: 524288,
  originalWidth: 1200,
  originalHeight: 800,
  originalType: 'image/png',
  previewUrl: 'blob:fake-url',
  aspectRatio: 1200 / 800,
};

const mockOcrResult: OcrResultData = {
  id: 'ocr-res-1',
  text: 'The quick brown fox jumps over the lazy dog.',
  confidence: 96,
  wordsCount: 9,
  charsCount: 44,
  linesCount: 1,
  readingTimeSeconds: 3,
  processingTimeMs: 350,
  blocks: [
    {
      text: 'The quick brown fox jumps over the lazy dog.',
      confidence: 96,
      bbox: { x0: 20, y0: 20, x1: 400, y1: 60 },
      paragraphs: [],
    },
  ],
  lines: [],
  words: [
    { text: 'The', confidence: 98, bbox: { x0: 20, y0: 20, x1: 50, y1: 50 } },
    { text: 'quick', confidence: 97, bbox: { x0: 60, y0: 20, x1: 100, y1: 50 } },
  ],
  mode: 'standard',
};

describe('OCR Component Suite', () => {
  describe('OcrTool', () => {
    it('renders language picker, mode selector, and Run OCR button', () => {
      const onRunOcr = vi.fn();
      render(
        <OcrTool
          selectedLanguage="eng"
          onSelectLanguage={vi.fn()}
          selectedMode="standard"
          onSelectMode={vi.fn()}
          preprocessing={DEFAULT_PREPROCESSING_SETTINGS}
          onChangePreprocessing={vi.fn()}
          isProcessing={false}
          progressPercent={0}
          progressMessage=""
          onRunOcr={onRunOcr}
          hasImage={true}
        />
      );

      expect(screen.getByText(/Client-Side OCR Engine/i)).toBeInTheDocument();
      expect(screen.getByText(/Standard OCR/i)).toBeInTheDocument();
      expect(screen.getByText(/Document OCR/i)).toBeInTheDocument();
      expect(screen.getByText(/Table OCR/i)).toBeInTheDocument();
      expect(screen.getByText(/Auto Enhance/i)).toBeInTheDocument();

      const runBtn = screen.getByText(/Extract Text Directly in Browser/i);
      expect(runBtn).toBeInTheDocument();
      fireEvent.click(runBtn);
      expect(onRunOcr).toHaveBeenCalled();
    });

    it('switches modes when clicked', () => {
      const onSelectMode = vi.fn();
      render(
        <OcrTool
          selectedLanguage="eng"
          onSelectLanguage={vi.fn()}
          selectedMode="standard"
          onSelectMode={onSelectMode}
          preprocessing={DEFAULT_PREPROCESSING_SETTINGS}
          onChangePreprocessing={vi.fn()}
          isProcessing={false}
          progressPercent={0}
          progressMessage=""
          onRunOcr={vi.fn()}
          hasImage={true}
        />
      );

      fireEvent.click(screen.getByText(/Screenshot OCR/i));
      expect(onSelectMode).toHaveBeenCalledWith('screenshot');
    });
  });

  describe('OcrResultWorkspace', () => {
    it('renders image on left and extracted text editor on right', () => {
      render(
        <OcrResultWorkspace
          originalImage={mockImage}
          ocrResult={mockOcrResult}
          isProcessing={false}
        />
      );

      expect(screen.getByText(/sample-doc.png/i)).toBeInTheDocument();
      expect(screen.getByText(/96% Accuracy Rating/i)).toBeInTheDocument();
      expect(screen.getByText(/Extracted Text/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/The quick brown fox/i)).toBeInTheDocument();
      expect(screen.getByText(/9 words/i)).toBeInTheDocument();
    });

    it('renders export buttons for TXT, Word, PDF, and JSON', () => {
      render(
        <OcrResultWorkspace
          originalImage={mockImage}
          ocrResult={mockOcrResult}
          isProcessing={false}
        />
      );

      expect(screen.getByText('TXT')).toBeInTheDocument();
      expect(screen.getByText('Word (.docx)')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.getByText('JSON')).toBeInTheDocument();
    });
  });

  describe('OcrSeoContent', () => {
    it('renders H1, features, how-it-works, FAQs, and related links', () => {
      const routeConfig = getRouteConfig('/hindi-ocr');
      const onNavigate = vi.fn();

      render(
        <OcrSeoContent
          routeConfig={routeConfig}
          onNavigateRoute={onNavigate}
        />
      );

      expect(screen.getByText(/What is Image to Text OCR\?/i)).toBeInTheDocument();
      expect(screen.getByText(/How to Extract Text from an Image/i)).toBeInTheDocument();
      expect(screen.getByText(/Supported Formats & Languages/i)).toBeInTheDocument();
      expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
      expect(screen.getByText(/Related Document & Image Tools/i)).toBeInTheDocument();
    });
  });

  describe('CameraModal', () => {
    it('renders modal when open and handles close action', () => {
      const onClose = vi.fn();
      render(
        <CameraModal
          isOpen={true}
          onClose={onClose}
          onCapture={vi.fn()}
        />
      );

      expect(screen.getByText(/Document Camera Capture/i)).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText(/Close camera/i));
      expect(onClose).toHaveBeenCalled();
    });

    it('closes on Escape key press', () => {
      const onClose = vi.fn();
      render(
        <CameraModal
          isOpen={true}
          onClose={onClose}
          onCapture={vi.fn()}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('OcrTool Concurrency & Cancellation', () => {
    it('shows Cancel button when processing and invokes onCancelOcr', () => {
      const onCancelOcr = vi.fn();
      render(
        <OcrTool
          selectedLanguage="eng"
          onSelectLanguage={vi.fn()}
          selectedMode="standard"
          onSelectMode={vi.fn()}
          preprocessing={DEFAULT_PREPROCESSING_SETTINGS}
          onChangePreprocessing={vi.fn()}
          isProcessing={true}
          progressPercent={45}
          progressMessage="Recognizing characters..."
          onRunOcr={vi.fn()}
          onCancelOcr={onCancelOcr}
          hasImage={true}
        />
      );

      expect(screen.getByText(/Recognizing characters\.\.\./i)).toBeInTheDocument();
      expect(screen.getByText(/45%/i)).toBeInTheDocument();
      const cancelBtn = screen.getByLabelText(/Cancel OCR extraction/i);
      expect(cancelBtn).toBeInTheDocument();
      fireEvent.click(cancelBtn);
      expect(onCancelOcr).toHaveBeenCalledTimes(1);
    });
  });

  describe('OcrResultWorkspace Edits', () => {
    it('invokes onUpdateResult when user edits text in textarea', () => {
      const onUpdateResult = vi.fn();
      render(
        <OcrResultWorkspace
          originalImage={mockImage}
          ocrResult={mockOcrResult}
          isProcessing={false}
          onUpdateResult={onUpdateResult}
        />
      );

      const textarea = screen.getByLabelText(/Extracted OCR text editor/i);
      fireEvent.change(textarea, { target: { value: 'Edited OCR line.' } });
      expect(onUpdateResult).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Edited OCR line.',
          wordsCount: 3,
        })
      );
    });
  });
});
