import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

import Button from '../components/Button';
import Input from '../components/Input';
import ProgressBar from '../components/ProgressBar';
import Badge from '../components/Badge';

import {
  User,
  Mail,
  Shield,
  Sun,
  Moon,
  LogOut,
  Cpu,
  Database,
  CheckCircle2,
  Sparkles,
  MapPin,
  Briefcase
} from 'lucide-react';

export const Profile = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();

  const [targetRole, setTargetRole] = useState('Senior Backend Engineer');
  const [preferredLocation, setPreferredLocation] = useState('Remote / Hybrid');
  const [primarySkills, setPrimarySkills] = useState('Java, Spring Boot, MySQL, Docker, Kafka, Microservices');
  const [saving, setSaving] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Career preferences updated successfully!');
    }, 400);
  };

  return (
    <div className="space-y-8 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Profile &amp; Career Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your authenticated identity, career targeting preferences, and system architecture settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: User Card & Completeness */}
        <div className="space-y-6">
          <div className="saas-card p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white text-2xl font-extrabold flex items-center justify-center mx-auto shadow-md shadow-brand-500/30">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>

            <Badge variant="brand" size="sm">
              {user?.role || 'ROLE_USER'}
            </Badge>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-left">
              <ProgressBar label="Profile Readiness" value={85} color="brand" size="sm" />
            </div>
          </div>

          {/* Theme & System Preferences Card */}
          <div className="saas-card p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Interface Settings
            </h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                {isDark ? <Moon className="w-4 h-4 text-brand-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Theme Mode</span>
              </div>
              <Button size="sm" variant="outline" onClick={toggleTheme}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Button>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="danger"
                size="sm"
                className="w-full"
                icon={LogOut}
                onClick={logout}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Career Preferences Form & Microservice Status */}
        <div className="md:col-span-2 space-y-6">
          {/* Preferences Form */}
          <form onSubmit={handleSavePreferences} className="saas-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Target Career Role &amp; Focus
            </h3>

            <div className="space-y-4 text-xs">
              <Input
                label="Target Job Title"
                icon={Briefcase}
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />

              <Input
                label="Preferred Work Location"
                icon={MapPin}
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
              />

              <Input
                label="Key Technical Competencies"
                value={primarySkills}
                onChange={(e) => setPrimarySkills(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" loading={saving} icon={Sparkles}>
                Save Preferences
              </Button>
            </div>
          </form>

          {/* Connected Architecture Microservices Status */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-500" />
              Active System Microservices
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Spring Boot 3.2.4 Backend</h4>
                  <p className="text-[11px] text-slate-500">Port 8080 &bull; Security, JPA, PDFBox, WebClient</p>
                </div>
                <Badge variant="success" size="sm">ONLINE</Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">FastAPI ML Microservice</h4>
                  <p className="text-[11px] text-slate-500">Port 8000 &bull; all-MiniLM-L6-v2 Sentence-BERT &amp; TF-IDF</p>
                </div>
                <Badge variant="success" size="sm">ONLINE</Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">MySQL 8.0+ Relational Store</h4>
                  <p className="text-[11px] text-slate-500">Port 3306 &bull; Normalized schema &amp; skill seeds</p>
                </div>
                <Badge variant="success" size="sm">ONLINE</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
