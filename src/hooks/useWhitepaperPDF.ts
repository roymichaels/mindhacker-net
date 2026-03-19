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
      // Inject a global style that forces ALL descendants visible
      // This overrides framer-motion's whileInView hidden states
      const style = document.createElement('style');
      style.id = 'pdf-capture-override';
      style.textContent = `
        .pdf-capturing * {
          opacity: 1 !important;
          transform: none !important;
          visibility: visible !important;
        }
      `;
      document.head.appendChild(style);
      el.classList.add('pdf-capturing');

      // Remove overflow clipping on ancestors
      const savedStyles: { el: HTMLElement; overflow: string; height: string; maxHeight: string }[] = [];
      let ancestor: HTMLElement | null = el;
      while (ancestor) {
        const cs = getComputedStyle(ancestor);
        if (cs.overflow !== 'visible' || cs.overflowY !== 'visible') {
          savedStyles.push({
            el: ancestor,
            overflow: ancestor.style.overflow,
            height: ancestor.style.height,
            maxHeight: ancestor.style.maxHeight,
          });
          ancestor.style.overflow = 'visible';
          ancestor.style.height = 'auto';
          ancestor.style.maxHeight = 'none';
        }
        ancestor = ancestor.parentElement;
      }

      // Wait for layout recalc
      await new Promise(r => setTimeout(r, 100));

      const fullHeight = el.scrollHeight;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        height: fullHeight,
        windowHeight: fullHeight,
        scrollY: -window.scrollY,
        y: 0,
      });

      // Restore everything
      el.classList.remove('pdf-capturing');
      style.remove();
      savedStyles.forEach(s => {
        s.el.style.overflow = s.overflow;
        s.el.style.height = s.height;
        s.el.style.maxHeight = s.maxHeight;
      });

      // Build PDF
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = 210;
      const pdfH = 297;
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = pdfW / imgW;
      const scaledH = imgH * ratio;
      const totalPages = Math.ceil(scaledH / pdfH);

      for (let p = 0; p < totalPages; p++) {
        if (p > 0) pdf.addPage();

        const srcY = Math.round((p * pdfH) / ratio);
        const srcHeight = Math.min(Math.round(pdfH / ratio), imgH - srcY);

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
