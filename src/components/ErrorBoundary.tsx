import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
          <div className="max-w-md w-full bg-gray-800 rounded-3xl border-4 border-yellow-400 p-8 text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-yellow-400 mb-3">Ha ocurrido un problema visual</h2>
            <p className="text-blue-200 mb-6 text-sm">
              Se detectó un error al renderizar la interfaz. Puedes restaurar la vista sin perder tus datos principales.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-6 py-2.5 bg-yellow-400 text-blue-900 font-bold rounded-xl hover:bg-yellow-500 transition shadow-lg"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
