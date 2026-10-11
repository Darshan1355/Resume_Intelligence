import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeApi } from '../api/resumeApi';
import { recommendationApi } from '../api/recommendationApi';

import SkillBadge from '../components/SkillBadge';
import Button from '../components/Button';
import Select from '../components/Select';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';

import {
  Compass,
  Sparkles,
  MapPin,
  Layers,
  GitCompare,
  Building2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async (resumeId = '') => {
    setLoading(true);
    try {
      const res = await recommendationApi.getRecommendations(resumeId || null);
      setRecommendations(res.data);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const resResumes = await resumeApi.getAll();
        setResumes(resResumes.data);
        if (resResumes.data.length > 0) {
          setSelectedResumeId(resResumes.data[0].id);
          fetchRecommendations(resResumes.data[0].id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to init recommendations page:', err);
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleResumeChange = (e) => {
    const id = e.target.value;
    setSelectedResumeId(id);
    fetchRecommendations(id);
  };

  if (loading) return <LoadingState message="Ranking job opportunities via hybrid semantic embeddings and skill match..." />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Recommended for you
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Jobs ranked using formula: <span className="font-mono text-brand-600 dark:text-brand-400 font-semibold">0.60 &times; Semantic Similarity + 0.40 &times; Skill Compatibility</span>
          </p>
        </div>

        {resumes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Matching against:</span>
            <div className="w-56">
              <Select
                value={selectedResumeId}
                onChange={handleResumeChange}
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.fileName}</option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </div>

      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="saas-card saas-card-hover p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Left Column: Job & Match Context */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold">
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      <Link to={`/jobs/${rec.jobId}`} className="hover:text-brand-600 transition-colors">
                        {rec.title}
                      </Link>
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{rec.company}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{rec.location || 'Remote'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    <span>{rec.experienceRequired}+ Yrs Experience</span>
                  </div>
                </div>

                {/* Explanation Card */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Why this matches</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {rec.explanation}
                  </p>
                </div>

                {/* Matched & Missing Skills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {rec.matchedSkills?.slice(0, 5).map((s, i) => (
                    <SkillBadge key={i} skill={s} matchType="MATCHED" />
                  ))}
                  {rec.missingSkills?.slice(0, 2).map((s, i) => (
                    <SkillBadge key={i} skill={s} matchType="MISSING" isRequired={false} />
                  ))}
                </div>
              </div>

              {/* Right Column: Score & Action */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                <div className="text-left lg:text-right space-y-0.5">
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {Math.round(rec.recommendationScore)}% Match
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Semantic: {Math.round(rec.semanticSimilarity)}% &bull; Skills: {Math.round(rec.skillMatchPercentage)}%
                  </div>
                </div>

                <Link to={`/matching?jobId=${rec.jobId}&resumeId=${selectedResumeId}`}>
                  <Button size="sm" icon={GitCompare}>
                    View Match Breakdown
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Compass}
          title="No recommendations available"
          description="Upload your resume to receive AI recommendations mathematically ranked against your skillset."
          actionText="Upload Resume"
          actionLink="/resumes"
        />
      )}
    </div>
  );
};

export default Recommendations;
