import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { debug } from '@/lib/debug';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorId: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Auto-reload on stale dynamic import errors (Vite HMR cache issue)
    if (error.message?.includes('Failed to fetch dynamically imported module')) {
      const reloadKey = 'error_boundary_reload';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      // Only auto-reload once per 10 seconds to avoid infinite loops
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        sessionStorage.setItem(reloadKey, String(now));
        window.location.reload();
        return;
      }
    }

    const errorId = debug.error(
      'React Error Boundary caught error:',
      error.message,
      { componentStack: errorInfo.componentStack }
    );
    
    this.setState({ errorId });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  private getLanguage(): 'he' | 'en' {
    try {
      const lang = document.documentElement.lang;
      return lang === 'he' ? 'he' : 'en';
    } catch {
      return 'he';
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const lang = this.getLanguage();
      const isHe = lang === 'he';

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="bg-card p-8 text-center max-w-md mx-auto space-y-6 rounded-2xl border border-pink-500/40 shadow-[0_0_40px_-10px_hsl(320_90%_65%/0.45)]">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {isHe ? 'משהו השתבש' : 'Something went wrong'}
              </h1>
              <p className="text-muted-foreground">
                {isHe 
                  ? 'אירעה שגיאה בלתי צפויה. אנא נסה לרענן את הדף או לחזור לדף הבית.'
                  : 'An unexpected error occurred. Please try refreshing the page or going back to the home page.'}
              </p>
              {this.state.errorId && (
                <p className="text-xs text-muted-foreground/60 font-mono">
                  {this.state.errorId}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleReload}
                className="gap-2 bg-gradient-to-r from-pink-400 to-fuchsia-500 text-black hover:from-pink-300 hover:to-fuchsia-400 shadow-[0_0_30px_-5px_hsl(320_90%_65%/0.7)] border-0"
              >
                <RefreshCw className="w-4 h-4" />
                {isHe ? 'רענן עמוד' : 'Refresh page'}
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="border-pink-500/30 bg-transparent text-foreground hover:bg-pink-500/10"
              >
                {isHe ? 'חזור לדף הבית' : 'Go to home page'}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
