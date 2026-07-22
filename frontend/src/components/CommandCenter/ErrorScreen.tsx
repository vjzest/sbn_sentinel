'use client';
import React, { Component, ErrorInfo } from 'react';
import { AlertTriangle, RotateCcw, MessageSquare } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorScreen extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-screen w-full bg-[#120524] animate-in fade-in duration-500 font-sans">
          <div className="max-w-md w-full text-center p-8 bg-white/5 border border-white/10 rounded-[24px] premium-shadow backdrop-blur-md">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-3">Something went wrong</h2>
            <p className="text-[#9CA3AF] mb-8 font-medium">
              We encountered an unexpected system error. Our team has been notified. 
              Please try again or contact support if the issue persists.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-[12px] text-sm font-bold transition-colors inline-flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Retry Application
              </button>
              <button 
                onClick={() => window.location.href = 'mailto:support@sbnsentinel.com'}
                className="w-full bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-[12px] text-sm font-bold transition-colors inline-flex items-center justify-center gap-2 border border-white/10"
              >
                <MessageSquare className="w-4 h-4" /> Contact Support
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
