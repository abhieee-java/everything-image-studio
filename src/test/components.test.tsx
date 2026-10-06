import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '../components/Navbar';
import { ToolBar } from '../components/ToolBar';
import { DropZone } from '../components/DropZone';
import { CompressorTool } from '../components/CompressorTool';
import { ConverterTool } from '../components/ConverterTool';
import { ResizerTool } from '../components/ResizerTool';
import { WatermarkerTool } from '../components/WatermarkerTool';
import { AdjustTool } from '../components/AdjustTool';
import { BatchExportModal } from '../components/BatchExportModal';
import { PreviewCanvas } from '../components/PreviewCanvas';
import type { ImageDataItem, ProcessedResult } from '../types';

const mockImage: ImageDataItem = {
  id: 'test-1',
  file: new File(['mock'], 'test.png', { type: 'image/png' }),
  name: 'test.png',
  originalSize: 1048576, // 1MB
  originalWidth: 1920,
  originalHeight: 1080,
  originalType: 'image/png',
  previewUrl: 'blob:mock-url',
  aspectRatio: 1920 / 1080,
};

const mockProcessed: ProcessedResult = {
  id: 'test-1',
  blob: new Blob(['mock'], { type: 'image/webp' }),
  dataUrl: 'blob:mock-processed-url',
  size: 314572, // ~300KB
  width: 1920,
  height: 1080,
  format: 'image/webp',
  filename: 'test-compress.webp',
  processingTimeMs: 42,
};

