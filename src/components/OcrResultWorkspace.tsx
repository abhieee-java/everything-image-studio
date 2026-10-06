import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Check,
  Download,
  Search,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Table as TableIcon,
  FileText,
  Boxes,
  Eye,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ImageDataItem } from '../types';
import type { OcrResultData, TableStructure } from '../types/ocr';
import {
  copyTextToClipboard,
  exportAsTxt,
  exportAsDocx,
  exportAsPdf,
  exportAsCsv,
  exportAsJson,
} from '../utils/ocrExport';

interface OcrResultWorkspaceProps {
  originalImage: ImageDataItem | null;
  ocrResult: OcrResultData | null;
  isProcessing: boolean;
  preprocessedCanvas?: HTMLCanvasElement | null;
  onClearResult?: () => void;
  onUpdateResult?: (updated: OcrResultData) => void;
}

export const OcrResultWorkspace: React.FC<OcrResultWorkspaceProps> = ({
  originalImage,
  ocrResult,
  isProcessing,
  preprocessedCanvas,
  onClearResult,
  onUpdateResult,
}) => {
  // Editor State
  const [editedText, setEditedText] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [activeViewTab, setActiveViewTab] = useState<'editor' | 'layout' | 'table'>('editor');

  // Interactive Image View State
  const [zoom, setZoom] = useState<number>(100);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(false);
  const [showPreprocessedImage, setShowPreprocessedImage] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Search & Replace State
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  const [matchCount, setMatchCount] = useState<number>(0);

  // Table State
  const [tableState, setTableState] = useState<TableStructure | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync edited text with incoming OCR result
  useEffect(() => {
    if (ocrResult) {
      setEditedText(ocrResult.text);
      setHistory([ocrResult.text]);
      setHistoryIndex(0);
      setTableState(ocrResult.tableData || null);
      if (ocrResult.mode === 'table' && ocrResult.tableData) {
        setActiveViewTab('table');
      } else {
        setActiveViewTab('editor');
      }
    } else {
      setEditedText('');
      setHistory([]);
      setHistoryIndex(-1);
      setTableState(null);
    }
  }, [ocrResult]);

  // Update match count when search query or text changes
  useEffect(() => {
    if (!searchQuery.trim() || !editedText) {
      setMatchCount(0);
      return;
    }
    try {
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = editedText.match(regex);
      setMatchCount(matches ? matches.length : 0);
    } catch {
      setMatchCount(0);
    }
  }, [searchQuery, editedText]);

  // Handle Text Edits with Undo History
  const handleTextChange = (newText: string) => {
    setEditedText(newText);
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newText);
    if (updatedHistory.length > 30) updatedHistory.shift();
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);

    if (ocrResult && onUpdateResult) {
      const wCount = newText ? newText.split(/\s+/).filter(Boolean).length : 0;
      const lCount = newText ? newText.split('\n').filter(Boolean).length : 0;
      onUpdateResult({
        ...ocrResult,
        text: newText,
        wordsCount: wCount,
        charsCount: newText.length,
        linesCount: lCount,
      });
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      const prevText = history[newIdx];
      setEditedText(prevText);
      if (ocrResult && onUpdateResult) {
        const wCount = prevText ? prevText.split(/\s+/).filter(Boolean).length : 0;
        const lCount = prevText ? prevText.split('\n').filter(Boolean).length : 0;
        onUpdateResult({
          ...ocrResult,
          text: prevText,
          wordsCount: wCount,
          charsCount: prevText.length,
          linesCount: lCount,
        });
      }
    }
  };

  const handleCopy = async () => {
    if (!editedText) return;
    const ok = await copyTextToClipboard(editedText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#2dd4bf', '#38bdf8', '#818cf8'],
        });
      } catch {
        // Confetti fallback
      }
    }
  };

  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  };

  const handleReplaceAll = () => {
    if (!searchQuery) return;
    try {
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const updated = editedText.replace(regex, replaceQuery);
      handleTextChange(updated);
    } catch {
      // Regex error fallback
    }
  };

  const wordsCount = editedText ? editedText.split(/\s+/).filter(Boolean).length : 0;
  const charsCount = editedText.length;
  const linesCount = editedText ? editedText.split('\n').filter(Boolean).length : 0;

  const baseFilename = originalImage ? originalImage.name : 'ocr-extracted-text';

  // Compute confidence color
  const conf = ocrResult?.confidence || 0;
  const confColor =
    conf >= 85
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      : conf >= 65
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  if (!originalImage) {
    return (
      <div className="flex-1 min-h-[460px] flex items-center justify-center bg-[#070A12] border border-white/5 rounded-2xl p-8 text-center text-slate-500">
        <p>No image selected for OCR</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#070B14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#0D1322] border-b border-white/10 gap-2">
        {/* Left: View Tabs */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setActiveViewTab('editor')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeViewTab === 'editor'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Extracted Text</span>
          </button>

          {ocrResult && ocrResult.blocks && ocrResult.blocks.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveViewTab('layout')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeViewTab === 'layout'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Layout Blocks ({ocrResult.blocks.length})</span>
            </button>
          )}

          {tableState && (
            <button
              type="button"
              onClick={() => setActiveViewTab('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeViewTab === 'table'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table Grid ({tableState.rowCount}×{tableState.colCount})</span>
            </button>
          )}
        </div>

        {/* Right: Confidence & Action Badges */}
        <div className="flex items-center space-x-2">
          {ocrResult && (
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${confColor}`}
              title="Average character recognition confidence score"
            >
              {ocrResult.confidence}% Accuracy Rating
            </span>
          )}

          {ocrResult && onClearResult && (
            <button
              type="button"
              onClick={onClearResult}
              className="text-[11px] text-slate-400 hover:text-rose-400 px-2 py-0.5 rounded hover:bg-white/5"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Dual Workspace: Before (Image) & After (Text Editor) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10 min-h-[460px]">
        {/* LEFT COLUMN: Original / Preprocessed Image with Spatial Bounding Boxes */}
        <div className="flex flex-col bg-[#05080E] relative overflow-hidden group">
          {/* Subheader Toolbar for Image */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#090E1A] border-b border-white/5 text-[11px] text-slate-400 z-10">
            <span className="font-medium text-slate-300 truncate max-w-[180px]">
              {originalImage.name} ({originalImage.originalWidth}×{originalImage.originalHeight})
            </span>

            <div className="flex items-center space-x-2">
              {ocrResult && ocrResult.words.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowBoundingBoxes((prev) => !prev)}
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded transition-colors ${
                    showBoundingBoxes
                      ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/40'
                      : 'hover:text-white hover:bg-white/5'
                  }`}
                  title="Toggle Word Bounding Boxes Overlay"
                >
                  <Eye className="w-3 h-3" />
                  <span>Boxes</span>
                </button>
              )}

              {preprocessedCanvas && (
                <button
                  type="button"
                  onClick={() => setShowPreprocessedImage((prev) => !prev)}
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded transition-colors ${
                    showPreprocessedImage
                      ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/40'
                      : 'hover:text-white hover:bg-white/5'
                  }`}
                  title="Toggle between Original and Preprocessed Filter View"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Filtered</span>
                </button>
              )}

              <div className="flex items-center space-x-1 pl-1 border-l border-white/10">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(30, z - 20))}
                  className="p-1 hover:text-white"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono">{zoom}%</span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(300, z + 20))}
                  className="p-1 hover:text-white"
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(100)}
                  className="p-1 hover:text-white"
                  title="Reset Zoom"
                  aria-label="Reset Zoom"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Image Viewport */}
          <div className="flex-1 relative flex items-center justify-center p-4 overflow-auto scrollbar-thin">
            <div
              className="relative transition-transform duration-150 origin-center max-w-full max-h-full"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              {showPreprocessedImage && preprocessedCanvas ? (
                <img
                  src={preprocessedCanvas.toDataURL()}
                  alt="Preprocessed Filtered View"
                  className="max-h-[400px] w-auto object-contain rounded-lg shadow-lg border border-white/10"
                />
              ) : (
                <img
                  src={originalImage.previewUrl}
                  alt={originalImage.name}
                  className="max-h-[400px] w-auto object-contain rounded-lg shadow-lg border border-white/10"
                />
              )}

              {/* Spatial Word Bounding Boxes Overlay */}
              {showBoundingBoxes && ocrResult && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox={`0 0 ${Math.max(1, originalImage.originalWidth || 1)} ${Math.max(1, originalImage.originalHeight || 1)}`}
                  preserveAspectRatio="none"
                >
                  {ocrResult.words.map((w, idx) => {
                    const imgW = Math.max(1, originalImage.originalWidth || 1);
                    const imgH = Math.max(1, originalImage.originalHeight || 1);
                    const x0 = Number.isFinite(w.bbox?.x0) ? Math.max(0, Math.min(imgW, w.bbox.x0)) : 0;
                    const y0 = Number.isFinite(w.bbox?.y0) ? Math.max(0, Math.min(imgH, w.bbox.y0)) : 0;
                    const x1 = Number.isFinite(w.bbox?.x1) ? Math.max(x0, Math.min(imgW, w.bbox.x1)) : x0 + 10;
                    const y1 = Number.isFinite(w.bbox?.y1) ? Math.max(y0, Math.min(imgH, w.bbox.y1)) : y0 + 10;
                    const width = Math.max(2, x1 - x0);
                    const height = Math.max(2, y1 - y0);
                    return (
                      <rect
                        key={`box-${idx}`}
                        x={x0}
                        y={y0}
                        width={width}
                        height={height}
                        fill="rgba(45, 212, 191, 0.18)"
                        stroke="#2dd4bf"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </svg>
              )}
            </div>

            {/* Live Loading Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="w-10 h-10 border-3 border-teal-400 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm font-semibold text-white">Extracting text directly in browser...</p>
                <p className="text-xs text-teal-300 mt-1">100% private WebAssembly processing</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Extracted Result & Interactive Editor */}
        <div className="flex flex-col bg-[#080C14]">
          {/* Subheader Toolbar for Editor */}
          <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-[#090E1A] border-b border-white/5 text-[11px] gap-2">
            <div className="flex items-center space-x-3 text-slate-400">
              <span>{wordsCount} words</span>
              <span>•</span>
              <span>{charsCount} chars</span>
              <span>•</span>
              <span>{linesCount} lines</span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setShowSearch((prev) => !prev)}
                className={`p-1 rounded transition-colors ${
                  showSearch ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:text-white'
                }`}
                title="Search and Replace Text"
                aria-label="Toggle search and replace"
              >
                <Search className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                title="Undo Edits"
                aria-label="Undo text edit"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2 py-0.5 rounded text-slate-400 hover:text-white hover:bg-white/5"
                aria-label="Select all text"
              >
                Select All
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!editedText}
                aria-label="Copy extracted text to clipboard"
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  copied
                    ? 'bg-emerald-500 text-black'
                    : 'bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/40'
                }`}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Search & Replace Inline Bar */}
          {showSearch && (
            <div className="p-2.5 bg-[#0C1220] border-b border-white/10 flex flex-wrap items-center gap-2 text-xs">
              <div className="relative flex-1 min-w-[140px]">
                <input
                  type="text"
                  placeholder="Find..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-2.5 py-1 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 text-xs"
                />
                {searchQuery && (
                  <span className="absolute right-2 top-1 text-[10px] text-slate-400">
                    {matchCount} found
                  </span>
                )}
              </div>

              <input
                type="text"
                placeholder="Replace with..."
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                className="flex-1 min-w-[140px] px-2.5 py-1 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 text-xs"
              />

              <button
                type="button"
                onClick={handleReplaceAll}
                disabled={!searchQuery || matchCount === 0}
                className="px-3 py-1 rounded-lg bg-teal-500 text-black font-semibold text-xs disabled:opacity-40"
              >
                Replace All
              </button>
            </div>
          )}

          {/* View Tab 1: Editable Plain Text Area */}
          {activeViewTab === 'editor' && (
            <div className="flex-1 relative flex flex-col p-3">
              <textarea
                ref={textareaRef}
                value={editedText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Extracted OCR text will appear here. You can freely edit, format, correct, or copy..."
                aria-label="Extracted OCR text editor"
                className="w-full flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-600 font-sans text-sm leading-relaxed focus:outline-none resize-none p-2 selection:bg-teal-500/40 selection:text-white"
                spellCheck={false}
              />
            </div>
          )}

          {/* View Tab 2: Layout Blocks with Individual Confidence */}
          {activeViewTab === 'layout' && ocrResult && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {ocrResult.blocks.map((block, bIdx) => (
                <div
                  key={`block-${bIdx}`}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Paragraph Block #{bIdx + 1}</span>
                    <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono">
                      {block.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {block.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* View Tab 3: Table Grid with Editable Cells */}
          {activeViewTab === 'table' && tableState && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden">
              <div className="flex items-center justify-between pb-2 text-xs">
                <span className="text-slate-400">
                  Detected {tableState.rowCount} rows × {tableState.colCount} columns
                </span>
                <button
                  type="button"
                  onClick={() => exportAsCsv(tableState.csv, baseFilename)}
                  className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-teal-500 text-black font-semibold text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="flex-1 overflow-auto border border-white/10 rounded-xl bg-black/30 scrollbar-thin">
                <table className="w-full text-xs text-left text-slate-200 border-collapse">
                  <tbody>
                    {tableState.rows.map((row, rIdx) => (
                      <tr
                        key={`r-${rIdx}`}
                        className={`border-b border-white/5 ${
                          rIdx === 0 ? 'bg-white/5 font-semibold text-teal-300' : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={`c-${rIdx}-${cIdx}`}
                            className="p-2 border-r border-white/5 min-w-[90px]"
                          >
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => {
                                const newRows = tableState.rows.map((r, ri) =>
                                  ri === rIdx
                                    ? r.map((c, ci) => (ci === cIdx ? e.target.value : c))
                                    : r
                                );
                                const csvLines = newRows.map((r) =>
                                  r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')
                                );
                                const updatedTable: TableStructure = {
                                  ...tableState,
                                  rows: newRows,
                                  csv: csvLines.join('\n'),
                                };
                                setTableState(updatedTable);
                                if (ocrResult && onUpdateResult) {
                                  onUpdateResult({
                                    ...ocrResult,
                                    tableData: updatedTable,
                                  });
                                }
                              }}
                              className="w-full bg-transparent focus:outline-none focus:bg-white/10 rounded px-1 text-slate-100"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bottom Export Action Buttons Bar */}
          <div className="p-3 bg-[#090E1A] border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                disabled={!editedText}
                onClick={() => exportAsTxt(editedText, baseFilename)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5 text-teal-400" />
                <span>TXT</span>
              </button>

              <button
                type="button"
                disabled={!editedText}
                onClick={() => exportAsDocx(editedText, baseFilename)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Word (.docx)</span>
              </button>

              <button
                type="button"
                disabled={!editedText}
                onClick={() => exportAsPdf(editedText, baseFilename)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5 text-rose-400" />
                <span>PDF</span>
              </button>

              {tableState && (
                <button
                  type="button"
                  disabled={!tableState}
                  onClick={() => exportAsCsv(tableState.csv, baseFilename)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV</span>
                </button>
              )}

              {ocrResult && (
                <button
                  type="button"
                  onClick={() => exportAsJson(ocrResult, baseFilename)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>JSON</span>
                </button>
              )}
            </div>

            <span className="text-[10px] text-slate-500 hidden sm:inline">
              100% In-Browser • Free & Unlimited
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
