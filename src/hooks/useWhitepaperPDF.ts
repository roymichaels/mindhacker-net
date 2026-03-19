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
      // 1. Force all animated elements visible
      const style = document.createElement('style');
      style.id = 'pdf-capture-override';
      style.textContent = `
        .pdf-capturing,
        .pdf-capturing * {
          opacity: 1 !important;
          transform: none !important;
          visibility: visible !important;
          animation: none !important;
          transition: none !important;
        }
        .pdf-capturing [data-radix-scroll-area-viewport] {
          overflow: visible !important;
        }
      `;
      document.head.appendChild(style);
      el.classList.add('pdf-capturing');

      // 2. Remove overflow clipping on ALL ancestors up to <html>
      const savedStyles: { el: HTMLElement; props: Record<string, string> }[] = [];
      let ancestor: HTMLElement | null = el;
      while (ancestor) {
        savedStyles.push({
          el: ancestor,
          props: {
            overflow: ancestor.style.overflow,
            overflowX: ancestor.style.overflowX,
            overflowY: ancestor.style.overflowY,
            height: ancestor.style.height,
            maxHeight: ancestor.style.maxHeight,
            position: ancestor.style.position,
          },
        });
        ancestor.style.overflow = 'visible';
        ancestor.style.overflowX = 'visible';
        ancestor.style.overflowY = 'visible';
        ancestor.style.height = 'auto';
        ancestor.style.maxHeight = 'none';
        ancestor = ancestor.parentElement;
      }

      // Also handle any scroll-area viewports inside the content
      const scrollViewports = el.querySelectorAll('[data-radix-scroll-area-viewport]');
      const savedViewports: { el: HTMLElement; props: Record<string, string> }[] = [];
      scrollViewports.forEach(vp => {
        const viewport = vp as HTMLElement;
        savedViewports.push({
          el: viewport,
          props: {
            overflow: viewport.style.overflow,
            overflowY: viewport.style.overflowY,
            height: viewport.style.height,
            maxHeight: viewport.style.maxHeight,
          },
        });
        viewport.style.overflow = 'visible';
        viewport.style.overflowY = 'visible';
        viewport.style.height = 'auto';
        viewport.style.maxHeight = 'none';
      });

      // Wait for layout recalc
      await new Promise(r => setTimeout(r, 200));

      const fullHeight = el.scrollHeight;
      const fullWidth = el.scrollWidth;

      // Get the background color from computed styles
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background')?.trim();
      const backgroundColor = bgColor ? `hsl(${bgColor})` : '#0B0F14';

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor,
        logging: false,
        width: fullWidth,
        height: fullHeight,
        windowWidth: fullWidth,
        windowHeight: fullHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
      });

      // Restore everything
      el.classList.remove('pdf-capturing');
      style.remove();
      savedStyles.forEach(s => {
        Object.entries(s.props).forEach(([k, v]) => {
          (s.el.style as any)[k] = v;
        });
      });
      savedViewports.forEach(s => {
        Object.entries(s.props).forEach(([k, v]) => {
          (s.el.style as any)[k] = v;
        });
      });

      // Build PDF with margins
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const marginX = 5;
      const marginY = 5;
      const pdfW = 210;
      const pdfH = 297;
      const contentW = pdfW - marginX * 2;
      const contentH = pdfH - marginY * 2;

      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = contentW / imgW;
      const scaledH = imgH * ratio;
      const totalPages = Math.ceil(scaledH / contentH);

      for (let p = 0; p < totalPages; p++) {
        if (p > 0) pdf.addPage();

        // Fill background on each page
        pdf.setFillColor(11, 15, 20);
        pdf.rect(0, 0, pdfW, pdfH, 'F');

        const srcY = Math.round((p * contentH) / ratio);
        const srcHeight = Math.min(Math.round(contentH / ratio), imgH - srcY);
        if (srcHeight <= 0) continue;

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = imgW;
        sliceCanvas.height = srcHeight;
        const ctx = sliceCanvas.getContext('2d');
        if (!ctx) continue;

        ctx.drawImage(canvas, 0, srcY, imgW, srcHeight, 0, 0, imgW, srcHeight);

        const imgData = sliceCanvas.toDataURL('image/jpeg', 0.95);
        const sliceHmm = srcHeight * ratio;

        pdf.addImage(imgData, 'JPEG', marginX, marginY, contentW, sliceHmm);
      }

      pdf.save(fileName);
    } finally {
      setCapturing(false);
    }
  }, [fileName]);

  return { contentRef, capture, capturing };
}
