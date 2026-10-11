import React from 'react';

export const Select = ({
  label,
  error,
  icon: Icon,
  options = [],
  children,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <select
          id={selectId}
          className={`w-full rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs sm:text-sm py-2.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none ${
            Icon ? 'pl-10' : 'pl-3.5'
          } pr-10 ${
            error
              ? 'border-rose-500 focus:border-rose-500'
              : 'border-slate-300 dark:border-slate-700'
          } ${className}`}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

export default Select;
