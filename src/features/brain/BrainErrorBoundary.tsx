import { Component, ReactNode } from "react";
import { RefreshCw, Brain } from "lucide-react";
import { debug } from "@/lib/debug";

interface Props {
  isRTL: boolean;
  children: ReactNode;
}
interface State {
  hasError: boolean;
  errorId: string | null;
  message: string | null;
}

export default class BrainErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorId: null, message: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorId: null, message: error?.message ?? "unknown" };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    const id = debug.error("[brain] render error", error?.message, {
      componentStack: info.componentStack,
      stack: error?.stack,
    });
    this.setState({ errorId: id });
  }

  private reset = () => this.setState({ hasError: false, errorId: null, message: null });

  render() {
    if (!this.state.hasError) return this.props.children;
    const { isRTL } = this.props;
    return (
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center px-6 gap-5"
      >
        <div className="relative h-20 w-20 rounded-full bg-primary/10 ring-1 ring-primary/30 backdrop-blur-md flex items-center justify-center">
          <Brain className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <div className="space-y-1.5 max-w-xs">
          <h2 className="text-xl font-semibold text-foreground">
            {isRTL ? "המוח לא נטען" : "Brain failed to render"}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isRTL
              ? "אירעה שגיאה בעת טעינת המפה. נסה לרענן."
              : "Something went wrong while drawing your brain. Try again."}
          </p>
          {this.state.errorId && (
            <p className="text-[10px] font-mono text-muted-foreground/60">{this.state.errorId}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={this.reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition"
          >
            <RefreshCw className="h-4 w-4" />
            {isRTL ? "נסה שוב" : "Try again"}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.04] text-foreground font-medium text-sm hover:bg-white/[0.08] transition"
          >
            {isRTL ? "רענן עמוד" : "Reload page"}
          </button>
        </div>
      </div>
    );
  }
}