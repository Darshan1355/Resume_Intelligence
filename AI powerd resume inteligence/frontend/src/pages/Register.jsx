import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import authApi from '../api/authApi';
import Input from '../components/Input';
import Button from '../components/Button';
import {
  Brain,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', score: 0, color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { label: 'Weak', score: 33, color: 'bg-rose-500', text: 'text-rose-500' };
    if (score <= 4) return { label: 'Medium', score: 66, color: 'bg-amber-500', text: 'text-amber-500' };
    return { label: 'Strong', score: 100, color: 'bg-emerald-500', text: 'text-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      login(res.data.token, res.data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Left Split */}
      <div className="md:w-1/2 bg-gradient-to-br from-brand-950 via-slate-900 to-slate-950 p-8 sm:p-12 lg:p-16 flex flex-col justify-between text-white border-r border-slate-800 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-500 shadow-lg shadow-brand-500/30">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight">CareerMind</span>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">AI Career Intelligence</p>
            </div>
          </Link>

          <div className="space-y-3 pt-6 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-xs font-semibold text-brand-300">
              <Sparkles className="w-3.5 h-3.5" />
              Join the Platform
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Start optimizing your career opportunities today.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Upload resumes, analyze real ATS keyword coverage, and practice AI technical interviews with instant feedback.
            </p>
          </div>
        </div>

        <div className="pt-8 text-xs text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span>BCrypt Encryption • Enterprise-Grade Protection</span>
        </div>
      </div>

      {/* Right Split: Register Form */}
      <div className="md:w-1/2 p-8 sm:p-12 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Account</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign up for your CareerMind intelligence workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="saas-card p-6 sm:p-8 space-y-4 shadow-sm">
            <Input
              label="Full Name"
              type="text"
              required
              icon={User}
              placeholder="Aditya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Email Address"
              type="email"
              required
              icon={Mail}
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="space-y-2">
              <Input
                label="Password"
                type="password"
                required
                icon={Lock}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-semibold">
                    <span className="text-slate-500">Strength:</span>
                    <span className={strength.text}>{strength.label}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              required
              icon={Lock}
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              loading={loading}
              icon={ArrowRight}
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
