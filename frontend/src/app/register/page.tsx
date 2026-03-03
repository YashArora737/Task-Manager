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
  username: z.string().min(3, 'Min 3 chars').max(30, 'Max 30 chars').regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and underscores only'),
  password: z.string().min(6, 'At least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const router = useRouter();
  const [errorBanner, setErrorBanner] = useState<'email_taken' | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setErrorBanner(null);
    try {
      await authRegister(data.email, data.username, data.password);
      router.push('/dashboard');
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      const status = e.response?.status;
      const message = e.response?.data?.message || '';

      if (status === 409 && message.toLowerCase().includes('email')) {
        setErrorBanner('email_taken');
        toast.custom((t) => (
          <div className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-sm w-full bg-white shadow-lg rounded-xl pointer-events-auto flex items-start gap-3 p-4 border border-orange-100`}>
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Email already registered</p>
              <p className="text-xs text-gray-500 mt-0.5">This email is already linked to an account.</p>
              <a
                href="/login"
                onClick={() => toast.dismiss(t.id)}
                className="inline-block mt-2 text-xs font-semibold text-primary-600 hover:text-primary-800 hover:underline transition"
              >
                Sign in instead →
              </a>
            </div>
            <button onClick={() => toast.dismiss(t.id)} className="text-gray-300 hover:text-gray-500 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ), { duration: Infinity });
      } else if (status === 409) {
        toast.error(message || 'This username is already taken');
      } else {
        toast.error(message || 'Registration failed');
      }
    }
  };

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center px-4 py-8">
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
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-slate-400 mt-1 text-sm">Start managing your tasks today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: 'email' as const, label: 'Email', type: 'email', placeholder: 'you@example.com', autocomplete: 'email' },
            { name: 'username' as const, label: 'Username', type: 'text', placeholder: 'johndoe', autocomplete: 'username' },
            { name: 'password' as const, label: 'Password', type: 'password', placeholder: '••••••••', autocomplete: 'new-password' },
            { name: 'confirmPassword' as const, label: 'Confirm Password', type: 'password', placeholder: '••••••••', autocomplete: 'new-password' },
          ].map(({ name, label, type, placeholder, autocomplete }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
              <input
                {...register(name)}
                type={type}
                autoComplete={autocomplete}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 rounded-lg text-sm outline-none transition bg-white/10 text-white placeholder-slate-500 border focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors[name] ? 'border-red-400' : 'border-white/10'}`}
              />
              {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]?.message}</p>}
            </div>
          ))}

          {errorBanner === 'email_taken' && (
            <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <svg className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 text-xs text-orange-300">
                <span className="font-semibold">Email already registered.</span>{' '}
                <Link href="/login" className="underline font-semibold hover:text-orange-100">Sign in instead →</Link>
              </div>
              <button onClick={() => setErrorBanner(null)} className="text-orange-400/50 hover:text-orange-300 transition">
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
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-400 font-medium hover:text-primary-300 hover:underline transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
