import React from 'react';

const ScoreGauge = ({ score = 0, size = 120, strokeWidth = 10, label = "ATS Score" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return '#10b981'; // emerald
    if (s >= 60) return '#3b82f6'; // blue
    if (s >= 40) return '#f59e0b'; // amber
    return '#ef4444';             // red
  };

  const color = getColor(clampedScore);

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tracking-tight text-white">{clampedScore.toFixed(0)}%</span>
        {label && <span className="text-[10px] text-slate-400 uppercase font-semibold">{label}</span>}
      </div>
    </div>
  );
};

export default ScoreGauge;
