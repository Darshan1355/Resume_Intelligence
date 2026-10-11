import React from 'react';
import CircularScore from './CircularScore';
import ProgressBar from './ProgressBar';
import {
  CheckCircle,
  Lightbulb,
  Cpu,
  Layers,
  GraduationCap,
  Clock,
  Sparkles,
  FileCheck,
  ShieldCheck
} from 'lucide-react';

export const AtsBreakdownCard = ({ breakdown }) => {
  if (!breakdown) return null;

  const factors = [
    { label: 'Skill Match (30%)', score: breakdown.skillScore, color: 'brand' },
    { label: 'Semantic Fit (30%)', score: breakdown.semanticScore, color: 'indigo' },
    { label: 'Experience Match (15%)', score: breakdown.experienceScore, color: 'blue' },
    { label: 'Education Match (10%)', score: breakdown.educationScore, color: 'emerald' },
    { label: 'Keyword / TF-IDF (10%)', score: breakdown.keywordScore, color: 'amber' },
    { label: 'Resume Quality (5%)', score: breakdown.qualityScore, color: 'rose' },
  ];

  return (
    <div className="saas-card p-6 sm:p-8 space-y-6">
      {/* Top Section: Circular Score + Executive Summary */}
      <div className="flex flex-col md:flex-row items-center gap-8 pb-6 border-b border-slate-100 dark:border-slate-800">
        <CircularScore score={breakdown.finalScore} size={150} />

        <div className="space-y-3 flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/80 text-[11px] font-bold text-brand-700 dark:text-brand-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            Explainable AI Scoring Engine
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            ATS Compatibility Breakdown
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {breakdown.executiveSummary}
          </p>
        </div>
      </div>

      {/* 6-Factor Horizontal Progress Bars */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Weighted Component Breakdown
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {factors.map((f, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1.5"
            >
              <ProgressBar
                label={f.label}
                value={f.score || 0}
                color={f.color}
                size="md"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Actionable Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Strengths */}
        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle className="w-4 h-4" />
            Key Strengths
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            {breakdown.keyStrengths?.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actionable Recommendations */}
        <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            Actionable Recommendations
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            {breakdown.improvementRecommendations?.map((r, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AtsBreakdownCard;
