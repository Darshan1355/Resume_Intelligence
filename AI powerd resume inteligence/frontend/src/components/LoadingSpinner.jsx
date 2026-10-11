import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = "Processing intelligence data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
        <Loader2 className="w-5 h-5 text-brand-400 absolute animate-pulse" />
      </div>
      <p className="text-sm font-medium text-slate-400 animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
