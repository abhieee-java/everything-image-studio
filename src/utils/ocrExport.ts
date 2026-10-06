import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import type { OcrResultData } from '../types/ocr';

/**
 * Copy text to clipboard with fallback
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback to execCommand
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Download extracted text as plain UTF-8 text file
 */
export function exportAsTxt(text: string, baseFilename: string = 'ocr-extracted-text'): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const filename = `${baseFilename.replace(/\.[^/.]+$/, '')}.txt`;
  saveAs(blob, filename);
}

/**
 * Download extracted table data as CSV file
 */
export function exportAsCsv(csvContent: string, baseFilename: string = 'ocr-extracted-table'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const filename = `${baseFilename.replace(/\.[^/.]+$/, '')}.csv`;
  saveAs(blob, filename);
}

/**
 * Download extracted text as full JSON data including coordinates
 */
export function exportAsJson(result: OcrResultData, baseFilename: string = 'ocr-extracted-data'): void {
  const jsonStr = JSON.stringify(result, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const filename = `${baseFilename.replace(/\.[^/.]+$/, '')}.json`;
  saveAs(blob, filename);
}

/**
 * Download extracted text as Microsoft Word (.docx) document 100% client-side
 */
export async function exportAsDocx(
  text: string,
  baseFilename: string = 'ocr-extracted-document'
): Promise<void> {
  const zip = new JSZip();

  // Escape XML characters
  const escapeXml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  // Convert text paragraphs into WordprocessingML paragraphs
  const paragraphsXml = text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return '<w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>';
      }
      return `<w:p><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="24"/></w:rPr><w:t xml:space="preserve">${escapeXml(
        trimmed
      )}</w:t></w:r></w:p>`;
    })
    .join('');

  // [Content_Types].xml
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  // _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // word/document.xml
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphsXml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`
  );

  const docxBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  const filename = `${baseFilename.replace(/\.[^/.]+$/, '')}.docx`;
  saveAs(docxBlob, filename);
}

/**
 * Download extracted text as PDF using jsPDF
 */
export function exportAsPdf(
  text: string,
  baseFilename: string = 'ocr-extracted-document',
  title: string = 'TridentPDF OCR Extracted Document'
): void {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 45;
  const maxWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(title, margin, cursorY);
  cursorY += 16;

  // Subtitle / metadata
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate 500
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Generated locally via TridentPDF Free Browser OCR • ${dateStr}`, margin, cursorY);
  cursorY += 12;

  // Horizontal divider
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(1);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 24;

  // Body text
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42); // Slate 900
  const lineHeight = 15;

  const paragraphs = text.split('\n');

  for (const para of paragraphs) {
    if (!para.trim()) {
      cursorY += lineHeight * 0.75;
      continue;
    }

    const wrappedLines = doc.splitTextToSize(para, maxWidth);

    for (const line of wrappedLines) {
      if (cursorY + lineHeight > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    }

    cursorY += 6; // paragraph spacing
  }

  // Footer page numbering on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 50, pageHeight - 20);
  }

  const filename = `${baseFilename.replace(/\.[^/.]+$/, '')}.pdf`;
  doc.save(filename);
}
