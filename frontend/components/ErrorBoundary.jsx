'use client';

import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-danger text-white border-brutal shadow-brutal mb-6">
              <AlertTriangle size={32} />
            </div>
            <h2 className="heading-brutal text-2xl mb-3">SOMETHING BROKE</h2>
            <p className="font-mono text-sm text-muted mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <Button
              variant="dark"
              icon={RefreshCw}
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
