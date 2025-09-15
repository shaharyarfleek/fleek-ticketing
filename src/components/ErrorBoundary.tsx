import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-red-200/60 p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-slate-900 mb-3">
                Something went wrong
              </h1>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>

              {this.state.error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-left">
                  <h3 className="text-sm font-semibold text-red-900 mb-2">Error Details:</h3>
                  <pre className="text-xs text-red-700 overflow-auto max-h-32">
                    {this.state.error.message}
                  </pre>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-600 cursor-pointer">Stack Trace</summary>
                      <pre className="text-xs text-red-600 mt-1 overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={this.handleReset}
                  className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-3 rounded-xl hover:from-slate-800 hover:to-slate-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="text-slate-600 hover:text-slate-900 px-6 py-3 rounded-xl hover:bg-slate-100 transition-all duration-300 flex items-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Reload Page</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}