// Hebrew font loader for jsPDF
// Uses Noto Sans Hebrew from Google Fonts CDN

export const loadHebrewFont = async (): Promise<string | null> => {
  try {
    // Fetch Noto Sans Hebrew Regular from Google Fonts
    const fontUrl = 'https://fonts.gstatic.com/s/notosanshebrew/v46/or3HQ7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaeNKYZC0sqk3xXGiXd4utoiJltutR2g.ttf';
    
    const response = await fetch(fontUrl);
    if (!response.ok) {
      console.error('Failed to fetch Hebrew font');
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);
    
    return base64;
  } catch (error) {
    console.error('Error loading Hebrew font:', error);
    return null;
  }
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};
