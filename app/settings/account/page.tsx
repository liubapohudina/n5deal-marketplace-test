import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { requireUser } from '@/lib/currentUser';
import { AccountSettingsForm } from '@/components/settings/AccountSettingsForm';

function getDashboardHref(role: 'BUYER' | 'SELLER' | 'MANAGER') {
  if (role === 'SELLER') return '/seller';
  if (role === 'MANAGER') return '/manager';

  return '/';
}

export default async function AccountSettingsPage() {
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
          <p className="text-sm font-medium text-violet-400">Account</p>

          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            Account settings
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
            Manage your personal information and company details.
          </p>
        </div>

        <div className="mt-8">
          <AccountSettingsForm
            user={{
              name: user.name,
              email: user.email,
              company: user.company,
              role: user.role,
            }}
          />
        </div>
      </div>
    </main>
  );
}
