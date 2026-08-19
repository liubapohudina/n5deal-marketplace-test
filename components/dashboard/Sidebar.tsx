'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  MessageSquare,
  Settings,
  Sparkles,
} from 'lucide-react';

const items = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
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
  {
    icon: MessageSquare,
    label: 'Messages',
    href: '/messages',
  },
  {
    icon: Sparkles,
    label: 'AI Matches',
    href: '/matches',
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/settings',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-[84px] border-r border-white/[0.07] bg-[#0b0b0f]/95 px-3 py-4 backdrop-blur-xl">
      <Link href="/" className="mb-8 flex h-12 items-center justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg font-bold text-black">
          N5
        </div>
      </Link>

      <nav className="flex flex-col items-center gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
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
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
