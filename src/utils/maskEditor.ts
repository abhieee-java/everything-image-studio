import type { BrushSettings } from '../types';

export class MaskEditorEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private originalImage: HTMLImageElement;
  private historyStack: ImageData[] = [];
  private historyIndex: number = -1;
  private maxHistory: number = 20;

  constructor(
    canvas: HTMLCanvasElement,
    initialCutout: HTMLImageElement,
    originalImage: HTMLImageElement
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Could not get 2D context for MaskEditor');
    this.ctx = context;
    this.originalImage = originalImage;

    // Initialize canvas dimensions
    this.canvas.width = initialCutout.naturalWidth || initialCutout.width;
    this.canvas.height = initialCutout.naturalHeight || initialCutout.height;

    // Draw initial cutout
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(initialCutout, 0, 0);

    // Save initial state
    this.pushHistory();
  }

  public pushHistory(): void {
    const currentState = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    // Truncate redo history if we are in the middle of stack
    if (this.historyIndex < this.historyStack.length - 1) {
      this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
    }

    this.historyStack.push(currentState);
    if (this.historyStack.length > this.maxHistory) {
      this.historyStack.shift();
    } else {
      this.historyIndex++;
    }
  }

  public canUndo(): boolean {
    return this.historyIndex > 0;
  }

  public canRedo(): boolean {
    return this.historyIndex < this.historyStack.length - 1;
  }

  public undo(): void {
    if (!this.canUndo()) return;
    this.historyIndex--;
    const state = this.historyStack[this.historyIndex];
    this.ctx.putImageData(state, 0, 0);
  }

  public redo(): void {
    if (!this.canRedo()) return;
    this.historyIndex++;
    const state = this.historyStack[this.historyIndex];
    this.ctx.putImageData(state, 0, 0);
  }

  /**
   * Apply a brush stroke point
   */
  public stroke(
    x: number,
    y: number,
    settings: BrushSettings
  ): void {
    const { mode, size, hardness, opacity } = settings;
    if (mode === 'none') return;

    this.ctx.save();
    const radius = Math.max(1, size / 2);

    if (mode === 'erase') {
      // Destination-out cuts out alpha
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.globalAlpha = opacity;

      const grad = this.ctx.createRadialGradient(x, y, radius * Math.max(0.1, hardness), x, y, radius);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (mode === 'restore') {
      // Source-over restoring original image in a soft circle
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.clip();

      this.ctx.globalAlpha = opacity;
      this.ctx.drawImage(this.originalImage, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }

    this.ctx.restore();
  }

  /**
   * Convert current mask state to a fresh PNG Blob
   */
  public toBlob(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      }, 'image/png');
    });
  }
}
