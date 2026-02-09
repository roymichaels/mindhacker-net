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
          <div className="glass-panel p-8 text-center max-w-md mx-auto space-y-6">
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
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {isHe ? 'רענן עמוד' : 'Refresh page'}
              </Button>
              <Button 
                variant="outline" 
                onClick={this.handleGoHome}
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
