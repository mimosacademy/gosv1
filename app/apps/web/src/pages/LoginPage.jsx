import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LOGO_URL } from '@/lib/brand';
import { BarChart3, ClipboardList, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';

const FEATURES = [
  { icon: BarChart3, text: 'Opportunity → quotation → PO → programme forecast and order book' },
  { icon: ClipboardList, text: 'Programme hub linking clients, delivery, invoices and collections' },
  { icon: ShieldCheck, text: 'Role-based access for Super Admin, Manager, Finance, Sales and more' },
];

export default function LoginPage() {
  const { login, isAuthed } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthed) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] bg-white">
      <Helmet>
        <title>Sign In — MIMOS Academy PMS</title>
        <meta
          name="description"
          content="Sign in to the MIMOS Academy Programme Management System for internal staff."
        />
      </Helmet>

      {/* Brand panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-violet-700 via-violet-800 to-zinc-900 p-12 lg:flex">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
            <img src={LOGO_URL} alt="MIMOS Academy" className="h-12 w-auto object-contain" />
          </div>
          <p className="text-xs font-medium text-violet-200">Programme Management System</p>
        </div>

        <div>
          <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight text-white">
            Manage every programme from opportunity to payment collection.
          </h1>
          <ul className="mt-10 space-y-5">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <f.icon className="h-5 w-5 text-violet-200" strokeWidth={1.8} />
                </div>
                <p className="pt-1.5 text-sm leading-relaxed text-violet-100">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-violet-300">
          Internal use only — authorised MIMOS Academy staff.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img src={LOGO_URL} alt="MIMOS Academy" className="h-12 w-auto object-contain" />
          </div>

          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Sign in to PMS</h2>
            <p className="mt-1 text-sm text-slate-500">
              Use your staff account to access the programme workspace.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.8} />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@mimos.academy"
                    className="h-10 pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.8} />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="h-10 pl-9"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 ring-1 ring-inset ring-red-200">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-10 w-full bg-violet-600 text-sm font-semibold hover:bg-violet-700"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Access is provisioned by your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
