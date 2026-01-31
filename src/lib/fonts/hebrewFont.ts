// Hebrew font loader for jsPDF
// Uses Noto Sans Hebrew from Google Fonts CDN

let cachedHebrewFontBase64: string | null = null;
let cachedHebrewFontPromise: Promise<string | null> | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  // Convert in chunks to avoid huge string concatenations that can freeze the UI
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export const loadHebrewFont = async (): Promise<string | null> => {
  if (cachedHebrewFontBase64) return cachedHebrewFontBase64;
  if (cachedHebrewFontPromise) return cachedHebrewFontPromise;

  cachedHebrewFontPromise = (async () => {
    try {
      // Fetch Noto Sans Hebrew Regular from Google Fonts
      const fontUrl = 'https://fonts.gstatic.com/s/notosanshebrew/v46/or3HQ7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaeNKYZC0sqk3xXGiXd4utoiJltutR2g.ttf';

      // Add a hard timeout to avoid "infinite loading" in case the request hangs on some devices
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 8000);

      const response = await fetch(fontUrl, { signal: controller.signal });
      window.clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('Failed to fetch Hebrew font');
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      cachedHebrewFontBase64 = base64;
      return base64;
    } catch (error) {
      console.error('Error loading Hebrew font:', error);
      return null;
    } finally {
      cachedHebrewFontPromise = null;
    }
  })();

  return cachedHebrewFontPromise;
};
