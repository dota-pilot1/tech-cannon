import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4 p-8 max-w-md">
            <div className="text-5xl">⚠️</div>
            <h2 className="text-xl font-bold text-foreground">
              예기치 못한 오류가 발생했습니다
            </h2>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || "알 수 없는 오류입니다."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90"
              >
                다시 시도
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm bg-muted text-muted-foreground rounded-md hover:opacity-90"
              >
                페이지 새로고침
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
