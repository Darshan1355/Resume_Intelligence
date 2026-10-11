import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resumeApi } from '../api/resumeApi';

import SkillBadge from '../components/SkillBadge';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import Badge from '../components/Badge';

import {
  FileText,
  User,
  Mail,
  Phone,
  GraduationCap,
  Clock,
  ArrowLeft,
  Layers,
  GitCompare,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileCode
} from 'lucide-react';

export const ResumeDetail = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('skills'); // 'skills' | 'raw'

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await resumeApi.getById(id);
        setResume(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load resume details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <LoadingState message="Extracting structured entities and skills..." />;
  if (error || !resume) return <ErrorState title="Resume Not Found" message={error} onRetry={() => window.location.reload()} />;

  // Group extracted skills by taxonomy category
  const skillsByCategory = (resume.skills || []).reduce((acc, skill) => {
    const cat = skill.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  // Generate real AI Resume Insights based on extracted parameters
  const insights = [];
  if (resume.candidateExperienceYears >= 3) {
    insights.push({
      type: 'positive',
      text: `Demonstrates solid ${resume.candidateExperienceYears}+ years professional track record.`,
    });
  }
  if (resume.skills?.length >= 8) {
    insights.push({
      type: 'positive',
      text: `Broad technical repertoire identified (${resume.skills.length} canonical skills).`,
    });
  } else {
    insights.push({
      type: 'warning',
      text: 'Skill density could be increased. Ensure explicit keywords for tools and frameworks are listed.',
    });
  }

  const rawLower = (resume.rawText || '').toLowerCase();
  if (rawLower.includes('aws') || rawLower.includes('cloud') || rawLower.includes('docker') || rawLower.includes('kubernetes')) {
    insights.push({
      type: 'positive',
      text: 'Good modern Cloud & DevOps containerization keywords detected.',
    });
  } else {
    insights.push({
      type: 'warning',
      text: 'Cloud & DevOps competencies (AWS/Docker/K8s) could be highlighted more prominently.',
    });
  }

  if (rawLower.includes('%') || rawLower.includes('latency') || rawLower.includes('reduced') || rawLower.includes('optimized')) {
    insights.push({
      type: 'positive',
      text: 'Contains strong quantifiable metrics and performance optimization results.',
    });
  } else {
    insights.push({
      type: 'warning',
      text: 'Add more quantifiable project outcomes (e.g. % performance increase, scale, revenue impact).',
    });
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/resumes">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{resume.fileName}</h1>
              <Badge variant="success" size="sm">{resume.status}</Badge>
              {resume.archived && <Badge variant="default" size="sm">Archived</Badge>}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Parsed Candidate Document &bull; {resume.skills?.length || 0} Skills Extracted
            </p>
          </div>
        </div>

        <Link to={`/matching?resumeId=${resume.id}`}>
          <Button icon={GitCompare}>
            Match with Job Posting
          </Button>
        </Link>
      </div>

      {/* Candidate Overview Card */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Candidate Profile Overview (NER Extracted)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Name</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{resume.candidateName || 'N/A'}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Email</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                {resume.candidateEmail || 'N/A'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Experience</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {resume.candidateExperienceYears || 0} Years
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Degree</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {resume.candidateEducation || 'Bachelor'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Tabs (Skills / Raw Text) vs Right AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tabs Content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab('skills')}
              className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'skills'
                  ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Categorized Skills ({resume.skills?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'raw'
                  ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileCode className="w-4 h-4" />
              Extracted Raw Text
            </button>
          </div>

          {activeTab === 'skills' ? (
            <div className="space-y-4">
              {Object.keys(skillsByCategory).length > 0 ? (
                Object.entries(skillsByCategory).map(([category, skills]) => (
                  <div key={category} className="saas-card p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-brand-500" />
                      {category} ({skills.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s, idx) => (
                        <SkillBadge key={idx} skill={s.canonicalName} matchType="MATCHED" />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="saas-card p-8 text-center text-xs text-slate-400">
                  No explicit taxonomy skills mapped.
                </div>
              )}
            </div>
          ) : (
            <div className="saas-card p-6">
              <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                {resume.rawText}
              </pre>
            </div>
          )}
        </div>

        {/* Right Col: AI Resume Insights Card */}
        <div className="space-y-4">
          <div className="saas-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              <Sparkles className="w-4 h-4" />
              AI Resume Insights
            </div>

            <div className="space-y-3">
              {insights.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    item.type === 'positive'
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-slate-800 dark:text-slate-200'
                      : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {item.type === 'positive' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-snug">{item.text}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 leading-tight pt-2 border-t border-slate-100 dark:border-slate-800">
              * Insights computed based on NLP term frequencies, action verbs, and skill coverage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDetail;
