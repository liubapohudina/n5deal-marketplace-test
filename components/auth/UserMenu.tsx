'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';

import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
} from 'lucide-react';

import { authClient } from '@/lib/auth-client';

type UserMenuProps = {
  user: {
    name: string;
    company: string | null;
    role: 'BUYER' | 'SELLER' | 'MANAGER';
  };
};

type MenuPosition = {
  top: number;
  right: number;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function getDashboardHref(role: 'BUYER' | 'SELLER' | 'MANAGER') {
  if (role === 'SELLER') return '/seller';
  if (role === 'MANAGER') return '/manager';
  if (role === 'BUYER') return '/buyer';

  return '/';
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();

  const buttonRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [position, setPosition] = useState<MenuPosition | null>(null);

  function openMenu() {
    const button = buttonRef.current;

    if (!button) return;

    const rect = button.getBoundingClientRect();

    setPosition({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });

    setOpen(true);
  }

  function toggleMenu() {
    if (open) {
      setOpen(false);
      return;
    }

    openMenu();
  }

  async function handleLogout() {
    setLoggingOut(true);

    await authClient.signOut();

    router.push('/');
    router.refresh();
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 transition hover:border-violet-500/30 hover:bg-white/[0.07]"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white shadow-[0_6px_18px_rgba(124,58,237,0.25)]">
          {getInitials(user.name)}
        </div>

        <div className="hidden min-w-0 text-left sm:block">
          <p className="max-w-[180px] truncate text-sm font-medium text-white">
            {user.name}
          </p>

          <div className="mt-0.5 flex items-center gap-2">
            <p className="max-w-[150px] truncate text-xs text-zinc-500">
              {user.company ?? user.role}
            </p>

            <span className="h-1 w-1 rounded-full bg-zinc-700" />

            <span className="text-[10px] font-medium uppercase tracking-wider text-violet-400">
              {user.role}
            </span>
          </div>
        </div>

        <ChevronDown
          size={15}
          className={`hidden text-zinc-500 transition sm:block ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open &&
        position &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Close user menu"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[9998] cursor-default"
            />

            <div
              className="fixed z-[9999] w-[260px] rounded-2xl border border-white/10 bg-[#141419] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
              style={{
                top: position.top,
                right: position.right,
              }}
            >
              <div className="mb-2 border-b border-white/[0.07] px-3 py-3">
                <p className="truncate text-sm font-semibold text-white">
                  {user.name}
                </p>

                <p className="mt-1 truncate text-xs text-zinc-500">
                  {user.company ?? user.role}
                </p>
              </div>

              <Link
                href={getDashboardHref(user.role)}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <LayoutDashboard size={17} />
                Dashboard
              </Link>

              <Link
                href="/settings/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <Settings size={17} />
                Account settings
              </Link>

              <Link
                href="/settings/security"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <ShieldCheck size={17} />
                Change password
              </Link>

              <div className="my-2 h-px bg-white/[0.08]" />

              <button
                type="button"
                disabled={loggingOut}
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
              >
                <LogOut size={17} />

                {loggingOut ? 'Logging out...' : 'Log out'}
              </button>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
