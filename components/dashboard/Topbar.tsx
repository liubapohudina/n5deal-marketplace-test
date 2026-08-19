import Link from 'next/link';
import { Bell, Search } from 'lucide-react';

import { getCurrentUser } from '@/lib/currentUser';
import { UserMenu } from '@/components/auth/UserMenu';

function getNotificationsHref(role: 'BUYER' | 'SELLER' | 'MANAGER') {
  if (role === 'SELLER') {
    return '/seller/inquiries';
  }

  if (role === 'MANAGER') {
    return '/manager';
  }

  return '/messages';
}

export async function Topbar() {
  const user = await getCurrentUser();

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-white/[0.07] bg-[#0b0b0f]/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Search */}
      <form
        action="/opportunities"
        method="GET"
        className="relative w-full max-w-[180px] sm:max-w-sm lg:max-w-xl"
      >
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
        />

        <input
          type="search"
          name="search"
          placeholder="Search opportunities, buyers..."
          className="h-12 w-full rounded-[18px] border border-white/10 bg-[#121217] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-500/70 focus:ring-4 focus:ring-violet-500/10"
        />
      </form>

      {/* Right side */}
      <div className="ml-6 flex shrink-0 items-center gap-3">
        {user ? (
          <>
            <Link
              href={getNotificationsHref(user.role)}
              title="Notifications"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              <Bell size={18} />

              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-violet-500" />
            </Link>

            <UserMenu
              user={{
                name: user.name,
                company: user.company,
                role: user.role,
              }}
            />
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.08] hover:text-white"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
