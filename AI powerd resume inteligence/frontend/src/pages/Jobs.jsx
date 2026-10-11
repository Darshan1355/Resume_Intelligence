import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { jobApi } from '../api/jobApi';

import JobCard from '../components/JobCard';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import Select from '../components/Select';

import {
  Briefcase,
  Search,
  Plus,
  Filter,
  Building2,
  MapPin,
  Sparkles,
  Layers,
  X
} from 'lucide-react';

export const Jobs = () => {
  const [searchParams] = useSearchParams();
  const skillFilter = searchParams.get('skill') || '';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(skillFilter);
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Job Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Remote');
  const [experienceRequired, setExperienceRequired] = useState(2);
  const [educationRequired, setEducationRequired] = useState('Bachelor');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [preferredSkills, setPreferredSkills] = useState('');
  const [creating, setCreating] = useState(false);

  const toast = useToast();

  const fetchJobs = async () => {
    try {
      const res = await jobApi.getAll();
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      toast.error('Could not load job postings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setCreating(true);

    const reqSkillsArr = requiredSkills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const prefSkillsArr = preferredSkills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      await jobApi.create({
        title,
        company,
        location,
        experienceRequired: parseFloat(experienceRequired),
        educationRequired,
        description,
        requiredSkills: reqSkillsArr.length > 0 ? reqSkillsArr : null,
        preferredSkills: prefSkillsArr.length > 0 ? prefSkillsArr : null,
      });

      toast.success('Job posting created successfully!');
      setCreateModalOpen(false);
      setTitle('');
      setCompany('');
      setDescription('');
      setRequiredSkills('');
      setPreferredSkills('');
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job posting.');
    } finally {
      setCreating(false);
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.skills && j.skills.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase())));

    if (experienceFilter === 'all') return matchesSearch;
    if (experienceFilter === 'entry') return matchesSearch && j.experienceRequired <= 2;
    if (experienceFilter === 'mid') return matchesSearch && j.experienceRequired > 2 && j.experienceRequired <= 5;
    if (experienceFilter === 'senior') return matchesSearch && j.experienceRequired > 5;
    return matchesSearch;
  });

  if (loading) return <LoadingState message="Loading active job opportunities..." skeletonType="card" />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Find your next opportunity
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Browse targeted job postings with automated NLP skill tagging and requirements.
          </p>
        </div>

        <Button icon={Plus} onClick={() => setCreateModalOpen(true)}>
          Create Job Posting
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by job title, company, or skill keyword..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Experience' },
              { value: 'entry', label: 'Entry (0–2 Yrs)' },
              { value: 'mid', label: 'Mid (3–5 Yrs)' },
              { value: 'senior', label: 'Senior (5+ Yrs)' },
            ]}
          />
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No job postings match your filters"
          description="Try modifying your search keywords or create a new job posting."
          actionText="Create Job Posting"
          onAction={() => setCreateModalOpen(true)}
        />
      )}

      {/* Create Job Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => !creating && setCreateModalOpen(false)}
        title="Create Target Job Posting"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateJob} className="space-y-4">
          <Input
            label="Job Title"
            required
            placeholder="e.g. Senior Java Spring Boot Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Company Name"
              required
              placeholder="e.g. CloudScale Technologies"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <Input
              label="Location"
              placeholder="e.g. Remote / San Francisco"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Experience Required (Years)"
              type="number"
              step="0.5"
              value={experienceRequired}
              onChange={(e) => setExperienceRequired(e.target.value)}
            />
            <Select
              label="Degree Requirement"
              value={educationRequired}
              onChange={(e) => setEducationRequired(e.target.value)}
              options={[
                { value: 'Bachelor', label: "Bachelor's Degree" },
                { value: 'Master', label: "Master's Degree" },
                { value: 'Doctorate', label: 'Doctorate / PhD' },
                { value: 'Associate', label: 'Associate / Diploma' },
                { value: 'Any', label: 'Any / Not Specified' },
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Full Job Description
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste full job duties, responsibilities, technical requirements..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 font-sans"
            />
          </div>

          <Input
            label="Required Skills (Comma-separated or leave blank for automatic NLP extraction)"
            placeholder="e.g. Java, Spring Boot, MySQL, Docker, Kafka"
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
          />

          <Input
            label="Preferred / Nice-to-have Skills (Optional)"
            placeholder="e.g. Kubernetes, AWS, Redis"
            value={preferredSkills}
            onChange={(e) => setPreferredSkills(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              disabled={creating}
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              loading={creating}
              icon={Sparkles}
            >
              Publish Job
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Jobs;
