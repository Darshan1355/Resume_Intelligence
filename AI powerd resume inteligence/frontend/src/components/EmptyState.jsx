import React from 'react';
import { Link } from 'react-router-dom';
import { FolderSearch, Plus } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No records found',
  description = 'Get started by creating your first entry.',
  actionText = null,
  actionLink = null,
  onAction = null,
}) => {
  return (
    <div className="saas-card p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto my-6">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
        <Icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">{description}</p>
      </div>
      {actionLink ? (
        <Link to={actionLink}>
          <Button size="sm" icon={Plus}>
            {actionText || 'Get Started'}
          </Button>
        </Link>
      ) : onAction ? (
        <Button size="sm" icon={Plus} onClick={onAction}>
          {actionText || 'Get Started'}
        </Button>
      ) : null}
    </div>
  );
};

export default EmptyState;
