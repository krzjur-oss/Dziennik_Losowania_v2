import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('dziennik_v5');
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f5f0e8] dark:bg-[#1a1a1f] text-[#1a1208] dark:text-[#e8e0d0] p-6 flex flex-col items-center justify-center font-serif">
          <div className="bg-[#fdf8f0] dark:bg-[#23232b] border-2 border-[#d4c9b0] dark:border-[#3a3530] rounded-2xl p-6 w-full max-w-[580px] shadow-2xl space-y-4">
            <div className="text-4xl text-center">⚠️</div>
            <h1 className="text-2xl font-bold text-center text-[#8b1a1a] dark:text-[#c05050]">
              Ups! Wystąpił nieoczekiwany błąd aplikacji
            </h1>
            <p className="text-sm italic text-center text-[#8a7a60] dark:text-[#7a7060]">
              Aby przywrócić działanie dziennika, możesz odświeżyć stronę lub zresetować bazę danych (jeśli importowany plik był uszkodzony).
            </p>

            {this.state.error && (
              <div className="p-3 bg-red-100/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg text-xs font-mono overflow-auto max-h-[160px] space-y-1 text-red-800 dark:text-red-300">
                <div className="font-bold">Błąd: {this.state.error.toString()}</div>
                {this.state.errorInfo && (
                  <pre className="whitespace-pre-wrap leading-tight text-[10px] opacity-80">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-lg font-sans font-bold text-sm bg-[#1a4a8b] dark:bg-[#4a7ab5] text-white cursor-pointer shadow-md hover:brightness-110 active:scale-97 select-none text-center"
              >
                🔄 Odśwież stronę
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-lg font-sans font-bold text-sm bg-[#8b1a1a] dark:bg-[#c05050] text-white cursor-pointer shadow-md hover:brightness-110 active:scale-97 select-none text-center"
              >
                🗑 Skasuj pamięć i napraw
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
