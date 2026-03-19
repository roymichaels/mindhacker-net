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
      // Force all content visible: remove any overflow clipping on ancestors,
      // and make all motion elements visible (they use whileInView which may hide them).
      const savedStyles: { el: HTMLElement; overflow: string; height: string; maxHeight: string }[] = [];

      // Walk up ancestors and remove overflow hidden/auto/scroll
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

      // Make all motion/animated elements inside fully visible
      const motionEls = el.querySelectorAll<HTMLElement>('[style*="opacity"]');
      const savedMotion: { el: HTMLElement; opacity: string; transform: string }[] = [];
      motionEls.forEach(m => {
        savedMotion.push({ el: m, opacity: m.style.opacity, transform: m.style.transform });
        m.style.opacity = '1';
        m.style.transform = 'none';
      });

      // Wait a frame for layout
      await new Promise(r => requestAnimationFrame(r));

      const fullHeight = el.scrollHeight;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        height: fullHeight,
        windowHeight: fullHeight,
        scrollY: 0,
        y: 0,
      });

      // Restore styles
      savedStyles.forEach(s => {
        s.el.style.overflow = s.overflow;
        s.el.style.height = s.height;
        s.el.style.maxHeight = s.maxHeight;
      });
      savedMotion.forEach(s => {
        s.el.style.opacity = s.opacity;
        s.el.style.transform = s.transform;
      });

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
