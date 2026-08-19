'use client';

import { useActionState } from 'react';
import { Building2, Mail, Save, User } from 'lucide-react';

import {
  updateAccount,
  type UpdateAccountState,
} from '@/app/actions/updateAccount';

const initialState: UpdateAccountState = {
  success: false,
  message: '',
};

type Props = {
  user: {
    name: string;
    email: string;
    company: string | null;
    role: 'BUYER' | 'SELLER' | 'MANAGER';
  };
};

export function AccountSettingsForm({ user }: Props) {
  const [state, formAction, pending] = useActionState(
    updateAccount,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Profile */}
      <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
            <User size={21} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Personal information</h2>

            <p className="mt-1 text-sm text-zinc-500">
              Basic information associated with your account.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="text-sm font-medium text-zinc-400">
              Full name
            </label>

            <div className="relative mt-2">
              <User
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                id="name"
                name="name"
                defaultValue={user.name}
                required
                minLength={2}
                maxLength={100}
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#101014] pl-11 pr-4 text-sm text-white outline-none transition focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
              />
            </div>

            {state.errors?.name?.[0] && (
              <p className="mt-2 text-xs text-red-400">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-zinc-400"
            >
              Email address
            </label>

            <div className="relative mt-2">
              <Mail
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                id="email"
                value={user.email}
                readOnly
                className="h-12 w-full cursor-not-allowed rounded-2xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-4 text-sm text-zinc-500 outline-none"
              />
            </div>

            <p className="mt-2 text-xs leading-5 text-zinc-600">
              Email changes are managed separately for account security.
            </p>
          </div>
        </div>
      </section>

      {/* Company */}
      <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Building2 size={21} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Company</h2>

            <p className="mt-1 text-sm text-zinc-500">
              Information displayed across the marketplace.
            </p>
          </div>
        </div>

        <div className="mt-7">
          <label
            htmlFor="company"
            className="text-sm font-medium text-zinc-400"
          >
            Company name
          </label>

          <div className="relative mt-2">
            <Building2
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
            />

            <input
              id="company"
              name="company"
              defaultValue={user.company ?? ''}
              maxLength={120}
              placeholder="Company name"
              className="h-12 w-full rounded-2xl border border-white/10 bg-[#101014] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
            />
          </div>

          {state.errors?.company?.[0] && (
            <p className="mt-2 text-xs text-red-400">
              {state.errors.company[0]}
            </p>
          )}
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-zinc-400">Account role</p>

          <div className="mt-2 inline-flex rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-violet-300">
            {user.role}
          </div>

          <p className="mt-2 text-xs text-zinc-600">
            Account roles cannot be changed from profile settings.
          </p>
        </div>
      </section>

      {/* Result */}
      {state.message && (
        <div
          className={`rounded-2xl border px-5 py-4 text-sm ${
            state.success
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/20 bg-red-500/10 text-red-300'
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={17} />

          {pending ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
