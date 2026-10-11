import React from 'react';

export const ProgressBar = ({
  value = 0,
  max = 100,
  label = null,
  showValue = true,
  color = 'brand', // brand, emerald, amber, rose, indigo, blue
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorStyles = {
    brand: 'bg-brand-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    indigo: 'bg-indigo-500',
    blue: 'bg-blue-500',
  };

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between text-xs font-medium">
          {label && <span className="text-slate-700 dark:text-slate-300">{label}</span>}
          {showValue && <span className="text-slate-900 dark:text-slate-100 font-bold">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden ${heightStyles[size]}`}>
        <div
          className={`${colorStyles[color]} h-full rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
