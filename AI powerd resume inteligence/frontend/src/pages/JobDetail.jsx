import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobApi } from '../api/jobApi';

import SkillBadge from '../components/SkillBadge';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import Badge from '../components/Badge';

import {
  Briefcase,
  MapPin,
  Clock,
  GraduationCap,
  ArrowLeft,
  GitCompare,
  Building2,
  Sparkles,
  Layers
} from 'lucide-react';

export const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await jobApi.getById(id);
        setJob(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) return <LoadingState message="Loading job posting requirements..." />;
  if (error || !job) return <ErrorState title="Job Posting Not Found" message={error} onRetry={() => window.location.reload()} />;

  const requiredSkills = job.skills?.filter((s) => s.isRequired) || [];
  const preferredSkills = job.skills?.filter((s) => !s.isRequired) || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/jobs">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{job.title}</h1>
            <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">{job.company}</p>
          </div>
        </div>

        <Link to={`/matching?jobId=${job.id}`}>
          <Button icon={GitCompare}>
            Analyze Resume against this Role
          </Button>
        </Link>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="saas-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Location</span>
            <p className="text-xs font-bold text-slate-900 dark:text-white">{job.location || 'Remote'}</p>
          </div>
        </div>

        <div className="saas-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Required Experience</span>
            <p className="text-xs font-bold text-slate-900 dark:text-white">{job.experienceRequired}+ Years</p>
          </div>
        </div>

        <div className="saas-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Degree Level</span>
            <p className="text-xs font-bold text-slate-900 dark:text-white">{job.educationRequired || 'Bachelor'}</p>
          </div>
        </div>
      </div>

      {/* Required Skills */}
      <div className="saas-card p-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Core Required Skills ({requiredSkills.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {requiredSkills.map((s, idx) => (
            <SkillBadge key={idx} skill={s.canonicalName} matchType="MATCHED" isRequired={true} />
          ))}
        </div>
      </div>

      {/* Preferred Skills */}
      {preferredSkills.length > 0 && (
        <div className="saas-card p-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Preferred / Secondary Skills ({preferredSkills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {preferredSkills.map((s, idx) => (
              <SkillBadge key={idx} skill={s.canonicalName} matchType="MATCHED" isRequired={false} />
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="saas-card p-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Job Description</h3>
        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
          {job.description}
        </p>
      </div>
    </div>
  );
};

export default JobDetail;
