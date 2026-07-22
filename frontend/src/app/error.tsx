'use client';
import React, { useEffect } from 'react';
import { ServerCrash, RefreshCw, Mail } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('System Exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[#F8F9FD] flex items-center justify-center p-4 font-sans">
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200 p-10 rounded-[32px] shadow-[0_20px_80px_rgba(0,0,0,0.05)] max-w-md w-full text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
          <ServerCrash className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#111827] mb-2">System Error</h1>
        <p className="text-[#6B7280] font-medium text-sm mb-8">
          We encountered an unexpected issue while processing your request. Please try again.
        </p>
        <div className="space-y-3">
          <button 
            onClick={() => reset()}
            className="w-full bg-[#2E1055] hover:bg-[#4527A0] text-white font-bold py-3.5 rounded-[16px] transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(108,76,245,0.2)]"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <button 
            onClick={() => window.location.href = 'mailto:support@sbnsentinel.com'}
            className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-3.5 rounded-[16px] transition-all flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" /> Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
