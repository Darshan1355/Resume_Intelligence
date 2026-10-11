import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Home } from 'lucide-react';
import Button from '../components/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 text-center">
      <div className="saas-card max-w-md p-10 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 mx-auto">
          <Brain className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">404</h1>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Page Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The intelligence page you requested does not exist or has been moved.
          </p>
        </div>
        <Link to="/dashboard">
          <Button icon={Home} size="md">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
