import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackgroundRemoverTool } from '../components/BackgroundRemoverTool';
import { ProcessingOverlay } from '../components/ProcessingOverlay';
import { HistoryDrawer } from '../components/HistoryDrawer';
import { KeyboardShortcutsModal } from '../components/KeyboardShortcutsModal';
import { ContentSections } from '../components/ContentSections';
import { MaskEditorEngine } from '../utils/maskEditor';
import { detectSubjectBounds, processBackgroundRemoval } from '../utils/backgroundRemoval';
import { exportCompositeBlob } from '../utils/compositeRenderer';
import type { BackgroundRemovalSettings, BrushSettings, HistoryItem } from '../types';

describe('Background Removal & Flagship Features Suite', () => {
  describe('BackgroundRemoverTool', () => {
    const defaultSettings: BackgroundRemovalSettings = {
      smartMode: 'auto',
      removeMetadata: true,
      bgType: 'transparent',
      bgColor: '#FFFFFF',
      bgGradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      bgBlur: 16,
      bgImageUrl: null,
      autoCrop: 'original',
      aspectPreset: 'free',
    };

    const defaultBrush: BrushSettings = {
      mode: 'none',
      size: 30,
      hardness: 0.8,
      opacity: 1.0,
    };

    it('renders AI smart modes and triggers selection', () => {
      const onChangeSettings = vi.fn();
      render(
        <BackgroundRemoverTool
          settings={defaultSettings}
          onChangeSettings={onChangeSettings}
          brushSettings={defaultBrush}
          onChangeBrush={vi.fn()}
          onUndo={vi.fn()}
          onRedo={vi.fn()}
          canUndo={false}
          canRedo={false}
          onExport={vi.fn()}
          onShare={vi.fn()}
          canShare={true}
          isProcessing={false}
          rotation={0}
          onRotate={vi.fn()}
          flipH={false}
          flipV={false}
          onToggleFlipH={vi.fn()}
          onToggleFlipV={vi.fn()}
          onReprocess={vi.fn()}
        />
      );

      expect(screen.getByText(/AI Smart Modes/i)).toBeInTheDocument();
      const portraitBtn = screen.getByText('Soft hair & human edges').closest('button')!;
      expect(portraitBtn).toBeInTheDocument();
      expect(screen.getByText('Sharp studio object contours')).toBeInTheDocument();
      expect(screen.getByText('Sub-pixel fine detail matting')).toBeInTheDocument();

      fireEvent.click(portraitBtn);
      expect(onChangeSettings).toHaveBeenCalledWith(
        expect.objectContaining({ smartMode: 'portrait' })
      );
    });

    it('switches background types and color presets', () => {
      const onChangeSettings = vi.fn();
      render(
        <BackgroundRemoverTool
          settings={{ ...defaultSettings, bgType: 'solid' }}
          onChangeSettings={onChangeSettings}
          brushSettings={defaultBrush}
          onChangeBrush={vi.fn()}
          onUndo={vi.fn()}
          onRedo={vi.fn()}
          canUndo={false}
          canRedo={false}
          onExport={vi.fn()}
          onShare={vi.fn()}
          canShare={true}
          isProcessing={false}
          rotation={0}
          onRotate={vi.fn()}
          flipH={false}
          flipV={false}
          onToggleFlipH={vi.fn()}
          onToggleFlipV={vi.fn()}
          onReprocess={vi.fn()}
        />
      );

      expect(screen.getByText(/Solid Color/i)).toBeInTheDocument();
      expect(screen.getByText(/Custom Hex:/i)).toBeInTheDocument();

      // Click Black preset
      const blackBtn = screen.getByTitle('Black');
      fireEvent.click(blackBtn);
      expect(onChangeSettings).toHaveBeenCalledWith(
        expect.objectContaining({ bgColor: '#000000' })
      );
    });

    it('activates Erase and Restore brush modes', () => {
      const onChangeBrush = vi.fn();
      render(
        <BackgroundRemoverTool
          settings={defaultSettings}
          onChangeSettings={vi.fn()}
          brushSettings={defaultBrush}
          onChangeBrush={onChangeBrush}
          onUndo={vi.fn()}
          onRedo={vi.fn()}
          canUndo={true}
          canRedo={false}
          onExport={vi.fn()}
          onShare={vi.fn()}
          canShare={false}
          isProcessing={false}
          rotation={0}
          onRotate={vi.fn()}
          flipH={false}
          flipV={false}
          onToggleFlipH={vi.fn()}
          onToggleFlipV={vi.fn()}
          onReprocess={vi.fn()}
        />
      );

      expect(screen.getByText(/Erase \(E\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Restore \(R\)/i)).toBeInTheDocument();

      fireEvent.click(screen.getByText(/Erase \(E\)/i));
      expect(onChangeBrush).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'erase' })
      );
    });

    it('triggers export and download actions', () => {
      const onExport = vi.fn();
      render(
        <BackgroundRemoverTool
          settings={defaultSettings}
          onChangeSettings={vi.fn()}
          brushSettings={defaultBrush}
          onChangeBrush={vi.fn()}
          onUndo={vi.fn()}
          onRedo={vi.fn()}
          canUndo={false}
          canRedo={false}
          onExport={onExport}
          onShare={vi.fn()}
          canShare={true}
          isProcessing={false}
          rotation={0}
          onRotate={vi.fn()}
          flipH={false}
          flipV={false}
          onToggleFlipH={vi.fn()}
          onToggleFlipV={vi.fn()}
          onReprocess={vi.fn()}
        />
      );

      const downloadPngBtn = screen.getByText(/Download PNG/i);
      fireEvent.click(downloadPngBtn);
      expect(onExport).toHaveBeenCalledWith('image/png');

      const downloadJpgBtn = screen.getByText(/Download JPG/i);
      fireEvent.click(downloadJpgBtn);
      expect(onExport).toHaveBeenCalledWith('image/jpeg');
    });

    it('renders native HEIC download button when image is HEIC', () => {
      const onExport = vi.fn();
      render(
        <BackgroundRemoverTool
          settings={defaultSettings}
          onChangeSettings={vi.fn()}
          brushSettings={defaultBrush}
          onChangeBrush={vi.fn()}
          onUndo={vi.fn()}
          onRedo={vi.fn()}
          canUndo={false}
          canRedo={false}
          onExport={onExport}
          onShare={vi.fn()}
          canShare={true}
          isProcessing={false}
          rotation={0}
          onRotate={vi.fn()}
          flipH={false}
          flipV={false}
          onToggleFlipH={vi.fn()}
          onToggleFlipV={vi.fn()}
          onReprocess={vi.fn()}
          isHeicOrRaw={true}
          originalFormatExtension="heic"
        />
      );

      const downloadHeicBtn = screen.getByText(/Download HEIC/i);
      expect(downloadHeicBtn).toBeInTheDocument();
      fireEvent.click(downloadHeicBtn);
      expect(onExport).toHaveBeenCalledWith('image/jpeg');
    });

    it('renders native DNG download button when image is ProRAW/DNG', () => {
      const onExport = vi.fn();
      render(
        <BackgroundRemoverTool
          settings={defaultSettings}
          onChangeSettings={vi.fn()}
          brushSettings={defaultBrush}
          onChangeBrush={vi.fn()}
          onUndo={vi.fn()}
          onRedo={vi.fn()}
          canUndo={false}
          canRedo={false}
          onExport={onExport}
          onShare={vi.fn()}
          canShare={true}
          isProcessing={false}
          rotation={0}
          onRotate={vi.fn()}
          flipH={false}
          flipV={false}
          onToggleFlipH={vi.fn()}
          onToggleFlipV={vi.fn()}
          onReprocess={vi.fn()}
          isHeicOrRaw={true}
          originalFormatExtension="dng"
        />
      );

      const downloadDngBtn = screen.getByText(/Download DNG/i);
      expect(downloadDngBtn).toBeInTheDocument();
      fireEvent.click(downloadDngBtn);
      expect(onExport).toHaveBeenCalledWith('image/jpeg');
    });

    it('allows choosing social and marketplace aspect presets', () => {
      const onChangeSettings = vi.fn();
      render(
        <BackgroundRemoverTool
          settings={defaultSettings}
          onChangeSettings={onChangeSettings}
          brushSettings={defaultBrush}
          onChangeBrush={vi.fn()}
          onUndo={vi.fn()}
          onRedo={vi.fn()}
          canUndo={false}
          canRedo={false}
          onExport={vi.fn()}
          onShare={vi.fn()}
          canShare={true}
          isProcessing={false}
          rotation={0}
          onRotate={vi.fn()}
          flipH={false}
          flipV={false}
          onToggleFlipH={vi.fn()}
          onToggleFlipV={vi.fn()}
          onReprocess={vi.fn()}
        />
      );

      expect(screen.getByText('Square (1:1)')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Square (1:1)').closest('button')!);
      expect(onChangeSettings).toHaveBeenCalledWith(
        expect.objectContaining({ aspectPreset: '1:1' })
      );
    });
  });

  describe('ProcessingOverlay', () => {
    it('renders real-time on-device status message and percentage', () => {
      render(
        <ProcessingOverlay
          previewUrl="blob:mock"
          progress={{ stage: 'analyzing', percent: 65, message: 'Refining edges & hair alpha…' }}
        />
      );

      expect(screen.getByText(/Refining edges & hair alpha…/i)).toBeInTheDocument();
      expect(screen.getAllByText(/65%/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/100% On-Device Neural Processing/i)).toBeInTheDocument();
    });
  });

  describe('HistoryDrawer', () => {
    const mockHistoryItem: HistoryItem = {
      id: 'item-1',
      name: 'portrait.jpg',
      timestamp: Date.now(),
      thumbnail: 'blob:thumb',
      processedBlob: new Blob(['mock'], { type: 'image/png' }),
      width: 1920,
      height: 1080,
      size: 512000,
    };

    it('renders recent edits list and triggers select', () => {
      const onSelect = vi.fn();
      render(
        <HistoryDrawer
          isOpen={true}
          onClose={vi.fn()}
          items={[mockHistoryItem]}
          onSelectItem={onSelect}
          onDeleteItem={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      expect(screen.getByText(/Recent Local Edits/i)).toBeInTheDocument();
      expect(screen.getByText(/portrait.jpg/i)).toBeInTheDocument();
      expect(screen.getByText(/1920 × 1080/i)).toBeInTheDocument();

      fireEvent.click(screen.getByText(/portrait.jpg/i));
      expect(onSelect).toHaveBeenCalledWith(mockHistoryItem);
    });

    it('shows empty state when no edits exist', () => {
      render(
        <HistoryDrawer
          isOpen={true}
          onClose={vi.fn()}
          items={[]}
          onSelectItem={vi.fn()}
          onDeleteItem={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      expect(screen.getByText(/No recent edits yet/i)).toBeInTheDocument();
    });
  });

  describe('KeyboardShortcutsModal', () => {
    it('renders keyboard cheat sheet and close button', () => {
      const onClose = vi.fn();
      render(<KeyboardShortcutsModal isOpen={true} onClose={onClose} />);

      expect(screen.getByText(/Keyboard Shortcuts/i)).toBeInTheDocument();
      expect(screen.getByText(/Trigger image upload dialog/i)).toBeInTheDocument();
      expect(screen.getByText(/Activate Erase brush/i)).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText(/Close shortcuts modal/i));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('ContentSections', () => {
    it('renders 5 trust pillars and accordion FAQ', () => {
      render(<ContentSections onScrollToUploader={vi.fn()} onLoadSample={vi.fn()} />);

      expect(screen.getByText(/100% Client-Side/i)).toBeInTheDocument();
      expect(screen.getByText(/No Upload Ever/i)).toBeInTheDocument();
      expect(screen.getByText(/Unlimited & Free/i)).toBeInTheDocument();
      expect(screen.getAllByText(/No Watermarks/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Full Native Quality/i)).toBeInTheDocument();

      // FAQ accordion
      expect(screen.getByText(/Is PureCut AI really 100% free with no limits\?/i)).toBeInTheDocument();
    });
  });

  describe('MaskEditorEngine', () => {
    it('initializes and handles undo/redo stack', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;

      const cutoutImg = document.createElement('img');
      cutoutImg.width = 100;
      cutoutImg.height = 100;

      const origImg = document.createElement('img');
      origImg.width = 100;
      origImg.height = 100;

      const engine = new MaskEditorEngine(canvas, cutoutImg, origImg);
      expect(engine.canUndo()).toBe(false);
      expect(engine.canRedo()).toBe(false);

      // Apply stroke
      engine.stroke(50, 50, { mode: 'erase', size: 20, hardness: 0.8, opacity: 1.0 });
      engine.pushHistory();

      expect(engine.canUndo()).toBe(true);

      engine.undo();
      expect(engine.canRedo()).toBe(true);

      engine.redo();
      expect(engine.canUndo()).toBe(true);
    });
  });
});
