'use client';
import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccessDenied() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[#F8F9FD] flex items-center justify-center p-4 font-sans">
      <div className="bg-white/80 backdrop-blur-xl border border-rose-100 p-10 rounded-[32px] shadow-[0_20px_80px_rgba(225,29,72,0.08)] max-w-md w-full text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShieldAlert className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#111827] mb-2">Access Denied</h1>
        <p className="text-[#6B7280] font-medium text-sm mb-8">
          You do not have the required permissions to view this page or perform this action.
        </p>
        <button 
          onClick={() => router.push('/')}
          className="w-full bg-[#2E1055] hover:bg-[#4527A0] text-white font-bold py-3.5 rounded-[16px] transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(108,76,245,0.2)]"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </button>
      </div>
    </div>
  );
}
