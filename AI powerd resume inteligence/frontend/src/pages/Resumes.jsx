import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { resumeApi } from '../api/resumeApi';

import ResumeCard from '../components/ResumeCard';
import Button from '../components/Button';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ProgressBar from '../components/ProgressBar';

import {
  Upload,
  FileText,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export const Resumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [archivedView, setArchivedView] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Upload State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(''); // 'uploading' | 'parsing' | 'extracting' | 'done'
  const [error, setError] = useState('');

  const [pendingAction, setPendingAction] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [restoringId, setRestoringId] = useState(null);

  const toast = useToast();
  const navigate = useNavigate();

  const fetchResumes = async (archived = archivedView) => {
    try {
      const res = await resumeApi.getAll(archived);
      setResumes(res.data);
    } catch (err) {
      console.error('Failed to load resumes:', err);
      toast.error('Could not load resumes from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchResumes(archivedView);
  }, [archivedView]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF documents are supported.');
      toast.error('Invalid file type. Please upload a PDF resume.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the maximum limit of 10MB.');
      toast.error('File exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(20);
    setProcessingStatus('Uploading file to server...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Simulate progress stages for transparent AI feedback
      setTimeout(() => {
        setUploadProgress(50);
        setProcessingStatus('Extracting text with Apache PDFBox...');
      }, 500);

      setTimeout(() => {
        setUploadProgress(80);
        setProcessingStatus('Running NLP NER & Skill Taxonomy extraction...');
      }, 1000);

      const res = await resumeApi.upload(formData);
      setUploadProgress(100);
      setProcessingStatus('Resume processed successfully!');

      toast.success(`Extracted ${res.data.skillsCount} skills for ${res.data.candidateName}!`);

      setTimeout(() => {
        setUploadModalOpen(false);
        setSelectedFile(null);
        setUploading(false);
        setUploadProgress(0);
        setArchivedView(false);
        fetchResumes(false);
        navigate(`/resumes/${res.data.resumeId}`);
      }, 700);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to parse resume. Please ensure it is a valid PDF.';
      setError(msg);
      toast.error(msg);
      setUploading(false);
    }
  };

  const confirmResumeAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    setActionError('');
    try {
      if (pendingAction.type === 'archive') {
        await resumeApi.archive(pendingAction.id);
        toast.success('Resume archived. Its interview and matching history is preserved.');
      } else {
        await resumeApi.delete(pendingAction.id);
        toast.success('Resume permanently deleted.');
      }
      setResumes((prev) => prev.filter((resume) => resume.id !== pendingAction.id));
      setPendingAction(null);
    } catch (err) {
      if (err.response?.status === 409) {
        setActionError(err.response?.data?.message || 'This resume is linked to interview or matching history. Archive it to keep the history and remove it from your active list.');
      } else {
        toast.error(err.response?.data?.message || 'Could not update this resume. Please try again.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const restoreResume = async (id) => {
    setRestoringId(id);
    try {
      await resumeApi.restore(id);
      setResumes((prev) => prev.filter((resume) => resume.id !== id));
      toast.success('Resume restored to your active list.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not restore this resume. Please try again.');
    } finally {
      setRestoringId(null);
    }
  };

  const closeActionDialog = () => {
    if (!actionLoading) {
      setPendingAction(null);
      setActionError('');
    }
  };

  if (loading) return <LoadingState message="Loading your resumes..." skeletonType="card" />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Resumes</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your resumes and keep interview and matching history available when archived.
          </p>
        </div>
        <Button icon={Upload} onClick={() => setUploadModalOpen(true)}>
          Upload Resume
        </Button>
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800" role="tablist" aria-label="Resume status">
        {[{ label: 'Active', archived: false }, { label: 'Archived', archived: true }].map((tab) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={archivedView === tab.archived}
            onClick={() => setArchivedView(tab.archived)}
            className={`border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
              archivedView === tab.archived
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Resumes Grid */}
      {resumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              archived={archivedView}
              onArchive={(id) => { setActionError(''); setPendingAction({ id, type: 'archive' }); }}
              onRestore={restoreResume}
              restoring={restoringId === resume.id}
              onDelete={(id) => { setActionError(''); setPendingAction({ id, type: 'delete' }); }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title={archivedView ? 'No archived resumes' : 'No resumes uploaded yet'}
          description={archivedView
            ? 'Archived resumes remain available to their interview and matching history.'
            : 'Upload a PDF resume to extract skills and calculate job match scores.'}
          actionText={archivedView ? undefined : 'Upload First Resume'}
          onAction={archivedView ? undefined : () => setUploadModalOpen(true)}
        />
      )}

      {/* Upload Resume Modal with Drag & Drop */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => !uploading && setUploadModalOpen(false)}
        title="Upload Resume Document"
        maxWidth="max-w-lg"
      >
        <div className="space-y-5">
          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative p-8 rounded-2xl border-2 border-dashed text-center transition-all ${
              dragActive
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 hover:border-brand-400'
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              disabled={uploading}
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {selectedFile ? selectedFile.name : 'Drag & drop PDF here or click to browse'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  PDF format only • Maximum file size: 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Selected File Details & Progress */}
          {selectedFile && (
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                  <FileText className="w-4 h-4 text-brand-500" />
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                </div>
                <span className="text-slate-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>

              {uploading && (
                <div className="space-y-1.5">
                  <ProgressBar value={uploadProgress} color="brand" size="sm" showValue={false} />
                  <p className="text-[11px] text-brand-600 dark:text-brand-400 font-medium animate-pulse">
                    {processingStatus}
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => setUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!selectedFile || uploading}
              loading={uploading}
              onClick={handleUploadSubmit}
              icon={Sparkles}
            >
              Process with AI
            </Button>
          </div>
        </div>
      </Modal>

      {/* Archive and permanent-delete confirmation */}
      <ConfirmDialog
        isOpen={!!pendingAction}
        onClose={closeActionDialog}
        onConfirm={confirmResumeAction}
        title={pendingAction?.type === 'archive' ? 'Archive Resume' : 'Delete Resume Permanently'}
        message={pendingAction?.type === 'archive'
          ? 'Remove this resume from the active list? Interview and matching history will be kept, and you can restore it later.'
          : 'Permanently remove this archived resume and its PDF? Deletion will be blocked if history still references it.'}
        confirmText={pendingAction?.type === 'archive' ? 'Archive' : 'Delete permanently'}
        confirmVariant={pendingAction?.type === 'archive' ? 'primary' : 'danger'}
        loading={actionLoading}
        errorMessage={actionError}
      />
    </div>
  );
};

export default Resumes;
