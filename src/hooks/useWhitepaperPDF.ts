import { useCallback, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function useWhitepaperPDF(fileName = 'whitepaper.pdf') {
  const contentRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

  const capture = useCallback(async () => {
    const el = contentRef.current;
    if (!el) return;

    setCapturing(true);
    try {
      // Capture the full scrollable content
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null, // inherit from element
        logging: false,
        windowHeight: el.scrollHeight,
        height: el.scrollHeight,
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = 210;
      const pdfH = 297;

      const imgW = canvas.width;
      const imgH = canvas.height;

      // Scale canvas width to fit A4 width
      const ratio = pdfW / imgW;
      const scaledH = imgH * ratio; // total height in mm

      // Slice into pages
      const totalPages = Math.ceil(scaledH / pdfH);

      for (let p = 0; p < totalPages; p++) {
        if (p > 0) pdf.addPage();

        // Source slice in canvas pixels
        const srcY = Math.round((p * pdfH) / ratio);
        const srcHeight = Math.min(Math.round(pdfH / ratio), imgH - srcY);

        // Create a slice canvas
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = imgW;
        sliceCanvas.height = srcHeight;
        const ctx = sliceCanvas.getContext('2d');
        if (!ctx) continue;

        ctx.drawImage(canvas, 0, srcY, imgW, srcHeight, 0, 0, imgW, srcHeight);

        const imgData = sliceCanvas.toDataURL('image/jpeg', 0.92);
        const sliceHmm = srcHeight * ratio;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, sliceHmm);
      }

      pdf.save(fileName);
    } finally {
      setCapturing(false);
    }
  }, [fileName]);

  return { contentRef, capture, capturing };
}
