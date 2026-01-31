import { useCallback, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface UsePDFCaptureOptions {
  fileName?: string;
  quality?: number;
}

export function usePDFCapture(options: UsePDFCaptureOptions = {}) {
  const { fileName = 'profile.pdf', quality = 2 } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

  const capture = useCallback(async () => {
    const container = containerRef.current;
    if (!container) {
      throw new Error('PDF container ref not set');
    }

    setCapturing(true);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm

      // Get all page elements
      const pageElements = container.querySelectorAll('[data-page]');
      
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i] as HTMLElement;
        
        // Add new page for all pages except the first
        if (i > 0) {
          pdf.addPage();
        }

        // Capture the page element with html2canvas
        const canvas = await html2canvas(pageEl, {
          scale: quality,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#0f0f14',
          logging: false,
          // Ensure proper rendering
          onclone: (clonedDoc) => {
            const clonedEl = clonedDoc.querySelector(`[data-page="${pageEl.getAttribute('data-page')}"]`) as HTMLElement;
            if (clonedEl) {
              clonedEl.style.position = 'relative';
              clonedEl.style.left = '0';
            }
          },
        });

        // Convert canvas to image and add to PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        // Calculate dimensions to fit A4 while maintaining aspect ratio
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / (imgWidth / quality), pdfHeight / (imgHeight / quality));
        
        const scaledWidth = (imgWidth / quality) * ratio;
        const scaledHeight = (imgHeight / quality) * ratio;
        
        // Center the image on the page
        const x = (pdfWidth - scaledWidth) / 2;
        const y = 0;

        pdf.addImage(imgData, 'JPEG', x, y, scaledWidth, scaledHeight);
      }

      // Save the PDF
      pdf.save(fileName);
    } finally {
      setCapturing(false);
    }
  }, [fileName, quality]);

  return {
    containerRef,
    capture,
    capturing,
  };
}
