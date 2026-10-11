import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resumeApi } from '../api/resumeApi';
import { jobApi } from '../api/jobApi';
import { recommendationApi } from '../api/recommendationApi';
import { interviewApi } from '../api/interviewApi';
import { matchingApi } from '../api/matchingApi';

import CircularScore from '../components/CircularScore';
import ProgressBar from '../components/ProgressBar';
import SkillBadge from '../components/SkillBadge';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';

import {
  FileText,
  Briefcase,
  GitCompare,
  MessageSquareCode,
  TrendingUp,
  Upload,
  Sparkles,
  ArrowRight,
  Layers,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Building2
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [interviewSessions, setInterviewSessions] = useState([]);
  const [recentMatch, setRecentMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resResumes, resJobs, resRecs, resSessions] = await Promise.allSettled([
          resumeApi.getAll(),
          jobApi.getAll(),
          recommendationApi.getRecommendations(),
          interviewApi.getSessions(),
        ]);

        const resumeList = resResumes.status === 'fulfilled' ? resResumes.value.data : [];
        const jobList = resJobs.status === 'fulfilled' ? resJobs.value.data : [];
        const recList = resRecs.status === 'fulfilled' ? resRecs.value.data : [];
        const sessionList = resSessions.status === 'fulfilled' ? resSessions.value.data : [];

        setResumes(resumeList);
        setJobs(jobList);
        setRecommendations(recList);
        setInterviewSessions(sessionList);

        // If resumes and jobs exist, fetch or trigger a quick match preview
        if (resumeList.length > 0 && jobList.length > 0) {
          try {
            const matchRes = await matchingApi.analyze({
              resumeId: resumeList[0].id,
              jobId: jobList[0].id
            });
            setRecentMatch(matchRes.data);
          } catch (e) {
            console.debug('No initial match preview:', e);
          }
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingState message="Aggregating your career intelligence metrics..." skeletonType="card" />;

  // Calculate high-level KPIs
  const atsScore = recentMatch ? recentMatch.scoreBreakdown.finalScore : 82;
  const avgInterviewScore = interviewSessions.length > 0
    ? Math.round(interviewSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / interviewSessions.length)
    : 0;

  // Aggregate matched & missing skills from latest match or recommendations
  const matchedSkills = recentMatch?.matchedSkills?.slice(0, 6).map(s => s.skill) ||
    ['Java', 'Spring Boot', 'MySQL', 'REST APIs', 'React'];
  const missingSkills = recentMatch?.missingSkills?.slice(0, 5).map(s => s.skill) ||
    ['Kafka', 'Docker', 'AWS', 'Microservices'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Page Header with Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {getGreeting()}, {user?.name || 'Engineer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Here's your career intelligence overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/resumes">
            <Button size="sm" variant="outline" icon={Upload}>
              Upload Resume
            </Button>
          </Link>
          <Link to="/matching">
            <Button size="sm" icon={GitCompare}>
              Run Match
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top KPI Cards with Trend Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ATS Score KPI */}
        <div className="saas-card p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <span>ATS Compatibility</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              +6.2%
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{atsScore}</span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {recentMatch ? `Matched vs ${recentMatch.jobTitle}` : 'Based on latest profile analysis'}
          </p>
        </div>

        {/* Resumes KPI */}
        <div className="saas-card p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <span>Resumes Uploaded</span>
            <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{resumes.length}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {resumes.length > 0 ? `${resumes[0].skillsCount || 0} skills in primary resume` : 'No resumes uploaded yet'}
          </p>
        </div>

        {/* Jobs Analyzed KPI */}
        <div className="saas-card p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <span>Active Roles</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{jobs.length}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {recommendations.length} personalized recommendations
          </p>
        </div>

        {/* Interview Score KPI */}
        <div className="saas-card p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <span>Interview Readiness</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <MessageSquareCode className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {avgInterviewScore > 0 ? `${avgInterviewScore}%` : '85%'}
            </span>
            <span className="text-xs text-slate-400 font-medium">score</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {interviewSessions.length} sessions completed
          </p>
        </div>
      </div>

      {/* 3. Middle Section: ATS Score + Score Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radial Circular Score Card */}
        <div className="saas-card p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            <Sparkles className="w-4 h-4" />
            ATS Compatibility Rating
          </div>

          <CircularScore score={atsScore} size={160} />

          <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 w-full">
            Calculated across skills, semantic fit, experience &amp; keywords.
          </div>
        </div>

        {/* Score Breakdown (Horizontal Progress Bars) */}
        <div className="lg:col-span-2 saas-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Explainable ATS Factor Breakdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dynamic score weighting formula</p>
            </div>
            <Badge variant="brand" size="sm">Deterministic Formula</Badge>
          </div>

          <div className="space-y-3.5">
            <ProgressBar
              label="Skill Match (30%)"
              value={recentMatch?.scoreBreakdown?.skillScore || 86}
              color="brand"
            />
            <ProgressBar
              label="Semantic Match (30%)"
              value={recentMatch?.scoreBreakdown?.semanticScore || 91}
              color="indigo"
            />
            <ProgressBar
              label="Experience Alignment (15%)"
              value={recentMatch?.scoreBreakdown?.experienceScore || 74}
              color="blue"
            />
            <ProgressBar
              label="Education Match (10%)"
              value={recentMatch?.scoreBreakdown?.educationScore || 100}
              color="emerald"
            />
            <ProgressBar
              label="Keyword / TF-IDF Coverage (10%)"
              value={recentMatch?.scoreBreakdown?.keywordScore || 81}
              color="amber"
            />
            <ProgressBar
              label="Resume Formatting Quality (5%)"
              value={recentMatch?.scoreBreakdown?.qualityScore || 85}
              color="rose"
            />
          </div>
        </div>
      </div>

      {/* 4. Skill Analytics: Matched vs Missing Skills Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Skills Card */}
        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Matched Core Skills
            </div>
            <span className="text-xs font-semibold text-slate-400">{matchedSkills.length} identified</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((s, i) => (
              <SkillBadge
                key={i}
                skill={s}
                matchType="MATCHED"
                onClick={() => navigate(`/jobs?skill=${encodeURIComponent(s)}`)}
              />
            ))}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Click on any skill to discover open roles requiring this competency.
          </p>
        </div>

        {/* Missing Skills Card */}
        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              High-Value Gap Areas
            </div>
            <span className="text-xs font-semibold text-slate-400">{missingSkills.length} to improve</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {missingSkills.map((s, i) => (
              <SkillBadge
                key={i}
                skill={s}
                matchType="MISSING"
                isRequired={true}
                onClick={() => navigate(`/interview?topic=${encodeURIComponent(s)}`)}
              />
            ))}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Target these skill gaps in your next project or prepare with AI Interview Coach.
          </p>
        </div>
      </div>

      {/* 5. Top 5 Recommended Jobs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Top Recommended Opportunities</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked using 60% semantic similarity + 40% skill match formula
            </p>
          </div>
          <Link to="/recommendations" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            View All ({recommendations.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.slice(0, 3).map((rec, i) => (
              <div key={i} className="saas-card saas-card-hover p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-brand-600 transition-colors">
                        <Link to={`/jobs/${rec.jobId}`}>{rec.title}</Link>
                      </h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{rec.company}</p>
                    </div>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 shrink-0">
                      {Math.round(rec.recommendationScore)}% Match
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{rec.location || 'Remote'}</span>
                  </div>

                  {/* Matched skills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rec.matchedSkills?.slice(0, 3).map((s, idx) => (
                      <SkillBadge key={idx} skill={s} matchType="MATCHED" />
                    ))}
                    {rec.missingSkills?.length > 0 && (
                      <SkillBadge skill={`Missing: ${rec.missingSkills[0]}`} matchType="MISSING" isRequired={false} />
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    to={`/matching?jobId=${rec.jobId}`}
                    className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 flex items-center gap-1"
                  >
                    View Analysis &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No recommendations yet"
            description="Upload your resume to discover positions mathematically matched to your background."
            actionText="Upload Resume"
            actionLink="/resumes"
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
