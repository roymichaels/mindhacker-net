import { cn } from '@/lib/utils';

interface PDFCoverPageProps {
  userName: string;
  language: string;
}

export function PDFCoverPage({ userName, language }: PDFCoverPageProps) {
  const isRTL = language === 'he';
  
  const dateStr = new Date().toLocaleDateString(isRTL ? 'he-IL' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div 
      className="pdf-page flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0f14] via-[#1a1a2e] to-[#0f0f14]"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ width: '595px', height: '842px', padding: '40px' }}
    >
      {/* Logo */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-2xl shadow-violet-500/30">
          <span className="text-white text-3xl font-bold">MH</span>
        </div>
        <div className="absolute inset-0 w-24 h-24 rounded-full bg-violet-500/20 animate-pulse blur-xl" />
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
        {isRTL ? 'פרופיל הטרנספורמציה שלי' : 'My Transformation Profile'}
      </h1>

      {/* User name */}
      <p className="text-2xl text-white/90 font-medium mb-4">{userName}</p>

      {/* Date */}
      <p className="text-lg text-white/50">{dateStr}</p>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-purple-600/10 blur-3xl" />
      
      {/* Footer */}
      <div className="absolute bottom-10 text-center">
        <p className="text-sm text-white/30">MindHacker.net</p>
      </div>
    </div>
  );
}
