import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface AccessDeniedViewProps {
  onReturn: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({ onReturn }) => {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[600px] animate-in fade-in duration-500">
      <div className="max-w-md w-full text-center p-8 bg-white/5 border border-white/10 rounded-[24px] premium-shadow backdrop-blur-md">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-3">Access Denied</h2>
        <p className="text-[#9CA3AF] mb-8 font-medium">
          You do not have the required permissions to view this screen or perform this action. 
          Please contact your administrator if you believe this is an error.
        </p>
        <button 
          onClick={onReturn}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-[12px] text-sm font-bold transition-colors inline-flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </button>
      </div>
    </div>
  );
};
