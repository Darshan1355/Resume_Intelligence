import React from 'react';

export const getScoreLabel = (score) => {
  if (score >= 91) return { text: 'Excellent Match', color: 'text-emerald-500', stroke: '#10b981' };
  if (score >= 76) return { text: 'Strong Match', color: 'text-brand-500', stroke: '#6366f1' };
  if (score >= 61) return { text: 'Good Match', color: 'text-blue-500', stroke: '#3b82f6' };
  if (score >= 41) return { text: 'Needs Improvement', color: 'text-amber-500', stroke: '#f59e0b' };
  return { text: 'Low Match', color: 'text-rose-500', stroke: '#ef4444' };
};

export const CircularScore = ({
  score = 0,
  size = 140,
  strokeWidth = 10,
  showLabel = true,
  subtitle = "AI-generated compatibility estimate",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const { text: statusLabel, color: textColor, stroke: strokeColor } = getScoreLabel(clampedScore);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {Math.round(clampedScore)}
          </span>
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">/ 100</span>
        </div>
      </div>

      {showLabel && (
        <div className="mt-3 space-y-1">
          <h4 className={`text-sm font-bold tracking-tight ${textColor}`}>
            {statusLabel}
          </h4>
          {subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[200px] leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CircularScore;
