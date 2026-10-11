import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this data. Please try again.',
  onRetry = null,
}) => {
  return (
    <div className="saas-card p-8 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto my-6 border-rose-200 dark:border-rose-900/50">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
