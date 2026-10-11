import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Brain,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Settings,
  Menu,
  X,
  Sparkles,
  FileText,
  Briefcase,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

export const Navbar = ({ onToggleMobileSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: 'Resume Intelligence Ready', desc: 'Sentence-BERT embeddings pre-loaded.', time: 'Just now', read: false },
    { id: 2, title: 'ATS Scoring Active', desc: '6-factor explainability formula initialized.', time: '5m ago', read: true },
    { id: 3, title: 'Welcome to CareerMind', desc: 'Upload a PDF to start matching.', time: '1h ago', read: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSelect = (path) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-4">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 md:hidden focus:outline-none"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                CareerMind
              </span>
              <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase hidden sm:inline">
                AI Career Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Global Search with Suggestions */}
        {isAuthenticated && (
          <div className="relative flex-1 max-w-md hidden sm:block" ref={searchRef}>
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, resumes, skills..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>

            {showSearchDropdown && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-2 space-y-1 text-xs animate-fadeIn z-50">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Quick Navigation
                </div>
                <button
                  onClick={() => handleSearchSelect('/resumes')}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300"
                >
                  <FileText className="h-4 w-4 text-brand-500" />
                  <span>My Resumes &amp; Skills</span>
                </button>
                <button
                  onClick={() => handleSearchSelect('/jobs')}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300"
                >
                  <Briefcase className="h-4 w-4 text-indigo-500" />
                  <span>Job Postings Board</span>
                </button>
                <button
                  onClick={() => handleSearchSelect('/matching')}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300"
                >
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <span>ATS Match &amp; Semantic Gap</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right: Theme Toggle, Notifications, User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Notification Bell Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-slate-950" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-3 space-y-2 text-xs animate-fadeIn z-50">
                    <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white">Notifications</span>
                      <span className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">All caught up</span>
                    </div>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{n.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Menu Dropdown */}
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-2 space-y-1 text-xs animate-fadeIn z-50">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{user?.name}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-brand-500" />
                      <span>Profile &amp; Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm shadow-brand-600/30 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