describe('Component Suite', () => {
  describe('Navbar', () => {
    it('renders studio title and privacy badge', () => {
      render(
        <Navbar
          imageCount={0}
          onClearAll={vi.fn()}
          onLoadSamples={vi.fn()}
          onOpenBatch={vi.fn()}
        />
      );
      expect(screen.getByText(/Everything/i)).toBeInTheDocument();
      expect(screen.getByText(/Image Studio/i)).toBeInTheDocument();
      expect(screen.getByText(/100% Private/i)).toBeInTheDocument();
      expect(screen.getByText(/Load Sample Photos/i)).toBeInTheDocument();
    });

    it('shows batch process button when images are present', () => {
      const onOpenBatch = vi.fn();
      render(
        <Navbar
          imageCount={3}
          onClearAll={vi.fn()}
          onLoadSamples={vi.fn()}
          onOpenBatch={onOpenBatch}
        />
      );
      const batchBtn = screen.getByText(/Batch Process \(3\)/i);
      expect(batchBtn).toBeInTheDocument();
      fireEvent.click(batchBtn);
      expect(onOpenBatch).toHaveBeenCalled();
    });
  });

  describe('ToolBar', () => {
    it('renders all tool options and fires tab switch', () => {
      const onSelectTab = vi.fn();
      render(<ToolBar activeTab="compress" onSelectTab={onSelectTab} />);

      expect(screen.getByText(/The Compressor/i)).toBeInTheDocument();
      expect(screen.getByText(/The Converter/i)).toBeInTheDocument();
      expect(screen.getByText(/The Resizer/i)).toBeInTheDocument();
      expect(screen.getByText(/The Watermarker/i)).toBeInTheDocument();
      expect(screen.getByText(/Enhance & Adjust/i)).toBeInTheDocument();

      fireEvent.click(screen.getByText(/The Converter/i));
      expect(onSelectTab).toHaveBeenCalledWith('convert');
    });
  });

  describe('DropZone', () => {
    it('renders hero instructions and drag-and-drop zone', () => {
      const onFiles = vi.fn();
      const onSamples = vi.fn();
      render(<DropZone onFilesSelected={onFiles} onLoadSamples={onSamples} />);

      expect(screen.getByText(/Drag & Drop your images here/i)).toBeInTheDocument();
      expect(screen.getByText(/Load High-Res Sample Images/i)).toBeInTheDocument();

      fireEvent.click(screen.getByText(/Load High-Res Sample Images/i));
      expect(onSamples).toHaveBeenCalled();
    });
  });

  describe('CompressorTool', () => {
    it('renders quality slider, presets, and before/after estimations', () => {
      const onChange = vi.fn();
      render(
        <CompressorTool
          settings={{ quality: 0.75, useWebWorker: true }}
          onChange={onChange}
          originalImage={mockImage}
          processedResult={mockProcessed}
        />
      );

      expect(screen.getByText(/The Compressor/i)).toBeInTheDocument();
      expect(screen.getByText(/1 MB/i)).toBeInTheDocument();
      expect(screen.getByText(/307.2 KB/i)).toBeInTheDocument();
      expect(screen.getByText(/Max Savings/i)).toBeInTheDocument();

      fireEvent.click(screen.getByText(/Max Savings/i));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ quality: 0.4 })
      );
    });
  });

  describe('ConverterTool', () => {
    it('renders format selector and switches formats', () => {
      const onChange = vi.fn();
      render(
        <ConverterTool
          settings={{ targetFormat: 'image/webp', quality: 0.85, backgroundColor: '#FFFFFF' }}
          onChange={onChange}
          totalImages={1}
          onOpenBatch={vi.fn()}
        />
      );

      expect(screen.getByText(/The Converter/i)).toBeInTheDocument();
      expect(screen.getByText(/WebP/i)).toBeInTheDocument();
      expect(screen.getByText(/JPEG \/ JPG/i)).toBeInTheDocument();
      expect(screen.getByText(/PNG/i)).toBeInTheDocument();

      fireEvent.click(screen.getByText(/PNG/i));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ targetFormat: 'image/png' })
      );
    });
  });

  describe('ResizerTool', () => {
    it('handles width/height inputs, aspect ratio toggling, and presets', () => {
      const onChange = vi.fn();
      render(
        <ResizerTool
          settings={{
            width: 1920,
            height: 1080,
            maintainAspectRatio: true,
            scalePercent: 100,
            resampleMode: 'canvas',
          }}
          onChange={onChange}
          originalImage={mockImage}
        />
      );

      expect(screen.getByText(/The Resizer/i)).toBeInTheDocument();
      expect(screen.getByText(/Aspect Locked/i)).toBeInTheDocument();

      // Click aspect ratio toggle
      fireEvent.click(screen.getByText(/Aspect Locked/i));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ maintainAspectRatio: false })
      );

      // Click 50% scale preset
      fireEvent.click(screen.getByText('50%'));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ scalePercent: 50, width: 960, height: 540 })
      );

      // Click Instagram preset
      fireEvent.click(screen.getByText(/Instagram Square/i));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ width: 1080, height: 1080 })
      );
    });
  });

  describe('WatermarkerTool', () => {
    it('handles custom text, font changes, opacity, and positioning grid', () => {
      const onChange = vi.fn();
      render(
        <WatermarkerTool
          settings={{
            type: 'text',
            text: 'Copyright 2026',
            fontFamily: 'Inter',
            fontSize: 32,
            fontWeight: '600',
            color: '#FFFFFF',
            opacity: 0.8,
            position: 'bottom-right',
            rotation: 0,
            padding: 20,
          }}
          onChange={onChange}
        />
      );

      expect(screen.getByText(/The Watermarker/i)).toBeInTheDocument();
      const input = screen.getByPlaceholderText(/e\.g\. © 2026/i);
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'New Watermark' } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'New Watermark' })
      );

      // Toggle tiled pattern
      fireEvent.click(screen.getByText(/Tiled Repeat Pattern/i));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ position: 'tiled' })
      );
    });
  });

  describe('AdjustTool', () => {
    it('handles rotate, flip, filters, and reset', () => {
      const onChange = vi.fn();
      const onReset = vi.fn();
      render(
        <AdjustTool
          settings={{
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
          }}
          onChange={onChange}
          onReset={onReset}
        />
      );

      expect(screen.getByText(/Enhance & Adjust/i)).toBeInTheDocument();

      // Rotate button
      fireEvent.click(screen.getByText(/Rotate 90°/i));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ rotate: 90 })
      );

      // Flip H button
      fireEvent.click(screen.getByText(/Flip H/i));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ flipHorizontal: true })
      );

      // Reset button
      fireEvent.click(screen.getByText(/Reset/i));
      expect(onReset).toHaveBeenCalled();
    });
  });

  describe('BatchExportModal', () => {
    it('renders batch export dialog and triggers actions', () => {
      const onStart = vi.fn();
      const onClose = vi.fn();
      render(
        <BatchExportModal
          isOpen={true}
          onClose={onClose}
          progress={{ total: 5, current: 0, currentFilename: '', isProcessing: false }}
          batchResults={[]}
          zipBlob={null}
          onStartBatch={onStart}
          toolName="The Compressor"
        />
      );

      expect(screen.getByText(/Batch Export/i)).toBeInTheDocument();
      expect(screen.getByText(/Ready to Process 5 Images/i)).toBeInTheDocument();

      fireEvent.click(screen.getByText(/Start Batch \(5\)/i));
      expect(onStart).toHaveBeenCalled();
    });
  });

  describe('PreviewCanvas', () => {
    it('renders preview with split comparison and download buttons', () => {
      render(
        <PreviewCanvas
          originalImage={mockImage}
          processedResult={mockProcessed}
          isProcessing={false}
        />
      );

      expect(screen.getByText(/Split Slider/i)).toBeInTheDocument();
      expect(screen.getByText(/Side by Side/i)).toBeInTheDocument();
      expect(screen.getByText(/Processed/i)).toBeInTheDocument();
      expect(screen.getByText(/1920 × 1080/i)).toBeInTheDocument();
      expect(screen.getByText(/WEBP/i)).toBeInTheDocument();
    });
  });
});
