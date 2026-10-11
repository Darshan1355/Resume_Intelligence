import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { resumeApi } from '../api/resumeApi';
import { jobApi } from '../api/jobApi';
import { matchingApi } from '../api/matchingApi';
import { interviewApi } from '../api/interviewApi';

import AtsBreakdownCard from '../components/AtsBreakdownCard';
import SkillBadge from '../components/SkillBadge';
import Button from '../components/Button';
import Select from '../components/Select';
import LoadingState from '../components/LoadingState';
import Badge from '../components/Badge';

import {
  GitCompare,
  Sparkles,
  FileText,
  Briefcase,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  MessageSquareCode,
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const Matching = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(searchParams.get('resumeId') || '');
  const [selectedJobId, setSelectedJobId] = useState(searchParams.get('jobId') || '');

  const [analyzing, setAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSelectors = async () => {
      try {
        const [resResumes, resJobs] = await Promise.all([
          resumeApi.getAll(),
          jobApi.getAll()
        ]);
        setResumes(resResumes.data);
        setJobs(resJobs.data);

        if (!selectedResumeId && resResumes.data.length > 0) {
          setSelectedResumeId(resResumes.data[0].id);
        }
        if (!selectedJobId && resJobs.data.length > 0) {
          setSelectedJobId(resJobs.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load selectors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSelectors();
  }, []);

  const handleRunMatch = async (e) => {
    e?.preventDefault();
    if (!selectedResumeId || !selectedJobId) {
      toast.warning('Please select both a resume and a job to analyze.');
      return;
    }

    setAnalyzing(true);
    setMatchResult(null);

    try {
      const res = await matchingApi.analyze({
        resumeId: Number(selectedResumeId),
        jobId: Number(selectedJobId),
      });
      setMatchResult(res.data);
      toast.success('ATS compatibility analysis completed!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Matching analysis failed. Ensure ML service is running.';
      toast.error(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStartInterview = async () => {
    if (!selectedResumeId || !selectedJobId) return;
    try {
      const res = await interviewApi.createSession({
        resumeId: Number(selectedResumeId),
        jobId: Number(selectedJobId),
        questionCount: 5
      });
      toast.success('Interview preparation session initialized!');
      navigate(`/interview?sessionId=${res.data.id}`);
    } catch (err) {
      toast.error('Failed to start interview session: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <LoadingState message="Loading matching engine..." />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Resume &harr; Job Match Analysis
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Compare candidate resume against job requirements with Sentence-BERT embeddings, skill gap analysis, and explainable scoring.
        </p>
      </div>

      {/* Selectors Form */}
      <form onSubmit={handleRunMatch} className="saas-card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Select Candidate Resume"
            icon={FileText}
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.fileName} ({r.candidateName} • {r.skillsCount} skills)
              </option>
            ))}
          </Select>

          <Select
            label="Select Target Job Description"
            icon={Briefcase}
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} at {j.company} ({j.location})
              </option>
            ))}
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full py-3"
          size="lg"
          loading={analyzing}
          disabled={!selectedResumeId || !selectedJobId}
          icon={Sparkles}
        >
          {analyzing ? 'Computing Sentence-BERT & TF-IDF Vectors...' : 'Analyze Match Compatibility'}
        </Button>
      </form>

      {analyzing && (
        <LoadingState message="Calculating 384-dimensional dense embeddings, cosine distances, and skill taxonomy overlap..." />
      )}

      {/* Analysis Results Display */}
      {matchResult && (
        <div className="space-y-8 animate-fadeIn">
          {/* 1. Large 6-Factor Explainable ATS Breakdown Card */}
          <AtsBreakdownCard breakdown={matchResult.scoreBreakdown} />

          {/* 2. Classical Baseline vs Deep Learning Sentence-BERT Comparison */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  NLP Algorithm Benchmark: Classical TF-IDF vs Deep Learning Sentence-BERT
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Empirical comparison of lexical n-gram frequencies versus 384-d semantic sentence embeddings
                </p>
              </div>
              <Badge variant="brand" size="sm">Dual NLP Pipeline</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Classical NLP Baseline</span>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">TF-IDF + Cosine</h4>
                  <span className="text-lg font-extrabold text-amber-500">
                    {matchResult.scoreBreakdown.baselineTfidfScore}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Measures exact vocabulary overlap and inverse document frequency without contextual synonym understanding.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-brand-50/40 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800/60 space-y-2">
                <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase">Deep Learning Model</span>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Sentence-BERT (MiniLM-L6)</h4>
                  <span className="text-lg font-extrabold text-brand-600 dark:text-brand-400">
                    {matchResult.scoreBreakdown.semanticScore}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Encodes deep semantic intent and architectural technology relationships in multi-dimensional vector space.
                </p>
              </div>
            </div>
          </div>

          {/* 3. "Why this score?" Detailed Explainability Section */}
          <div className="saas-card p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Why this score?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprehensive skill alignment and gap breakdown
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-brand-500" />
                <span>Explainable AI</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Strong Matches */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  Strong Matched Skills ({matchResult.matchedSkills?.length || 0})
                </div>
                <div className="flex flex-wrap gap-2">
                  {matchResult.matchedSkills?.map((s, i) => (
                    <SkillBadge key={i} skill={s.skill} matchType="MATCHED" />
                  ))}
                  {(!matchResult.matchedSkills || matchResult.matchedSkills.length === 0) && (
                    <span className="text-xs text-slate-400">No exact skill matches identified.</span>
                  )}
                </div>
              </div>

              {/* Partially Matched Skills (Synonyms / Affinities) */}
              {matchResult.partiallyMatchedSkills?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-600 dark:text-amber-400">
                    <HelpCircle className="w-4 h-4" />
                    Partially Matched Skills ({matchResult.partiallyMatchedSkills.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.partiallyMatchedSkills.map((s, i) => (
                      <SkillBadge key={i} skill={s.skill} matchType="PARTIAL" matchedWith={s.matchedWith} />
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  Missing Required &amp; Preferred Skills ({matchResult.missingSkills?.length || 0})
                </div>
                <div className="flex flex-wrap gap-2">
                  {matchResult.missingSkills?.map((s, i) => (
                    <SkillBadge key={i} skill={s.skill} matchType="MISSING" isRequired={s.isRequired} />
                  ))}
                  {(!matchResult.missingSkills || matchResult.missingSkills.length === 0) && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      Candidate meets 100% of required technical skills!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Action Card to Start AI Interview Simulator */}
          <div className="saas-card p-6 bg-gradient-to-r from-brand-900/10 via-indigo-900/10 to-slate-900/10 dark:from-brand-950/40 dark:via-indigo-950/40 dark:to-slate-900 border-brand-200 dark:border-brand-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
                <MessageSquareCode className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                Practice Technical Interview for this Role
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Launch interactive question simulation targeting your matched strengths and missing gap competencies.
              </p>
            </div>
            <Button onClick={handleStartInterview} icon={ArrowRight} className="shrink-0">
              Start AI Interview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matching;
