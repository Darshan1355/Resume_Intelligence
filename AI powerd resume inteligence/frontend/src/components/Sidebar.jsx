import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  GitCompare,
  Compass,
  MessageSquareCode,
  User,
  Sparkles,
  X,
  Cpu
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/resumes', label: 'My Resumes', icon: FileText },
    { to: '/jobs', label: 'Job Board', icon: Briefcase },
    { to: '/matching', label: 'ATS Match & Gap', icon: GitCompare },
    { to: '/recommendations', label: 'Recommendations', icon: Compass },
    { to: '/interview', label: 'AI Interview Coach', icon: MessageSquareCode },
  ];

  const secondaryNavItems = [
    { to: '/profile', label: 'Profile & Settings', icon: User },
  ];

  const content = (
    <div className="h-full flex flex-col justify-between p-4 bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/80">
      <div className="space-y-6">
        {/* Mobile Header with close button */}
        <div className="flex items-center justify-between md:hidden pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
          <button onClick={onCloseMobile} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Intelligence Suite Items */}
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Intelligence Platform
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Secondary items */}
        <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Account &amp; System
          </div>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Info Card */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              Sentence-BERT
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
            MiniLM-L6-v2 embeddings active. TF-IDF baseline ready.
          </p>
        </div>

        {/* User Pill */}
        {user && (
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="w-64 min-h-[calc(100vh-4rem)] hidden md:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative w-64 max-w-[80vw] h-full z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
