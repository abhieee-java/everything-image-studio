import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock URL.createObjectURL and URL.revokeObjectURL
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn((blob: Blob | MediaSource) => {
    const size = blob instanceof Blob ? blob.size : 0;
    return `blob:mock-url-${size}`;
  });
  window.URL.revokeObjectURL = vi.fn();
}

// Mock HTMLCanvasElement.prototype.getContext
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn(function (this: HTMLCanvasElement, contextId: string) {
    if (contextId === '2d') {
      const gradientMock = {
        addColorStop: vi.fn(),
      };

      return {
        canvas: this,
        drawImage: vi.fn(),
        fillText: vi.fn(),
        strokeText: vi.fn(),
        measureText: vi.fn(() => ({ width: 100 })),
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        scale: vi.fn(),
        createLinearGradient: vi.fn(() => gradientMock),
        createRadialGradient: vi.fn(() => gradientMock),
        font: '16px sans-serif',
        fillStyle: '#000000',
        strokeStyle: '#000000',
        globalAlpha: 1.0,
        filter: 'none',
        textAlign: 'start',
        textBaseline: 'alphabetic',
        getImageData: vi.fn(() => ({
          data: new Uint8ClampedArray(4 * (this.width || 100) * (this.height || 100)),
          width: this.width || 100,
          height: this.height || 100,
        })),
        putImageData: vi.fn(),
      } as unknown as CanvasRenderingContext2D;
    }
    return null;
  }) as any;

  HTMLCanvasElement.prototype.toBlob = vi.fn(function (
    callback: BlobCallback,
    type?: string,
    _quality?: any
  ) {
    const blob = new Blob(['mock-image-data'], { type: type || 'image/png' });
    callback(blob);
  });

  HTMLCanvasElement.prototype.toDataURL = vi.fn(function (type?: string) {
    return `data:${type || 'image/png'};base64,mockbase64data`;
  });
}
