'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [errorBanner, setErrorBanner] = useState<'not_found' | 'wrong_password' | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setErrorBanner(null);
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      const status = e.response?.status;

      if (status === 401) {
        setErrorBanner('not_found');
        toast.custom((t) => (
          <div className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-sm w-full bg-white shadow-lg rounded-xl pointer-events-auto flex items-start gap-3 p-4 border border-gray-100`}>
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Account not found</p>
              <p className="text-xs text-gray-500 mt-0.5">No account exists with this email.</p>
              <a
                href="/register"
                onClick={() => toast.dismiss(t.id)}
                className="inline-block mt-2 text-xs font-semibold text-primary-600 hover:text-primary-800 hover:underline transition"
              >
                Create a free account →
              </a>
            </div>
            <button onClick={() => toast.dismiss(t.id)} className="text-gray-300 hover:text-gray-500 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ), { duration: Infinity });
      } else {
        toast.error(e.response?.data?.message || 'Login failed');
      }
    }
  };

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center px-4">
      {/* Animated orbs */}
      <div className="auth-orb-1" />
      <div className="auth-orb-2" />
      <div className="auth-orb-3" />

      <div className="auth-card relative z-10 w-full max-w-md rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={`w-full px-4 py-2.5 rounded-lg text-sm outline-none transition bg-white/10 text-white placeholder-slate-500 border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.email ? 'border-red-400' : 'border-white/10'
              }`}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 rounded-lg text-sm outline-none transition bg-white/10 text-white placeholder-slate-500 border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.password ? 'border-red-400' : 'border-white/10'
              }`}
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {errorBanner === 'not_found' && (
            <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 text-xs text-red-300">
                <span className="font-semibold">No account found</span> with that email.{' '}
                <Link href="/register" className="underline font-semibold hover:text-red-100">Sign up instead →</Link>
              </div>
              <button onClick={() => setErrorBanner(null)} className="text-red-400/50 hover:text-red-300 transition">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition text-sm shadow-lg shadow-primary-600/30"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary-400 font-medium hover:text-primary-300 hover:underline transition">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
