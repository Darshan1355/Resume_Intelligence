import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Trash2, ExternalLink, GitCompare, Clock, Layers, Archive, RotateCcw } from 'lucide-react';
import Badge from './Badge';

export const ResumeCard = ({ resume, archived = false, onArchive, onRestore, onDelete, restoring = false }) => {
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="saas-card saas-card-hover p-5 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                <Link to={`/resumes/${resume.id}`}>{resume.fileName}</Link>
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{resume.candidateName}</p>
            </div>
          </div>
          <Badge variant={!archived && resume.status === 'PROCESSED' ? 'success' : 'default'} size="sm">
            {archived ? 'Archived' : resume.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{resume.candidateExperienceYears || 0} Yrs Exp</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            <span>{resume.skillsCount || 0} Skills</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Link
            to={`/resumes/${resume.id}`}
            className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 font-semibold flex items-center gap-1"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View
          </Link>
          {!archived && (
            <>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <Link
                to={`/matching?resumeId=${resume.id}`}
                className="text-brand-600 dark:text-brand-400 hover:text-brand-500 font-semibold flex items-center gap-1"
              >
                <GitCompare className="h-3.5 w-3.5" />
                Match
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          {archived ? (
            <>
              <button
                onClick={() => onRestore(resume.id)}
                disabled={restoring}
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors disabled:opacity-50"
                title="Restore Resume"
                aria-label="Restore resume"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(resume.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete Permanently"
                aria-label="Delete resume permanently"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onArchive(resume.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
              title="Archive Resume"
              aria-label="Archive resume"
            >
              <Archive className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeCard;
