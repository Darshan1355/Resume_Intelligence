import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Building2, Clock } from 'lucide-react';
import SkillBadge from './SkillBadge';
import Button from './Button';

export const JobCard = ({ job, onAnalyze = null }) => {
  const requiredSkills = job.skills?.filter((s) => s.isRequired) || [];

  return (
    <div className="saas-card saas-card-hover p-5 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                <Link to={`/jobs/${job.id}`}>{job.title}</Link>
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{job.company}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
            {job.experienceRequired}+ Yrs Exp
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {requiredSkills.slice(0, 4).map((s, i) => (
            <SkillBadge key={i} skill={s.name} matchType="MATCHED" isRequired={s.isRequired} />
          ))}
          {requiredSkills.length > 4 && (
            <span className="text-[11px] text-slate-400 self-center px-1">
              +{requiredSkills.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          <span>{job.location || 'Remote'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/matching?jobId=${job.id}`}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 flex items-center gap-1"
          >
            Analyze Fit
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
