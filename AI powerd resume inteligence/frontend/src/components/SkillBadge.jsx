import React from 'react';
import { Check, AlertCircle, HelpCircle } from 'lucide-react';

export const SkillBadge = ({
  skill,
  matchType = 'MATCHED',
  isRequired = true,
  matchedWith = null,
  onClick = null,
  className = '',
}) => {
  const type = matchType?.toUpperCase() || 'MATCHED';

  let bgClass = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300';
  let icon = <Check className="h-3 w-3 text-emerald-500 shrink-0" />;

  if (type === 'PARTIAL') {
    bgClass = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300';
    icon = <HelpCircle className="h-3 w-3 text-amber-500 shrink-0" />;
  } else if (type === 'MISSING') {
    bgClass = 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300';
    icon = <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />;
  }

  const cursorClass = onClick ? 'cursor-pointer hover:opacity-80' : '';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${bgClass} ${cursorClass} ${className} transition-all`}
    >
      {icon}
      <span>{skill}</span>
      {type === 'PARTIAL' && matchedWith && (
        <span className="text-[10px] opacity-75">({matchedWith})</span>
      )}
      {isRequired && type === 'MISSING' && (
        <span className="text-[9px] uppercase tracking-wider font-bold px-1 rounded bg-rose-200 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200">
          Req
        </span>
      )}
    </div>
  );
};

export default SkillBadge;
