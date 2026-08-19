'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  MessageSquare,
  Inbox,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

type SidebarRole = 'BUYER' | 'SELLER' | 'MANAGER' | null;

type SidebarProps = {
  role?: SidebarRole;
};

type NavigationItem = {
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  label: string;
  href: string;
};

export function Sidebar({ role = null }: SidebarProps) {
  const pathname = usePathname();

  const items = getNavigation(role);

  function isActive(href: string) {
    // Dashboard routes must match exactly.
    // Otherwise /buyer would also be active on /buyer/inquiries.
    if (
      href === '/' ||
      href === '/buyer' ||
      href === '/seller' ||
      href === '/manager'
    ) {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* =========================================================
          DESKTOP SIDEBAR
          ========================================================= */}

      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[84px] border-r border-white/[0.07] bg-[#0b0b0f]/95 px-3 py-4 backdrop-blur-xl md:block">
        {/* Logo */}

        <Link
          href="/"
          title="Marketplace"
          aria-label="N5Deal Marketplace"
          className="mb-8 flex h-12 items-center justify-center"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg font-bold text-black transition duration-200 hover:scale-105">
            N5
          </div>
        </Link>

        {/* Navigation */}

        <nav className="flex flex-col items-center gap-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 ${
                  active
                    ? 'bg-violet-600 text-white shadow-[0_8px_22px_rgba(124,58,237,0.35)]'
                    : 'text-zinc-500 hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />

                {/* Active indicator */}

                {active && (
                  <span className="absolute -right-[13px] h-5 w-[3px] rounded-full bg-violet-400" />
                )}

                {/* Tooltip */}

                <span className="pointer-events-none absolute left-[58px] z-[100] whitespace-nowrap rounded-lg border border-white/10 bg-[#17171d] px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl transition duration-150 group-hover:opacity-100">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* =========================================================
          MOBILE BOTTOM NAVIGATION
          ========================================================= */}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-[#0b0b0f]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
        <div
          className="mx-auto grid max-w-lg"
          style={{
            gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
          }}
        >
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={`group flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 transition ${
                  active ? 'text-violet-400' : 'text-zinc-500 active:text-white'
                }`}
              >
                <div
                  className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-violet-600 text-white shadow-[0_5px_18px_rgba(124,58,237,0.3)]'
                      : 'text-zinc-500'
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />

                  {active && (
                    <span className="absolute -top-[7px] h-[3px] w-5 rounded-full bg-violet-400" />
                  )}
                </div>

                <span
                  className={`w-full truncate text-center text-[9px] font-medium leading-3 ${
                    active ? 'text-violet-300' : 'text-zinc-600'
                  }`}
                >
                  {getMobileLabel(item.label)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

/* =============================================================
   NAVIGATION
   ============================================================= */

function getNavigation(role: SidebarRole): NavigationItem[] {
  /*
   * Guest / public marketplace
   */

  if (!role) {
    return [
      {
        icon: LayoutDashboard,
        label: 'Marketplace',
        href: '/',
      },
      {
        icon: BriefcaseBusiness,
        label: 'Opportunities',
        href: '/opportunities',
      },
      {
        icon: Users,
        label: 'Buyers',
        href: '/buyers',
      },
    ];
  }

  /*
   * BUYER
   */

  if (role === 'BUYER') {
    return [
      {
        icon: LayoutDashboard,
        label: 'Dashboard',
        href: '/buyer',
      },
      {
        icon: BriefcaseBusiness,
        label: 'Opportunities',
        href: '/opportunities',
      },
      {
        icon: Sparkles,
        label: 'AI Matches',
        href: '/matches',
      },
      {
        icon: Inbox,
        label: 'Inquiries',
        href: '/buyer/inquiries',
      },
      {
        icon: MessageSquare,
        label: 'Messages',
        href: '/messages',
      },
    ];
  }

  /*
   * SELLER
   */

  if (role === 'SELLER') {
    return [
      {
        icon: LayoutDashboard,
        label: 'Dashboard',
        href: '/seller',
      },
      {
        icon: BriefcaseBusiness,
        label: 'My Assets',
        href: '/seller/assets',
      },
      {
        icon: Users,
        label: 'Buyers',
        href: '/buyers',
      },
      {
        icon: Inbox,
        label: 'Inquiries',
        href: '/seller/inquiries',
      },
      {
        icon: MessageSquare,
        label: 'Messages',
        href: '/messages',
      },
    ];
  }

  /*
   * MANAGER
   */

  return [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/manager',
    },
    {
      icon: Users,
      label: 'Users',
      href: '/manager/users',
    },
    {
      icon: BriefcaseBusiness,
      label: 'Assets',
      href: '/manager/assets',
    },
    {
      icon: ShieldCheck,
      label: 'Moderation',
      href: '/manager/moderation',
    },
  ];
}

/* =============================================================
   SHORTER LABELS FOR MOBILE
   ============================================================= */

function getMobileLabel(label: string) {
  const labels: Record<string, string> = {
    Dashboard: 'Home',
    Marketplace: 'Home',
    Opportunities: 'Deals',
    'AI Matches': 'Matches',
    Inquiries: 'Inquiries',
    Messages: 'Messages',
    'My Assets': 'Assets',
    Buyers: 'Buyers',
    Users: 'Users',
    Assets: 'Assets',
    Moderation: 'Moderation',
  };

  return labels[label] ?? label;
}
