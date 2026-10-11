import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { resumeApi } from '../api/resumeApi';
import { jobApi } from '../api/jobApi';
import { interviewApi } from '../api/interviewApi';

import Button from '../components/Button';
import Select from '../components/Select';
import ProgressBar from '../components/ProgressBar';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';

import {
  MessageSquareCode,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  BookOpen,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export const Interview = () => {
  const [searchParams] = useSearchParams();
  const sessionIdParam = searchParams.get('sessionId');
  const toast = useToast();

  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Session Creation Form State
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [creatingSession, setCreatingSession] = useState(false);

  const fetchSessionsAndMeta = async () => {
    try {
      const [resSessions, resResumes, resJobs] = await Promise.all([
        interviewApi.getSessions(),
        resumeApi.getAll(),
        jobApi.getAll()
      ]);

      setSessions(resSessions.data);
      setResumes(resResumes.data);
      setJobs(resJobs.data);

      if (resResumes.data.length > 0) setSelectedResumeId(resResumes.data[0].id);
      if (resJobs.data.length > 0) setSelectedJobId(resJobs.data[0].id);

      if (sessionIdParam) {
        const active = resSessions.data.find((s) => s.id === Number(sessionIdParam));
        if (active) {
          loadSessionDetails(active.id);
        } else if (resSessions.data.length > 0) {
          loadSessionDetails(resSessions.data[0].id);
        }
      } else if (resSessions.data.length > 0) {
        loadSessionDetails(resSessions.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load interview sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (id) => {
    try {
      const res = await interviewApi.getSessionById(id);
      setCurrentSession(res.data);
      if (res.data.questions && res.data.questions.length > 0) {
        const firstUnanswered = res.data.questions.find((q) => !q.answer) || res.data.questions[0];
        setSelectedQuestion(firstUnanswered);
        setAnswerText(firstUnanswered.answer ? firstUnanswered.answer.candidateAnswer : '');
      }
    } catch (err) {
      console.error('Failed to fetch session detail:', err);
    }
  };

  useEffect(() => {
    fetchSessionsAndMeta();
  }, [sessionIdParam]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!selectedResumeId || !selectedJobId) {
      toast.warning('Please select a resume and a target role.');
      return;
    }

    setCreatingSession(true);
    try {
      const res = await interviewApi.createSession({
        resumeId: Number(selectedResumeId),
        jobId: Number(selectedJobId),
        questionCount: 5
      });
      toast.success('Generated tailored technical interview questions!');
      await fetchSessionsAndMeta();
      loadSessionDetails(res.data.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start interview prep session.');
    } finally {
      setCreatingSession(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!selectedQuestion || !answerText.trim()) {
      toast.warning('Please enter an answer before submitting.');
      return;
    }

    setEvaluating(true);
    try {
      const res = await interviewApi.submitAnswer(selectedQuestion.id, {
        answer: answerText
      });
      toast.success('Answer evaluated across 4 semantic dimensions!');
      await loadSessionDetails(currentSession.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to evaluate answer.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleSelectQuestion = (q) => {
    setSelectedQuestion(q);
    setAnswerText(q.answer ? q.answer.candidateAnswer : '');
  };

  const handleSkipQuestion = () => {
    if (!currentSession?.questions) return;
    const currentIndex = currentSession.questions.findIndex((q) => q.id === selectedQuestion.id);
    if (currentIndex < currentSession.questions.length - 1) {
      handleSelectQuestion(currentSession.questions[currentIndex + 1]);
    }
  };

  if (loading) return <LoadingState message="Initializing AI Interview Coach..." />;

  // Progress metrics for active session
  const totalQuestions = currentSession?.questions?.length || 0;
  const answeredQuestions = currentSession?.questions?.filter((q) => !!q.answer).length || 0;
  const currentQuestionIndex = currentSession?.questions
    ? currentSession.questions.findIndex((q) => q.id === selectedQuestion?.id) + 1
    : 1;
  const progressPercent = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          AI Interview Coach
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Practice role-specific architecture, system design, and coding questions with real-time semantic evaluation.
        </p>
      </div>

      {/* Main Grid: Left Setup & Sessions vs Right Active Simulator Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Session & Past Sessions */}
        <div className="space-y-6">
          {/* Start New Session Form */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              <Sparkles className="w-4 h-4" />
              Configure Interview Simulation
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3">
              <Select
                label="Target Candidate Resume"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.fileName}</option>
                ))}
              </Select>

              <Select
                label="Target Job Role"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title} ({j.company})</option>
                ))}
              </Select>

              <Select
                label="Target Difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                options={[
                  { value: 'Medium', label: 'Medium (Standard SDE)' },
                  { value: 'Hard', label: 'Hard (Senior / Principal)' },
                  { value: 'Easy', label: 'Easy (Junior / Associate)' },
                ]}
              />

              <Button
                type="submit"
                className="w-full mt-2"
                size="sm"
                loading={creatingSession}
                disabled={!selectedResumeId || !selectedJobId}
                icon={Sparkles}
              >
                {creatingSession ? 'Generating Questions...' : 'Start Interview'}
              </Button>
            </form>
          </div>

          {/* Past Sessions List */}
          <div className="saas-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Sessions ({sessions.length})
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => loadSessionDetails(s.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    currentSession?.id === s.id
                      ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{s.jobTitle}</p>
                    <p className="text-[10px] text-slate-500">{s.jobCompany}</p>
                  </div>
                  <Badge variant={s.status === 'COMPLETED' ? 'success' : 'default'} size="sm">
                    {s.overallScore ? `${Math.round(s.overallScore)}%` : 'Active'}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Active Session Simulator Terminal */}
        <div className="lg:col-span-2 space-y-6">
          {currentSession ? (
            <div className="space-y-6">
              {/* Active Session Status & Progress */}
              <div className="saas-card p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                      Active Simulation Session #{currentSession.id}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {currentSession.jobTitle} &bull; {currentSession.jobCompany}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">
                      Overall Score:
                    </span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {currentSession.overallScore ? `${Math.round(currentSession.overallScore)}%` : 'In Progress'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span>Question {currentQuestionIndex} of {totalQuestions}</span>
                    <span>{answeredQuestions} of {totalQuestions} completed ({Math.round(progressPercent)}%)</span>
                  </div>
                  <ProgressBar value={progressPercent} color="brand" size="sm" showValue={false} />
                </div>
              </div>

              {/* Questions Carousel Selector */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {currentSession.questions?.map((q, idx) => {
                  const isAnswered = !!q.answer;
                  const isSelected = selectedQuestion?.id === q.id;
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleSelectQuestion(q)}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : isAnswered
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <span>Q{idx + 1}: {q.category}</span>
                      {isAnswered && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Active Question & Answer Textarea */}
              {selectedQuestion && (
                <div className="saas-card p-6 sm:p-8 space-y-6">
                  {/* Category & Difficulty */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="brand" size="sm">{selectedQuestion.category}</Badge>
                      <Badge variant="default" size="sm">{selectedQuestion.difficulty}</Badge>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {selectedQuestion.questionText}
                    </h3>
                  </div>

                  {/* Textarea Form */}
                  <form onSubmit={handleSubmitAnswer} className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        <span>Your Technical Response</span>
                        <span>{wordCount} words</span>
                      </div>
                      <textarea
                        rows={7}
                        required
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Explain underlying architectural mechanics, trade-offs, internal algorithms, and edge-case handling..."
                        className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-sans leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleSkipQuestion}
                        disabled={evaluating}
                      >
                        Skip Question
                      </Button>

                      <Button
                        type="submit"
                        size="md"
                        loading={evaluating}
                        icon={Send}
                      >
                        {selectedQuestion.answer ? 'Re-Evaluate Response' : 'Submit for AI Evaluation'}
                      </Button>
                    </div>
                  </form>

                  {/* 4-Factor AI Evaluation Scorecard */}
                  {selectedQuestion.answer && (
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Semantic Evaluation Scorecard
                          </h4>
                        </div>
                        <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                          {Math.round(selectedQuestion.answer.overallScore)} / 100
                        </span>
                      </div>

                      {/* 3 Metric Progress Bars */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                          <ProgressBar
                            label="Relevance (40%)"
                            value={selectedQuestion.answer.relevanceScore}
                            color="brand"
                            size="sm"
                          />
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                          <ProgressBar
                            label="Concept Coverage (40%)"
                            value={selectedQuestion.answer.conceptCoverageScore}
                            color="indigo"
                            size="sm"
                          />
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                          <ProgressBar
                            label="Completeness (20%)"
                            value={selectedQuestion.answer.completenessScore}
                            color="emerald"
                            size="sm"
                          />
                        </div>
                      </div>

                      {/* AI Feedback */}
                      <div className="space-y-1 text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider">
                          Actionable AI Feedback
                        </span>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          {selectedQuestion.answer.feedback}
                        </p>
                      </div>

                      {/* Ideal Reference Concept Solution */}
                      {selectedQuestion.sampleIdealAnswer && (
                        <div className="p-3.5 rounded-xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800/60 space-y-1 text-xs">
                          <span className="font-bold text-brand-700 dark:text-brand-300 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            Ideal Reference Architecture Solution
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {selectedQuestion.sampleIdealAnswer}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                        <span>* Semantic evaluation — technical correctness may require human review.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquareCode}
              title="No interview session active"
              description="Configure and launch an AI technical interview session on the left to practice answering real role questions."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;
