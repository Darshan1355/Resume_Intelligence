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
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });
      login(res.data.token, res.data.user);
      toast.success('Welcome back, ' + (res.data.user?.name || 'User') + '!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { title: 'AI-Powered Resume Analysis', desc: 'Apache PDFBox extraction and deep NER skill taxonomy mapping.' },
    { title: 'Sentence-BERT Job Matching', desc: 'Transformer dense embeddings comparing contextual suitability.' },
    { title: 'Tailored Technical Interview Prep', desc: 'Real-time semantic evaluation against core computer science concepts.' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Left Split: Product Value & Branding */}
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
              Next-Gen Career Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Understand your resume. Match smarter. Get career-ready.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Powered by Java Spring Boot, MySQL, and Sentence-BERT transformer NLP microservices.
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="space-y-4 pt-8 relative z-10">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-200">{b.title}</h4>
                <p className="text-[11px] text-slate-400">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Tag */}
        <div className="pt-8 text-xs text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span>Stateless JWT Authentication • End-to-End Privacy</span>
        </div>
      </div>

      {/* Right Split: Login Form */}
      <div className="md:w-1/2 p-8 sm:p-12 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sign In</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your credentials to access your intelligence dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="saas-card p-6 sm:p-8 space-y-4 shadow-sm">
            <Input
              label="Email Address"
              type="email"
              required
              icon={Mail}
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              loading={loading}
              icon={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
