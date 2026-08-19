'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
  Users,
} from 'lucide-react';

import { z } from 'zod';

import { authClient } from '@/lib/auth-client';
import { completeRegistration } from '@/app/actions/completeRegistration';

type RegistrationRole = 'BUYER' | 'SELLER';

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must contain at least 2 characters.')
      .max(100),

    company: z.string().trim().min(2, 'Company name is required.').max(120),

    email: z.string().trim().email('Enter a valid email address.'),

    password: z
      .string()
      .min(10, 'Password must contain at least 10 characters.')
      .max(128, 'Password is too long.')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
      .regex(/[a-z]/, 'Password must contain a lowercase letter.')
      .regex(/[0-9]/, 'Password must contain a number.'),

    confirmPassword: z.string(),

    role: z.enum(['BUYER', 'SELLER']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type FormErrors = Partial<
  Record<
    'name' | 'company' | 'email' | 'password' | 'confirmPassword' | 'role',
    string
  >
>;

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<RegistrationRole>('BUYER');

  const [name, setName] = useState('');

  const [company, setCompany] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});

  const [serverError, setServerError] = useState('');

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrors({});
    setServerError('');

    const validation = registerSchema.safeParse({
      name,
      company,
      email,
      password,
      confirmPassword,
      role,
    });

    if (!validation.success) {
      const newErrors: FormErrors = {};

      for (const issue of validation.error.issues) {
        const field = issue.path[0] as keyof FormErrors;

        if (field && !newErrors[field]) {
          newErrors[field] = issue.message;
        }
      }

      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      /*
       * Important:
       * role is intentionally NOT
       * sent to Better Auth.
       */
      const signup = await authClient.signUp.email({
        name: validation.data.name,

        email: validation.data.email,

        password: validation.data.password,
      });

      if (signup.error) {
        setServerError(signup.error.message ?? 'Unable to create account.');

        setLoading(false);
        return;
      }

      /*
       * Better Auth autoSignIn creates
       * the session. Now server-side
       * code safely assigns BUYER/SELLER.
       */
      const profileResult = await completeRegistration(
        validation.data.role,
        validation.data.company,
      );

      if (!profileResult.success) {
        setServerError(
          profileResult.message ?? 'Unable to complete registration.',
        );

        setLoading(false);
        return;
      }

      router.push(profileResult.redirectTo ?? '/');

      router.refresh();
    } catch {
      setServerError('Something went wrong. Please try again.');

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] px-6 py-12 text-white">
      <div className="mx-auto w-full max-w-[560px]">
        {/* Logo */}

        <div className="text-center">
          <Link
            href="/"
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-bold text-black"
          >
            N5
          </Link>

          <p className="mt-6 text-sm font-medium text-violet-400">
            N5Deal Marketplace
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
            Create your account
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
            Join the marketplace as an investor or asset owner.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-[30px] border border-white/[0.08] bg-[#141419] p-6 sm:p-8"
        >
          {/* Role */}

          <div>
            <label className="text-sm font-medium text-zinc-300">
              I want to join as
            </label>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('BUYER')}
                className={`rounded-2xl border p-4 text-left transition ${
                  role === 'BUYER'
                    ? 'border-violet-500/50 bg-violet-500/10'
                    : 'border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.05]'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    role === 'BUYER'
                      ? 'bg-violet-500/15 text-violet-300'
                      : 'bg-white/[0.05] text-zinc-500'
                  }`}
                >
                  <Users size={19} />
                </div>

                <p className="mt-4 text-sm font-semibold">Buyer</p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Discover businesses and investment opportunities.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('SELLER')}
                className={`rounded-2xl border p-4 text-left transition ${
                  role === 'SELLER'
                    ? 'border-violet-500/50 bg-violet-500/10'
                    : 'border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.05]'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    role === 'SELLER'
                      ? 'bg-violet-500/15 text-violet-300'
                      : 'bg-white/[0.05] text-zinc-500'
                  }`}
                >
                  <Building2 size={19} />
                </div>

                <p className="mt-4 text-sm font-semibold">Seller</p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Publish assets and connect with buyers.
                </p>
              </button>
            </div>
          </div>

          {/* Name */}

          <div className="mt-6">
            <label className="text-sm text-zinc-400">Full name</label>

            <div className="relative mt-2">
              <User
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Alexander Reed"
                autoComplete="name"
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#101014] pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60"
              />
            </div>

            {errors.name && (
              <p className="mt-2 text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Company */}

          <div className="mt-5">
            <label className="text-sm text-zinc-400">Company</label>

            <div className="relative mt-2">
              <Building2
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                type="text"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Northstar Capital"
                autoComplete="organization"
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#101014] pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60"
              />
            </div>

            {errors.company && (
              <p className="mt-2 text-xs text-red-400">{errors.company}</p>
            )}
          </div>

          {/* Email */}

          <div className="mt-5">
            <label className="text-sm text-zinc-400">Email</label>

            <div className="relative mt-2">
              <Mail
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#101014] pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60"
              />
            </div>

            {errors.email && (
              <p className="mt-2 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Password */}

          <div className="mt-5">
            <label className="text-sm text-zinc-400">Password</label>

            <div className="relative mt-2">
              <LockKeyhole
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a strong password"
                autoComplete="new-password"
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#101014] pl-11 pr-12 text-sm outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 transition hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {errors.password ? (
              <p className="mt-2 text-xs text-red-400">{errors.password}</p>
            ) : (
              <p className="mt-2 text-xs leading-5 text-zinc-600">
                At least 10 characters, including uppercase, lowercase and a
                number.
              </p>
            )}
          </div>

          {/* Confirm password */}

          <div className="mt-5">
            <label className="text-sm text-zinc-400">Confirm password</label>

            <div className="relative mt-2">
              <LockKeyhole
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#101014] pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60"
              />
            </div>

            {errors.confirmPassword && (
              <p className="mt-2 text-xs text-red-400">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Server error */}

          {serverError && (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {serverError}
            </div>
          )}

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 h-12 w-full rounded-2xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Creating account...'
              : `Create ${role === 'BUYER' ? 'Buyer' : 'Seller'} account`}
          </button>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-violet-400 transition hover:text-violet-300"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
