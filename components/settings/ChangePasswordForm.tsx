'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
} from 'lucide-react';

import { z } from 'zod';

import { authClient } from '@/lib/auth-client';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),

    newPassword: z
      .string()
      .min(10, 'Password must contain at least 10 characters.')
      .max(128, 'Password must not exceed 128 characters.')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
      .regex(/[a-z]/, 'Password must contain a lowercase letter.')
      .regex(/[0-9]/, 'Password must contain a number.'),

    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from your current password.',
    path: ['newPassword'],
  });

type FieldErrors = Partial<
  Record<'currentPassword' | 'newPassword' | 'confirmPassword', string>
>;

export function ChangePasswordForm() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');

  const [newPassword, setNewPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});

  const [serverError, setServerError] = useState('');

  const [success, setSuccess] = useState('');

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrors({});
    setServerError('');
    setSuccess('');

    const validation = passwordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      const nextErrors: FieldErrors = {};

      for (const issue of validation.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;

        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }

      setErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.changePassword({
        currentPassword: validation.data.currentPassword,

        newPassword: validation.data.newPassword,

        revokeOtherSessions: true,
      });

      if (result.error) {
        setServerError(result.error.message ?? 'Unable to change password.');

        setLoading(false);
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setSuccess(
        'Password changed successfully. Other active sessions have been signed out.',
      );

      router.refresh();
    } catch {
      setServerError('Unable to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-6 lg:p-8"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
          <KeyRound size={21} />
        </div>

        <div>
          <h2 className="text-lg font-semibold">Change password</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Enter your existing password before choosing a new one.
          </p>
        </div>
      </div>

      {/* Current password */}
      <div className="mt-7">
        <label
          htmlFor="currentPassword"
          className="text-sm font-medium text-zinc-400"
        >
          Current password
        </label>

        <div className="relative mt-2">
          <LockKeyhole
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
          />

          <input
            id="currentPassword"
            type={showCurrentPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter current password"
            className="h-12 w-full rounded-2xl border border-white/10 bg-[#101014] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
          />

          <button
            type="button"
            onClick={() => setShowCurrentPassword((current) => !current)}
            aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 transition hover:text-white"
          >
            {showCurrentPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        {errors.currentPassword && (
          <p className="mt-2 text-xs text-red-400">{errors.currentPassword}</p>
        )}
      </div>

      {/* New password */}
      <div className="mt-5">
        <label
          htmlFor="newPassword"
          className="text-sm font-medium text-zinc-400"
        >
          New password
        </label>

        <div className="relative mt-2">
          <KeyRound
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
          />

          <input
            id="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            placeholder="Create a new password"
            className="h-12 w-full rounded-2xl border border-white/10 bg-[#101014] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
          />

          <button
            type="button"
            onClick={() => setShowNewPassword((current) => !current)}
            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 transition hover:text-white"
          >
            {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        {errors.newPassword ? (
          <p className="mt-2 text-xs text-red-400">{errors.newPassword}</p>
        ) : (
          <PasswordRequirements password={newPassword} />
        )}
      </div>

      {/* Confirm */}
      <div className="mt-5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-zinc-400"
        >
          Confirm new password
        </label>

        <div className="relative mt-2">
          <KeyRound
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
          />

          <input
            id="confirmPassword"
            type={showNewPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            placeholder="Repeat new password"
            className="h-12 w-full rounded-2xl border border-white/10 bg-[#101014] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
          />
        </div>

        {errors.confirmPassword && (
          <p className="mt-2 text-xs text-red-400">{errors.confirmPassword}</p>
        )}
      </div>

      {serverError && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {serverError}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        >
          <Check size={17} className="mt-0.5 shrink-0" />

          {success}
        </div>
      )}

      <div className="mt-7 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 min-w-[170px] items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <KeyRound size={17} />
              Change password
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function PasswordRequirements({ password }: { password: string }) {
  const rules = [
    {
      label: '10+ characters',
      valid: password.length >= 10,
    },
    {
      label: 'Uppercase letter',
      valid: /[A-Z]/.test(password),
    },
    {
      label: 'Lowercase letter',
      valid: /[a-z]/.test(password),
    },
    {
      label: 'Number',
      valid: /[0-9]/.test(password),
    },
  ];

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {rules.map((rule) => (
        <div
          key={rule.label}
          className={`flex items-center gap-2 text-xs ${
            rule.valid ? 'text-emerald-400' : 'text-zinc-600'
          }`}
        >
          <div
            className={`flex h-4 w-4 items-center justify-center rounded-full ${
              rule.valid ? 'bg-emerald-500/10' : 'bg-white/[0.04]'
            }`}
          >
            {rule.valid && <Check size={10} />}
          </div>

          {rule.label}
        </div>
      ))}
    </div>
  );
}
