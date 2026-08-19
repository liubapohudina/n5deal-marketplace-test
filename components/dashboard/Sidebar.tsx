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
} from 'lucide-react';

type SidebarRole = 'BUYER' | 'SELLER' | 'MANAGER' | null;

type SidebarProps = {
  role?: SidebarRole;
};

export function Sidebar({ role = null }: SidebarProps) {
  const pathname = usePathname();

  const items = getNavigation(role);

  function isActive(href: string) {
    if (
      href === '/' ||
      href === '/buyer' ||
      href === '/seller' ||
      href === '/manager'
    ) {
      return pathname === href;
    }

    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-[84px] border-r border-white/[0.07] bg-[#0b0b0f]/95 px-3 py-4 backdrop-blur-xl">
      {/* Logo */}
      <Link
        href="/"
        title="Marketplace"
        className="mb-8 flex h-12 items-center justify-center"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg font-bold text-black transition hover:scale-105">
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
              key={item.label}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 ${
                active
                  ? 'bg-violet-600 text-white shadow-[0_8px_22px_rgba(124,58,237,0.35)]'
                  : 'text-zinc-500 hover:bg-white/[0.07] hover:text-white'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />

              {active && (
                <span className="absolute -right-[13px] h-5 w-[3px] rounded-full bg-violet-400" />
              )}

              {/* Tooltip */}
              <span className="pointer-events-none absolute left-[58px] z-[100] whitespace-nowrap rounded-lg border border-white/10 bg-[#17171d] px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl transition group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function getNavigation(role: SidebarRole) {
  /*
   * Guest/public marketplace
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
   * Buyer
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
   * Seller
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
   * Manager
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
      icon: MessageSquare,
      label: 'Moderation',
      href: '/manager/moderation',
    },
  ];
}
