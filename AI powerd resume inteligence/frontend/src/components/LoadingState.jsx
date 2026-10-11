import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({
  message = 'Loading intelligence data...',
  skeletonType = 'spinner', // 'spinner' | 'card' | 'table'
}) => {
  if (skeletonType === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="saas-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              </div>
            </div>
            <div className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center">
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-brand-200 dark:border-brand-900 border-t-brand-600 dark:border-t-brand-500 animate-spin" />
        <Loader2 className="w-4 h-4 text-brand-600 dark:text-brand-400 absolute" />
      </div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
};

export default LoadingState;
