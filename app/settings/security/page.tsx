import Link from 'next/link';
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';

import { requireUser } from '@/lib/currentUser';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';

function getDashboardHref(role: 'BUYER' | 'SELLER' | 'MANAGER') {
  if (role === 'SELLER') return '/seller';
  if (role === 'MANAGER') return '/manager';

  return '/';
}

export default async function SecuritySettingsPage() {
  const user = await requireUser();

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white">
      <div className="mx-auto max-w-[850px] px-6 py-10 lg:px-10">
        <Link
          href={getDashboardHref(user.role)}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="mt-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
            <ShieldCheck size={22} />
          </div>

          <p className="mt-6 text-sm font-medium text-violet-400">Security</p>

          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            Password & Security
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
            Change your account password and protect access to your marketplace
            account.
          </p>
        </div>

        <div className="mt-8">
          <ChangePasswordForm />
        </div>

        <section className="mt-6 rounded-[28px] border border-white/[0.08] bg-[#141419] p-6 lg:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <LockKeyhole size={19} />
            </div>

            <div>
              <h2 className="font-semibold">Secure password change</h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Your current password is verified before any change is accepted.
                After changing it, all other active sessions are revoked.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
