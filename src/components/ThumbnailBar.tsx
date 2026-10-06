import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import type { ImageDataItem } from '../types';
import { formatBytes } from '../utils/imageUtils';
import { DropZone } from './DropZone';

interface ThumbnailBarProps {
  images: ImageDataItem[];
  activeImageId: string;
  onSelectImage: (id: string) => void;
  onRemoveImage: (id: string) => void;
  onFilesSelected: (files: File[]) => void;
}

export const ThumbnailBar: React.FC<ThumbnailBarProps> = ({
  images,
  activeImageId,
  onSelectImage,
  onRemoveImage,
  onFilesSelected,
}) => {
  return (
    <div className="w-full bg-[#0B1120] border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center space-x-3 overflow-x-auto pb-1 scrollbar-thin">
        {/* Compact dropzone for adding more */}
        <div className="flex-shrink-0 w-36">
          <DropZone onFilesSelected={onFilesSelected} onLoadSamples={() => {}} compact />
        </div>

        {/* List of images */}
        {images.map((item, idx) => {
          const isActive = item.id === activeImageId;
          return (
            <div
              key={item.id}
              onClick={() => onSelectImage(item.id)}
              className={`group relative flex-shrink-0 flex items-center space-x-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 border ${
                isActive
                  ? 'bg-teal-500/10 border-teal-500/50 shadow-md shadow-teal-500/10'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
              }`}
            >
              {/* Thumbnail preview */}
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                <img
                  src={item.previewUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {isActive && (
                  <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-teal-300 drop-shadow" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="max-w-[120px] text-left">
                <p className="text-xs font-medium text-white truncate" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                  <span>{formatBytes(item.originalSize)}</span>
                  <span>•</span>
                  <span>{item.originalWidth}×{item.originalHeight}</span>
                </div>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-opacity"
                title="Remove image"
                aria-label={`Remove ${item.name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Index counter badge */}
              <div className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-slate-800 border border-white/20 text-[9px] font-bold text-slate-300 flex items-center justify-center">
                {idx + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
